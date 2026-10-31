//IMportacion de sharp para procesar las imagenes
import sharp from "sharp";

//esta se funcion se encarga de procesar y optimizar las imagenes
export async function procesarImagen(archivo) {

  //esta variable define las dimensiones del sticker
  const dimensiones = 512;

  // Obtenemos los metadatos de la imagen original.
const metadatosOriginales = await sharp(archivo).metadata();

//aqui comprobamos que la imagen tenga dimensiones validas
if (!metadatosOriginales.width || !metadatosOriginales.height) {
  throw new Error('La imagen no tine dimenciones validas');
}

//aqui comprobamos que el formato de la imagen sea valido
const formatosPermiditidos = ['jpeg', 'png', 'webp'];

if (!formatosPermiditidos.includes(metadatosOriginales.format)) {
  throw new Error('La imagen tien un formato no valido');
}

  // Comprobar que Sharp pueda leer los datos de la imagen
  await sharp(archivo, {
    failOn: 'error'
  }).stats();

console.log('Dimensiones originales:',
    metadatosOriginales.width,
    'x',
    metadatosOriginales.height
);

  //esta variable guarda el peso maximo permitido para las imagenes
  const pesoMaximo = 100 * 1024;

  //niveles de calidad a probar
  const nivelesCalidad = [80, 70, 60, 50, 40, 35];

  //variable donde se almacena la imagen procesada
  let imagenProcesada;

  //variable donde se almacena la calidad usada
  let calidadUtilizada;

  //esta funcion recorre los niveles de cantidad
  for (const calidad of nivelesCalidad) {

    //aqui se procesan las imagenes para que se convirtan a webP
    imagenProcesada = await sharp(archivo)
    //se corrige la orientacion segun los metodos EXIF
    .rotate()

    //aqui se adapta la imagen al lienzo cuadrado
    .resize(dimensiones, dimensiones, {
      fit: 'contain',
      background: {
        r: 255,
        g: 255,
        b: 255,
        alpha: 1
      }
    })

    //aqui se optimiza y se vuelve webP
    .webp({
      quality: calidad,
      effort: 6
    })

    //esta funcion obtiene el resultado en memoria
    .toBuffer();

    //aqui se guarda el nivel de calidad usado
    calidadUtilizada = calidad;

    //aqui se comprueba que la imagen cumpla el peso maximo
    if (imagenProcesada.length <= pesoMaximo) {
      break;
    }
  }

  //esta funcion dice si la imagen supero el peso maximo
  if (imagenProcesada.length > pesoMaximo) {
    throw new Error ('No fue posible reducir la imagen al peso maximo permitido');
  }

  // Obtenemos los metadatos de la imagen procesada.
const metadatosFinales = await sharp(imagenProcesada).metadata();

console.log('Dimensiones finales:',
    metadatosFinales.width,
    'x',
    metadatosFinales.height
);

console.log('Formato final:', metadatosFinales.format);

  //esta funcion devuelve la imagen procesada
  return {
    buffer: imagenProcesada,
    peso: imagenProcesada.length,
    calidad: calidadUtilizada,
    dimensiones: dimensiones,
    formato: 'webp'
  };
}