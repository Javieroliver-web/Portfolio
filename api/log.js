export default async function handler(req, res) {
    // Solo aceptar POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Webhook proporcionado anteriormente o variable de entorno
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL || "https://discord.com/api/webhooks/1478670444197314722/HFh25OqSJUtdRMERUISdYwUYf9QW6ROHZWJxaLrI8JEnXlAvs_WChmoN_F_MgSAZYFMA";

    if (!webhookUrl) {
        console.error("[log.js] Error: Webhook not configured");
        return res.status(500).json({ error: 'Webhook not configured' });
    }

    const { timestamp, referrer, language, screen, userAgent, page } = req.body;

    const embed = {
        username: '📊 Portfolio Logger',
        embeds: [
            {
                title: '👤 Nueva visita al Portfolio',
                color: 0x3b82f6,
                fields: [
                    { name: '🕐 Hora', value: timestamp || 'Desconocida', inline: true },
                    { name: '🌍 Idioma', value: language || 'Desconocido', inline: true },
                    { name: '🖥️ Pantalla', value: screen || 'Desconocida', inline: true },
                    { name: '🔗 Referrer', value: referrer || 'Acceso directo', inline: false },
                    { name: '🌐 Página', value: page || 'Desconocida', inline: false },
                    { name: '🔍 Navegador', value: userAgent ? userAgent.substring(0, 100) : 'Desconocido', inline: false },
                ],
                footer: { text: 'Portfolio | javieroliver-web' },
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
            console.error("[log.js] Error enviando a Discord:", response.status, errorText);
            return res.status(500).json({ error: 'Discord error', details: errorText });
        }

        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error("[log.js] Excepción Capturada:", err.message);
        return res.status(500).json({ error: err.message });
    }
}
