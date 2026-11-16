// Aviso a Discord de los clics en los enlaces de cada proyecto (web, código).
// Lógica común en _track.js.
import { handleTrack, visitorFields } from './_track.js';

// Solo proyectos conocidos: antes el texto llegaba tal cual al título de Discord.
export const PROJECTS = {
    portfolio: { label: 'Portfolio', emoji: '🎨', color: 0x9b59b6 },
    vesta: { label: 'Proyecto Vesta', emoji: '🔥', color: 0xe67e22 },
    carniceria: { label: 'Carnicería Raúl Oliver', emoji: '🥩', color: 0xc0392b },
    becamax: { label: 'BecaMax', emoji: '🎓', color: 0x10b981 },
    'estudio-uned': { label: 'Estudio UNED', emoji: '📚', color: 0x0b5d4b },
    vivy: { label: 'Vivy', emoji: '🤖', color: 0x8b5cf6 },
    homelab: { label: 'Servidor de casa', emoji: '🏠', color: 0x64748b },
};

export const ACTIONS = {
    web: 'Sitio Web',
    code: 'Repositorio Code',
    'code-web': 'Repositorio Front-End',
    'code-api': 'Repositorio Back-End',
};

export default function handler(req, res) {
    return handleTrack(req, res, {
        name: 'log-project.js',
        webhookEnv: 'DISCORD_PROJECT_WEBHOOK_URL',
        logFile: 'project-clicks.log',
        logExtra: b => ({ project: b.project, action: b.action }),
        buildEmbed: (body, v) => {
            const meta = PROJECTS[body.project];
            const action = ACTIONS[body.action];
            if (!meta || !action) return null;
            return {
                username: 'Reze',
                embeds: [{
                    title: `${meta.emoji} Clic en ${meta.label} (${action})`,
                    color: meta.color,
                    fields: [
                        { name: '📂 Proyecto', value: meta.label, inline: true },
                        { name: '🎯 Acción', value: action, inline: true },
                        ...visitorFields(v),
                    ],
                    footer: { text: 'Portfolio | javieroliver-web — Project tracker' },
                    timestamp: new Date().toISOString(),
                }],
            };
        },
    });
}
