// Utilidades de privacidad compartidas por los endpoints de /api.
// El prefijo "_" hace que Vercel no lo publique como función propia.

/**
 * Anonimiza una IP antes de guardarla o enviarla a Discord: la IP completa es
 * un dato personal (RGPD) y para estadísticas de visitas no hace falta.
 *   IPv4: se pone a 0 el último bloque   83.45.120.7   -> 83.45.120.0
 *   IPv6: se conservan los 3 primeros grupos  2a0c:5a80:1f0e:ab::1 -> 2a0c:5a80:1f0e::
 */
export function anonymizeIp(ip) {
    if (!ip || typeof ip !== 'string') return 'Desconocida';
    const clean = ip.trim().replace(/^::ffff:/, '');
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(clean)) {
        return clean.split('.').slice(0, 3).concat('0').join('.');
    }
    if (clean.includes(':')) {
        return clean.split(':').slice(0, 3).join(':') + '::';
    }
    return 'Desconocida';
}

/** IP real del visitante: Vercel la añade al FINAL de x-forwarded-for. */
export function clientIp(req) {
    const raw = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
    return raw.split(',').pop().trim();
}
