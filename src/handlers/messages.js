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

      try {

        //se ignoran los mensajes enviados por el propio bot
        if (mensaje.key.fromMe) continue;

        //se ignoran los mensajes de estado de whatsapp
        if (mensaje.key.remoteJid === 'status@broadcast') continue;

        //aqui se obtiene el contenido de la imagen
        const contenido = normalizeMessageContent(mensaje.message);

        //aqui se comprueba si el mensaje contiene una imagen
        const imagen = contenido?.imageMessage;

        //esta funcion ignora el mensaje si no contiene una imagen
        if (!imagen) {
          console.log('mensaje ignorado: no contiene una imagen');
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

        //aqui enviamos la imagen al modulo de procesamiento
        const resultado = await procesarImagen(archivo);

        //aqui se crean el nombre unico para el archivo
        const nombreArchivo = `${randomUUID()}.webp`;

        //ruta donde se guradaran los mensajes
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

      } catch (error) {
        //esta funcion captura errores durante el proceso
        console.error('error al procesar el mensaje: ', error);
      } finally {

        //esta funcion elimina el archivo temporal 
        if (rutaArchivo) {

          try {

            await rm(rutaArchivo, { force: true });

            console.log('archivo eliminado correctamente');
          } catch (error) {
            console.log('error al eliminiar archivo: ', error);
          }
        }
      }
    }
  });
}