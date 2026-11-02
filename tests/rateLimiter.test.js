// Importamos las herramientas de pruebas de Node.js
import test from 'node:test';
import assert from 'node:assert/strict';

// Importamos la función que vamos a probar
import { verificarLimite } from '../src/services/rateLimiter.js';

// Prueba 1: permitir solicitudes dentro del límite
test('Debe permitir las primeras 100 imágenes', () => {

    const usuario = 'usuario-prueba-1';

    for (let i = 0; i < 100; i++) {
        assert.equal(verificarLimite(usuario), true);
    }
});

// Prueba 2: rechazar solicitudes que superen el límite
test('Debe rechazar la imagen número 101', () => {

    const usuario = 'usuario-prueba-2';

    for (let i = 0; i < 100; i++) {
        verificarLimite(usuario);
    }

    assert.equal(verificarLimite(usuario), false);
});

// Prueba 3: mantener separados los registros de usuarios
test('Cada usuario debe tener su propio límite', () => {

    const usuarioA = 'usuario-prueba-3';
    const usuarioB = 'usuario-prueba-4';

    for (let i = 0; i < 100; i++) {
        verificarLimite(usuarioA);
    }

    assert.equal(verificarLimite(usuarioA), false);
    assert.equal(verificarLimite(usuarioB), true);
});

// Prueba 4: reiniciar el límite después de 60 segundos
test('Debe reiniciar el límite después de 60 segundos', (t) => {

    const usuario = 'usuario-prueba-5';

    // Activamos el reloj simulado
    t.mock.timers.enable({
        apis: ['Date'],
        now: 1000
    });

    // Consumimos las 100 solicitudes
    for (let i = 0; i < 100; i++) {
        verificarLimite(usuario);
    }

    // Comprobamos que la solicitud 101 sea rechazada
    assert.equal(verificarLimite(usuario), false);

    // Avanzamos 60 segundos
    t.mock.timers.tick(60000);

    // Comprobamos que el usuario pueda volver a solicitar
    assert.equal(verificarLimite(usuario), true);
});