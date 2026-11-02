// Importamos las herramientas de pruebas
import test from 'node:test';
import assert from 'node:assert/strict';

// Importamos herramientas para trabajar con archivos
import { writeFile, unlink } from 'node:fs/promises';

// Importamos la función que vamos a probar
import { enviarSticker } from '../src/services/stickerSender.js';

// Prueba 1: enviar correctamente un sticker
test('Debe enviar el sticker al chat indicado', async () => {

    const rutaArchivo = './tests/sticker-prueba.webp';
    const contenidoSticker = Buffer.from('imagen-de-prueba');

    await writeFile(rutaArchivo, contenidoSticker);

    const sock = {
        sendMessage: async (chatId, contenido) => {
            assert.equal(chatId, 'chat-prueba');
            assert.deepEqual(contenido.sticker, contenidoSticker);

            return {
                key: {
                    id: 'mensaje-123'
                }
            };
        }
    };

    try {
        const respuesta = await enviarSticker(
            sock,
            'chat-prueba',
            rutaArchivo
        );

        assert.equal(respuesta.key.id, 'mensaje-123');
    } finally {
        await unlink(rutaArchivo);
    }
});

// Prueba 2: rechazar archivos vacíos
test('Debe rechazar archivos vacíos', async () => {

    const rutaArchivo = './tests/sticker-vacio.webp';

    await writeFile(rutaArchivo, Buffer.alloc(0));

    const sock = {
        sendMessage: async () => {
            throw new Error('No debería intentar enviar el archivo');
        }
    };

    try {
        await assert.rejects(
            enviarSticker(sock, 'chat-prueba', rutaArchivo),
            /el archivo esta vacio/
        );
    } finally {
        await unlink(rutaArchivo);
    }
});

// Prueba 3: detectar respuestas sin identificador
test('Debe rechazar respuestas sin identificador de mensaje', async () => {

    const rutaArchivo = './tests/sticker-sin-id.webp';

    await writeFile(rutaArchivo, Buffer.from('imagen-de-prueba'));

    const sock = {
        sendMessage: async () => {
            return {
                key: {}
            };
        }
    };

    try {
        await assert.rejects(
            enviarSticker(sock, 'chat-prueba', rutaArchivo),
            /WhatsApp no devolvio el identificador/
        );
    } finally {
        await unlink(rutaArchivo);
    }
});

// Prueba 4: propagar errores del envío
test('Debe propagar los errores de WhatsApp', async () => {

    const rutaArchivo = './tests/sticker-error.webp';

    await writeFile(rutaArchivo, Buffer.from('imagen-de-prueba'));

    const sock = {
        sendMessage: async () => {
            throw new Error('Error simulado de WhatsApp');
        }
    };

    try {
        await assert.rejects(
            enviarSticker(sock, 'chat-prueba', rutaArchivo),
            /Error simulado de WhatsApp/
        );
    } finally {
        await unlink(rutaArchivo);
    }
});