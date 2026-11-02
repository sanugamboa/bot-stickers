// Importamos las herramientas de pruebas
import test from 'node:test';
import assert from 'node:assert/strict';

// Importamos Sharp
import sharp from 'sharp';

// Importamos el procesador
import { procesarImagen } from '../src/services/imageProcessor.js';

// Función auxiliar para generar una imagen de prueba
async function generarImagen() {
    return await sharp({
        create: {
            width: 128,
            height: 96,
            channels: 3,
            background: {
                r: 120,
                g: 80,
                b: 200
            }
        }
    })
    .png()
    .toBuffer();
}

// Prueba 1: comprobar la conversión a WebP
test('Debe convertir correctamente la imagen a WebP', async () => {

    const imagen = await generarImagen();
    const resultado = await procesarImagen(imagen);

    const metadatos = await sharp(resultado.buffer).metadata();

    assert.equal(metadatos.format, 'webp');
    assert.equal(resultado.formato, 'webp');
});

// Prueba 2: comprobar las dimensiones finales
test('Debe generar imágenes de 512 x 512 píxeles', async () => {

    const imagen = await generarImagen();
    const resultado = await procesarImagen(imagen);

    const metadatos = await sharp(resultado.buffer).metadata();

    assert.equal(metadatos.width, 512);
    assert.equal(metadatos.height, 512);
});

// Prueba 3: comprobar el peso máximo
test('No debe superar los 100 KB', async () => {

    const imagen = await generarImagen();
    const resultado = await procesarImagen(imagen);

    const pesoMaximo = 100 * 1024;

    assert.ok(resultado.buffer.length <= pesoMaximo);
    assert.ok(resultado.peso <= pesoMaximo);
});

// Prueba 4: rechazar archivos inválidos
test('Debe rechazar archivos que no sean imágenes válidas', async () => {

    const archivoInvalido = Buffer.from('Esto no es una imagen');

    await assert.rejects(
        procesarImagen(archivoInvalido)
    );
});

// Prueba 5: rechazar formatos no permitidos
test('Debe rechazar imágenes con formatos no permitidos', async () => {

    const imagenSVG = Buffer.from(`
        <svg width="100" height="100"
        xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="red"/>
        </svg>
    `);

    await assert.rejects(
        procesarImagen(imagenSVG)
    );
});