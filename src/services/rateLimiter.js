// Configuración del límite de solicitudes
const MAX_IMAGENES = 100;
const VENTANA_TIEMPO = 60 * 1000;

// Registro de solicitudes por usuario
const solicitudesUsuarios = new Map();

// Función para verificar el límite de solicitudes
export function verificarLimite(usuario) {
    const ahora = Date.now();

    const registro = solicitudesUsuarios.get(usuario);

    if (!registro || ahora - registro.inicio >= VENTANA_TIEMPO) {
        solicitudesUsuarios.set(usuario, {
            inicio: ahora,
            cantidad: 1
        });

        return true;
    }

    if (registro.cantidad >= MAX_IMAGENES) {
        return false;
    }

    registro.cantidad++;

    return true;
}