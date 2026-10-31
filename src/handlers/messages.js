//importacion de la funcion para guardar archivos multimedia
import { downloadMediaMessage, normalizeMessageContent } from "@whiskeysockets/baileys";

//importacion de las herramientas para trabajr con los archivos
import { mkdir, writeFile } from 'node:fs/promises';

//Importacion de la herramientas que manejan las rutas 
import path from 'node:path';

//Importacion de la funcion que genera identificadores unicos
import { randomUUID } from "node:crypto";

//Esta es la funcion que se encarga de escuchar y procesar los mensajes
export async function manejarMensaje(sock, logger) {

  //aqui escuchamos los mensajes nuevos que llegan de whatsapp
  sock.ev.on('messages.upsert', async ({ messages, type }) => {

    //aqui se ignoran eventos que no sean iguales a mensajes nuevos
    if (type !== 'notify') return;

    //esta funcion recorre todos los mensajes recibidos en el evento
    for (const mensaje of messages) {

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

        console.log('Imagen recibida correctamente.');

        //aqui se descarga la imagen y se almacena en la memoria
        const archivo = await downloadMediaMessage(
          mensaje,
          'buffer',
          {},
          {
            logger,
            reuploadRequest: sock.updateMediaMessage
          }
        );

        //aqui identificamos el formato de la imagen
        const mimeType = imagen.mimetype || 'image/jpeg';

        //en esta variable se relacionan las extensiones con sus formatos
        const extensiones = {
          'image/jpeg': '.jpg',
          'image/png': '.png',
          'image/webp': '.webp'
        };

        //aqui obtenemos la extension correspondiente
        const extension = extensiones[mimeType];

        //se ignoran los formatos que aun no son compatibles
        if (!extension) {
          console.log('Formato no compatible: ', mimeType);
          continue;
        }

        //aqui se crean el nombre unico para el archivo
        const nombreArchivo = `${randomUUID()}${extension}`;

        //ruta donde se guradaran los mensajes
        const carpeta = path.resolve('media/temp');

        //Se crea la carpeta si es que no existe
        await mkdir(carpeta, { recursive: true });

        //aqui se construye la ruta del archivo
        const rutaArchivo = path.join(carpeta, nombreArchivo);

        //con esta funcion se guarda el archivo en el disco
        await writeFile(rutaArchivo, archivo);

        console.log('imagen guardada correctamente');
        console.log('archivo: ', rutaArchivo);


      } catch (error) {
        //esta funcion captura errores durante el proceso
        console.error('error al procesar el mensaje: ', error);
      }
    }
  });
}