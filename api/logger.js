import fs from 'fs';
import path from 'path';

/**
 * Escribe una entrada JSON en una nueva linea al final del archivo indicado
 * (formato NDJSON: una entrada por linea).
 *
 * En produccion (Vercel), el sistema de archivos es efimero y los datos
 * no persisten entre invocaciones. Esta funcion es util principalmente
 * durante el desarrollo local.
 *
 * @param {string} filename - Nombre del archivo de log (p.ej. 'visits.log').
 * @param {object} entry    - Objeto con los datos a registrar.
 */
export function appendLog(filename, entry) {
    try {
        // Resolver la ruta a logs/ relativa a la raiz del proyecto (un nivel sobre /api)
        const logsDir = path.resolve(process.cwd(), 'logs');

        // Crear el directorio si no existe todavia
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }

        const filePath = path.join(logsDir, filename);
        const line = JSON.stringify(entry) + '\n';
        fs.appendFileSync(filePath, line, 'utf8');
    } catch (err) {
        // Capturar el error sin propagar: un fallo de escritura nunca debe
        // interrumpir la respuesta del handler principal.
        console.error(`[logger.js] No se pudo escribir en ${filename}:`, err.message);
    }
}
