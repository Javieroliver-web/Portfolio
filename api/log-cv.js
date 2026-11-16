// Aviso a Discord de cada descarga del CV. Lógica común en _track.js.
import { handleTrack, visitorFields } from './_track.js';

const CVS = {
    es: { flag: '🇪🇸', name: 'Curriculum en Español' },
    en: { flag: '🇬🇧', name: 'Curriculum en Inglés' },
};

export default function handler(req, res) {
    return handleTrack(req, res, {
        name: 'log-cv.js',
        webhookEnv: 'DISCORD_CV_WEBHOOK_URL',
        logFile: 'cv_downloads.log',
        logExtra: b => ({ cvLanguage: b.cvLanguage }),
        buildEmbed: (body, v) => {
            const cv = CVS[body.cvLanguage];
            if (!cv) return null;
            return {
                username: 'Yuki',
                embeds: [{
                    title: `📄 ¡Han descargado tu CV! ${cv.flag}`,
                    description: `Alguien acaba de hacer clic en descargar versión: **${cv.name}**`,
                    // Naranja: destaca las descargas frente al rojo de proyectos y el azul de visitas.
                    color: 0xffa500,
                    fields: visitorFields(v).filter(f => f.name !== '🌐 Página'),
                    footer: { text: 'Portfolio | javieroliver-web' },
                    timestamp: new Date().toISOString(),
                }],
            };
        },
    });
}
