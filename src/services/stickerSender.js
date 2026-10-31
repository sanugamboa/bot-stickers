//importacion de las herramientas que leen los archivos
import { readFile } from 'node:fs/promises';

// esta la funcion que se encarga de enviar los stickers
export async function enviarSticker(sock, chatId, rutaArchivo) {

  try {

    //esta variable lee el archivo que se guardo en el disco
    const sticker = await readFile(rutaArchivo);

    //esta funcion comprueba que el archivo no este vacio
    if (sticker.length === 0) {
      throw new Error('el archivo esta vacio');
    }

    //esta funcion envia el sticker al chat
    const respuesta = await sock.sendMessage(chatId, {
      sticker: sticker
    });

    //aqui comprobamos que si haya devuelto una respuesta
    if(!respuesta?.key?.id) {
      throw new Error('WhatsApp no devolvio el identificador del mensaje.');
    }

    //confirmacion del envio
    console.log('Sticker enviado correctamente');
    console.log('ID del mensaje: ', respuesta.key.id);

    //respuesta de whatsapp
    return respuesta;
  } catch (error) {

    //aqu capturamos errores que salgan durante el envio
    console.error('Error al enviar el sticker: ', error);

    throw error;

  }
} 