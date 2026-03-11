import fs from 'fs';
import path from 'path';

/**
 * Appends a JSON entry (one per line, NDJSON format) to a log file.
 * In production (Vercel) the filesystem is ephemeral, so this is mainly
 * useful for local development and statistics review.
 *
 * @param {string} filename  - Name of the log file (e.g. 'visits.log')
 * @param {object} entry     - Data object to serialize and append.
 */
export function appendLog(filename, entry) {
    try {
        // Resolve logs/ relative to the project root (one level above /api)
        const logsDir = path.resolve(process.cwd(), 'logs');

        // Create the directory if it doesn't exist yet
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }

        const filePath = path.join(logsDir, filename);
        const line = JSON.stringify(entry) + '\n';
        fs.appendFileSync(filePath, line, 'utf8');
    } catch (err) {
        // Never crash the handler because of a logging failure
        console.error(`[logger.js] No se pudo escribir en ${filename}:`, err.message);
    }
}
