import { appendLog } from './logger.js';

export default async function handler(req, res) {
    // Solo aceptar POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const webhookUrl = process.env.DISCORD_PROJECT_WEBHOOK_URL;

    if (!webhookUrl) {
        console.error('[log-project.js] Error: DISCORD_PROJECT_WEBHOOK_URL no configurado');
        return res.status(500).json({ error: 'Webhook not configured' });
    }

    // Verificar cabecera secreta para bloquear peticiones no autorizadas
    const secret = process.env.LOG_SECRET;
    if (secret && req.headers['x-log-secret'] !== secret) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Comprobar que el cuerpo de la peticion es un objeto valido
    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Invalid request body' });
    }

    const { timestamp, language, screen, userAgent, page, project, action } = req.body;

    // Función auxiliar para parsear el navegador
    function parseUserAgent(ua) {
        if (!ua) return 'Desconocido';
        if (ua.includes('Edg/')) return 'Edge';
        if (ua.includes('Chrome') && !ua.includes('Edg/')) return 'Chrome';
        if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Opera') || ua.includes('OPR/')) return 'Opera';
        return ua.substring(0, 50);
    }

    const browserName = parseUserAgent(userAgent);

    // Obtener la IP real: Vercel añade la IP real al FINAL de x-forwarded-for
    const rawIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'IP desconocida';
    const ip = rawIp.split(',').pop().trim();

    // Obtener localización (Vercel inyecta estas cabeceras automáticamente)
    const rawCountry = req.headers['x-vercel-ip-country'] || '';
    const rawRegion  = req.headers['x-vercel-ip-country-region'] || '';
    const rawCity    = req.headers['x-vercel-ip-city'] || '';

    const country = rawCountry ? decodeURIComponent(rawCountry) : '';
    const region  = rawRegion  ? decodeURIComponent(rawRegion)  : '';
    const city    = rawCity    ? decodeURIComponent(rawCity)    : '';

    let location = 'Desconocida';
    if (country) {
        location = `${city}${city ? ', ' : ''}${region}${region ? ' ' : ''}[${country}]`.trim();
    }

    // Detectar si es un bot de Vercel (generador de capturas/previsualizaciones)
    const isVercelBot = userAgent && userAgent.toLowerCase().includes('vercel-screenshot');
    const finalBrowserName = isVercelBot ? `🤖 Vercel Bot (${browserName})` : browserName;

    // Configurar metadatos del proyecto
    const projectMeta = {
        portfolio: { label: 'Portfolio', emoji: '🎨', color: 0x9b59b6 },
        vesta:     { label: 'Proyecto Vesta', emoji: '🔥', color: 0xe67e22 }
    };
    const meta = projectMeta[project] || { label: project || 'Proyecto Desconocido', emoji: '💻', color: 0x95a5a6 };

    // Configurar etiqueta de la accion (ej. Web, Code, API)
    let actionLabel = action;
    if (action === 'web') actionLabel = 'Sitio Web';
    if (action === 'code') actionLabel = 'Repositorio Code';
    if (action === 'code-web') actionLabel = 'Repositorio Front-End';
    if (action === 'code-api') actionLabel = 'Repositorio Back-End';

    // Construir el payload para la API de Discord (formato embed)
    const embed = {
        username: 'Reze',
        embeds: [
            {
                title: `${meta.emoji} Clic en ${meta.label} (${actionLabel})`,
                color: meta.color,
                fields: [
                    { name: '📂 Proyecto',     value: meta.label,       inline: true  },
                    { name: '🎯 Acción',      value: actionLabel,      inline: true  },
                    { name: '🕐 Hora',         value: timestamp || 'Desconocida', inline: true  },
                    { name: '🌍 Idioma',       value: language  || 'Desconocido', inline: true  },
                    { name: '🖥️ Pantalla',    value: screen    || 'Desconocida', inline: true  },
                    { name: '🌐 Página Origen',value: page      || 'Desconocida', inline: false },
                    { name: '🔍 Navegador',    value: finalBrowserName,           inline: true  },
                    { name: '🛡️ IP',          value: ip,                         inline: true  },
                    { name: '📍 Ubicación',    value: location,                   inline: false },
                ],
                footer: { text: 'Portfolio | javieroliver-web — Project tracker' },
                timestamp: new Date().toISOString(),
            },
        ],
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(embed),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[log-project.js] Error enviando a Discord:', response.status, errorText);
            return res.status(500).json({ error: 'Discord error', details: errorText });
        }

        // Guardar en log local
        appendLog('project-clicks.log', {
            project, action, timestamp, language, screen,
            browser: finalBrowserName, ip, location, page,
        });

        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error('[log-project.js] Excepción capturada:', err.message);
        return res.status(500).json({ error: err.message });
    }
}
