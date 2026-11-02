//importacion de la funcion para guardar archivos multimedia
import { downloadMediaMessage, normalizeMessageContent } from "@whiskeysockets/baileys";

//importacion de las herramientas para trabajr con los archivos
import { mkdir, writeFile, rm } from 'node:fs/promises';

//Importacion de la herramientas que manejan las rutas 
import path from 'node:path';

//Importacion de la funcion que genera identificadores unicos
import { randomUUID } from "node:crypto";

//importacion del modulo que procesa las imagenes
import { procesarImagen } from "../services/imageProcessor.js";

//importacion del modulo que envia los stickers
import { enviarSticker } from "../services/stickerSender.js";

//importacion del modulo que controla las solicitudes
import { verificarLimite } from "../services/rateLimiter.js";

//aqui se define el tamaño de mb permitido de las imagenes
const TAMANO_MAXIMO = 10 * 1024 * 1024;

//aqui se registran los mensajes que estan en medio del proceso o ya fueron procesados
const mensajesProcesados = new Set();
const mensajesEnProceso = new Set();

//aqui se define el numero de procesos simultaneos
const MAX_PROCESOS_SIMULTANEOS = 3;

//aqui se registran los procesos activos
let procesosActivos = 0;

//aqui se listan las imagenes pendientes
const colaProcesamiento = [];

//funcion para adquirir un proceso de almacenamiento
async function adquirirTurno() {

  //si hay espacio disponible lo ocupamos
  if (procesosActivos < MAX_PROCESOS_SIMULTANEOS) {
    procesosActivos++;
    return;
  }

  //si no hay espacio, que espere en la cola
  await new Promise(resolve => {
    colaProcesamiento.push(resolve);
  });
}

//funcion que libera un espacio de almacenamiento
function liberarTurno() {

  //aqui se comprueba si hay imagenes esperando
  if (colaProcesamiento.length > 0) {

    //aqui se da el espacio de almacenamiento a la siguiente imagen
    const siguiente = colaProcesamiento.shift();
    siguiente();
  } else {

    //si no hay imagenes esperando liberamos el espacio
    procesosActivos--;
  }
}

//Esta es la funcion que se encarga de escuchar y procesar los mensajes
export async function manejarMensaje(sock, logger) {

  //aqui escuchamos los mensajes nuevos que llegan de whatsapp
  sock.ev.on('messages.upsert', async ({ messages, type }) => {

    //aqui se ignoran eventos que no sean iguales a mensajes nuevos
    if (type !== 'notify') return;

    //esta funcion recorre todos los mensajes recibidos en el evento
    for (const mensaje of messages) {

      //variable que almacena la ruta temporal
      let rutaArchivo;

      let turnoAdquirido = false;
      let idMensaje;

      try {

        //se ignoran los mensajes enviados por el propio bot
        if (mensaje.key.fromMe) continue;

        //se ignoran los mensajes de estado de whatsapp
        if (mensaje.key.remoteJid === 'status@broadcast') continue;

        //aqui se obtiene el identificador unico del mensaje
        idMensaje = mensaje.key.id;

        //aqui se comprueba si el mensaje ya fue procesado o esta en proceso
        if (mensajesProcesados.has(idMensaje) || mensajesEnProceso.has(idMensaje)) {
          console.log('mensaje duplicado ignorado: ', idMensaje);
          continue;
        }

        //aqui se obtiene el contenido de la imagen
        const contenido = normalizeMessageContent(mensaje.message);

        //aqui se comprueba si el mensaje contiene una imagen
        const imagen = contenido?.imageMessage;

        //esta funcion ignora el mensaje si no contiene una imagen
        if (!imagen) {
          console.log('mensaje ignorado: no contiene una imagen');
          continue;
        }

        //registramos el mensaje para evitar procesarlo simultaneamente
        mensajesEnProceso.add(idMensaje);

        //identificamos al usuario que envio la imagen
        const usuario = mensaje.key.participant || mensaje.key.remoteJid;

        console.log('Usuario identificado:', usuario);

        //Verificamos el limite de solicitudes
        if (!verificarLimite(usuario)) {
          console.log('Limite de imagenes alcanzado para: ', usuario);
          continue;
        }

        //aqui se comprueba el tamaño de la imagen que nos informa whatsapp
        if (imagen.fileLength && Number(imagen.fileLength) > TAMANO_MAXIMO) {
          console.log('imagen rechazada, excede las 10 mb');
          continue;
        }

        //aqui identificamos el formato de la imagen
        const mimeType = imagen.mimetype || 'image/jpeg';

        //en esta variable se relacionan las extensiones con sus formatos
        const formatosPermitidos = [
          'image/jpeg',
          'image/png',
          'image/webp'
        ];

        //aqui se comprueba que el formato sea de los permitidos
        if (!formatosPermitidos.includes(mimeType)) {
          console.log('formato no permitido: ', mimeType);
          continue;
        }

        //aqui se solicita el turno para procesar la imagen
        await adquirirTurno();
        turnoAdquirido = true;

        console.log('Procesos activos: ', procesosActivos);
        console.log('imagenes en espera: ', colaProcesamiento.length);

        console.log('Imagen recibida existosamente');

        //aqui descargamos la imagen original
        const archivo = await downloadMediaMessage(
          mensaje,
          'buffer',
          {},
          {
            logger,
            reuploadRequest: sock.updateMediaMessage
          }
        );

        //aqui se comprueba el tamaño real de las imagenes
        if (archivo.length > TAMANO_MAXIMO) {
          console.log('archivo rechazado, supera las 10mb');
          continue;
        }

        //aqui enviamos la imagen al modulo de procesamiento
        const resultado = await procesarImagen(archivo);

        //aqui se crean el nombre unico para el archivo
        const nombreArchivo = `${randomUUID()}.webp`;

        //ruta donde se guardaran los mensajes
        const carpeta = path.resolve('media/temp');

        //Se crea la carpeta si es que no existe
        await mkdir(carpeta, { recursive: true });

        //aqui se construye la ruta del archivo
        rutaArchivo = path.join(carpeta, nombreArchivo);

        //con esta funcion se guarda el archivo en el disco
        await writeFile(rutaArchivo, resultado.buffer);

        console.log('Sticker preparado correctamente');

        //aqui se envia el sticker
        await enviarSticker(
          sock,
          mensaje.key.remoteJid,
          rutaArchivo
        );

        //registramos el mensaje como procesado correctamente
        mensajesProcesados.add(idMensaje);

        //mantenemos un maximo de 1000 identificadores
        if (mensajesProcesados.size > 1000) {
          const primerId = mensajesProcesados.values().next().value;
          mensajesProcesados.delete(primerId);
        }

      } catch (error) {
        //esta funcion captura errores durante el proceso
        console.error('error al procesar el mensaje: ', error);

      } finally {

        //eliminamos el mensaje del registro de procesos activos
        if (idMensaje) {
          mensajesEnProceso.delete(idMensaje);
        }

        //esta funcion elimina el archivo temporal
        if (rutaArchivo) {

          try {

            await rm(rutaArchivo, { force: true });

            console.log('archivo eliminado correctamente');
          } catch (error) {
            console.log('error al eliminiar archivo: ', error);
          }
        }

        //aqui se libera el turno de procesamiento
        if (turnoAdquirido) {
          liberarTurno();
          console.log('Turno de procesamiento liberado');
        }
      }
    }
  });
}