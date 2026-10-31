# WhatsApp Sticker Bot

**Versión:** 1.0.0  
**Estado:** Planificación  
**Tipo de proyecto:** Bot de automatización para WhatsApp  
**Lenguaje principal:** JavaScript

---

## 1. Descripción del proyecto

WhatsApp Sticker Bot es un bot automatizado que permite convertir fotografías enviadas por los usuarios a través de WhatsApp en stickers compatibles con la plataforma.

El objetivo principal es ofrecer una experiencia sencilla, rápida y automática: el usuario envía una imagen y el bot la procesa para devolverla como sticker en el mismo chat.

## 2. Funcionalidades

### 2.1. Funcionalidades principales (MVP)

Estas funcionalidades conforman la primera versión del proyecto.

| ID | Funcionalidad | Descripción |
|---|---|---|
| F01 | Conexión con WhatsApp | Establecer conexión entre el bot y una cuenta de WhatsApp. |
| F02 | Recepción de mensajes | Detectar y recibir mensajes entrantes. |
| F03 | Detección de imágenes | Identificar fotografías y archivos de imagen compatibles. |
| F04 | Descarga de imágenes | Obtener temporalmente los archivos multimedia recibidos. |
| F05 | Procesamiento | Redimensionar y adaptar las imágenes a las dimensiones requeridas. |
| F06 | Conversión | Convertir las imágenes al formato WebP. |
| F07 | Generación de stickers | Generar archivos compatibles con el formato de stickers de WhatsApp. |
| F08 | Envío automático | Devolver el sticker al chat donde se recibió la fotografía. |
| F09 | Manejo de errores | Informar al usuario cuando una imagen no pueda procesarse. |
| F10 | Limpieza de archivos | Eliminar los archivos temporales después del procesamiento. |

### 2.2. Funcionalidades futuras

Se contemplan para versiones posteriores:

- Eliminación automática del fondo de las imágenes.
- Incorporación de bordes blancos.
- Añadir texto personalizado a los stickers.
- Generación de stickers animados.
- Creación y administración de paquetes de stickers.
- Estadísticas de uso y actividad.
- Configuración personalizada por usuario.

Estas funcionalidades no forman parte del alcance inicial del MVP.

---

## 3. Limitaciones del proyecto

Para mantener un desarrollo sencillo, rápido y controlado, se establecen las siguientes limitaciones:

### 3.1. Limitaciones técnicas

- Los stickers estáticos se generarán en formato WebP.
- Las imágenes deberán adaptarse a un lienzo máximo de 512 × 512 píxeles.
- Se establecerá un límite de peso para las imágenes recibidas.
- Los archivos dañados o incompatibles no podrán procesarse.
- El bot dependerá de una conexión estable a Internet.
- La disponibilidad dependerá del funcionamiento del servicio de conexión con WhatsApp.

### 3.2. Limitaciones funcionales

- La primera versión solamente procesará imágenes estáticas.
- No se eliminarán fondos automáticamente.
- No se añadirán textos ni efectos visuales.
- No se crearán paquetes de stickers.
- No se implementará una base de datos en el MVP.
- No se almacenará permanentemente el historial de imágenes procesadas.

### 3.3. Limitaciones operativas

- El bot necesitará mantenerse en ejecución para recibir mensajes.
- La velocidad de respuesta dependerá del tamaño de las imágenes, la conexión y los recursos del servidor.
- El procesamiento simultáneo estará limitado para evitar sobrecargas.
- La conexión mediante bibliotecas no oficiales puede estar sujeta a cambios o restricciones de WhatsApp.

---

## 4. Reglas de funcionamiento

Las siguientes reglas definen el comportamiento que deberá tener el bot.

| ID | Regla | Comportamiento esperado |
|---|---|---|
| R01 | Detección de imágenes | El bot solamente iniciará el procesamiento cuando reciba una imagen compatible. |
| R02 | Mensajes de texto | Si recibe texto sin una imagen, podrá responder con instrucciones de uso. |
| R03 | Validación | Antes de procesar una imagen, verificará que el archivo sea válido. |
| R04 | Tamaño | No procesará imágenes que superen el límite de peso establecido. |
| R05 | Conversión | Todas las imágenes aceptadas se convertirán a WebP. |
| R06 | Dimensiones | Las imágenes se adaptarán a un máximo de 512 × 512 píxeles sin deformar su proporción. |
| R07 | Respuesta | El sticker generado deberá enviarse al mismo chat de origen. |
| R08 | Errores | Si ocurre un error, el bot informará al usuario sin detener su funcionamiento general. |
| R09 | Archivos temporales | Los archivos utilizados durante el procesamiento deberán eliminarse al finalizar. |
| R10 | Mensajes propios | El bot no deberá procesar sus propios mensajes. |
| R11 | Duplicados | El bot deberá evitar procesar dos veces el mismo mensaje. |
| R12 | Disponibilidad | Ante una desconexión, deberá intentar recuperar la conexión de manera controlada. |

### 4.1. Flujo general de funcionamiento

1. El usuario envía una fotografía.
2. El bot detecta el mensaje entrante.
3. Comprueba que contiene una imagen compatible.
4. Descarga temporalmente el archivo.
5. Valida el formato y el tamaño.
6. Procesa y redimensiona la imagen.
7. Convierte el resultado a WebP.
8. Genera el sticker.
9. Envía el sticker al chat original.
10. Elimina los archivos temporales.

### 4.2. Comportamiento ante errores

- **Formato no compatible:** informar que solamente se aceptan imágenes.
- **Archivo demasiado grande:** solicitar una imagen de menor tamaño.
- **Imagen dañada:** informar que no fue posible procesarla.
- **Error de conversión:** cancelar el envío y limpiar los archivos temporales.
- **Desconexión:** intentar recuperar la conexión sin generar procesos duplicados.

---

## 5. Criterios de aceptación del MVP

El MVP se considerará funcional cuando cumpla las siguientes condiciones:

- [ ] El bot consigue conectarse a WhatsApp.
- [ ] Detecta correctamente las imágenes recibidas.
- [ ] Descarga y procesa los archivos.
- [ ] Convierte imágenes JPG, JPEG y PNG a WebP.
- [ ] Genera stickers con dimensiones compatibles.
- [ ] Devuelve automáticamente el sticker al chat correspondiente.
- [ ] Informa correctamente cuando recibe archivos incompatibles.
- [ ] Gestiona los errores sin detener el servicio.
- [ ] Elimina los archivos temporales.
- [ ] Evita procesamientos duplicados.

---

## 6. Consideraciones de desarrollo

El proyecto se desarrollará mediante módulos independientes, procurando separar:

- La conexión con WhatsApp.
- La recepción y gestión de mensajes.
- El procesamiento de imágenes.
- La generación de stickers.
- El envío de archivos.
- El manejo de errores.

Se utilizará control de versiones mediante Git para registrar los avances y facilitar futuras modificaciones.

Las decisiones técnicas definitivas, los límites de archivos y la modalidad de conexión se documentarán antes de implementar sus respectivos módulos.

---

**Fin del documento de planificación inicial.**