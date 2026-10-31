//Importacion de bayleis
import makeWASocket, { DisconnectReason, useMultiFileAuthState } from "@whiskeysockets/baileys";

//Importacion de Pino para los registros
import pino from "pino";

//Importacion de Qr para mostrarlo en la terminal
import qrcode from 'qrcode-terminal';

//Modulo que maneja la imagen
import { manejarMensaje } from './handlers/messages.js';

//Funcion principal de conexion a whatsapp
async function conectarWhatsapp() {
  
  //Variable que carga o crea las credeciales de sesion
  const { state, saveCreds } = await useMultiFileAuthState('./sessions');

  //varaiable que Crea al cliente en whatsapp
  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' })
  });

  //con esto activamos el detector de mensajes
  manejarMensaje(sock, pino({ level: 'silent' }));

  //Aqui se guardan los cambios de las credenciales
  sock.ev.on('creds.update', saveCreds);

  //Aqui se escuchan los cambios de conexion
  sock.ev.on('connection.update', async(update) => {

    const { connection, lastDisconnect, qr } = update;

    //si whatsapp genera un codigo qr, aqui lo mostramos
    if (qr) {
      console.log('Escanea el codigo Qr con whatsapp:');
      qrcode.generate(qr, { small: true })
    }

    // si la conexion se establece correctamente se muesra este mensaje
    if (connection === 'open') {
      console.log('whatsapp conectado correctamente');
    }

    //si a conexion se cierra
    if (connection === 'close') {

      const statusCode = lastDisconnect?.error?.output?.statusCode;

      //aqui comprobamos si la sesion fue cerrada correctamente
      const sesionCerrada = statusCode === DisconnectReason.loggedOut;

      if (sesionCerrada) {
        console.log('Sesión cerrada. Debes vincular nuevamente WhatsApp');
        return;
      }

      //aqui intentamos nuevamente establecer la conexion
      console.log('Conexion perdida, reconectando...');
      await conectarWhatsapp();
    }
  });
}

//Iniciamos el bot
conectarWhatsapp();