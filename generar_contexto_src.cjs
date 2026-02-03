const fs = require('fs');
const path = require('path');

// --- Configuración ---
const archivoDeSalida = 'contexto_src.txt';
// Excluir el propio script y el archivo de salida.
const archivosAExcluir = ['generar_contexto_src.js', archivoDeSalida];
// AGREGAMOS 'dist' y otras carpetas comunes a la lista de exclusión.
const directoriosAExcluir = ['dist', 'node_modules', '.git'];
// --------------------

const directorioRaiz = process.cwd();
let contenidoFinal = '';

function explorarDirectorio(directorio) {
  const items = fs.readdirSync(directorio);

  for (const item of items) {
    const rutaCompleta = path.join(directorio, item);
    const stat = fs.statSync(rutaCompleta);

    if (stat.isDirectory()) {
      // Si la carpeta NO está en la lista de exclusión, la exploramos
      if (!directoriosAExcluir.includes(item)) {
        explorarDirectorio(rutaCompleta);
      }
    } else if (stat.isFile()) {
      // Procesa el archivo si no está en la lista de exclusión
      if (!archivosAExcluir.includes(item)) {
        const rutaRelativa = path.relative(directorioRaiz, rutaCompleta);
        try {
          const contenido = fs.readFileSync(rutaCompleta, 'utf-8');
          
          // Heurística para no imprimir el contenido de archivos binarios
          if (contenido.includes('\u0000')) { 
            contenidoFinal += `\n\n--- ARCHIVO BINARIO OMITIDO: ${rutaRelativa} ---\n`;
          } else {
            contenidoFinal += `\n\n--- INICIO DEL ARCHIVO: ${rutaRelativa} ---\n\n`;
            contenidoFinal += contenido;
            contenidoFinal += `\n\n--- FIN DEL ARCHIVO: ${rutaRelativa} ---\n`;
          }
        } catch (error) {
          contenidoFinal += `\n\n--- ERROR AL LEER (posiblemente binario): ${rutaRelativa} ---\n`;
        }
      }
    }
  }
}

try {
  explorarDirectorio(directorioRaiz);
  fs.writeFileSync(archivoDeSalida, contenidoFinal);
  console.log(`✅ ¡Éxito! El contexto de tu código fuente se ha guardado en: ${archivoDeSalida}`);
} catch (error) {
  console.error('❌ Ocurrió un error al generar el archivo:', error);
}