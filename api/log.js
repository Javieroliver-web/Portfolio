export default async function handler(req, res) {
    // Solo aceptar POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
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
            return res.status(500).json({ error: 'Discord error' });
        }

        return res.status(200).json({ ok: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
