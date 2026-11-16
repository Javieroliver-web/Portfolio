// Tests de los avisos de visitas y clics (api/log*.js sobre api/_track.js).
// Discord se sustituye por un fetch falso que apunta lo que le llegaría.
import test from 'node:test';
import assert from 'node:assert';

for (const k of ['DISCORD_WEBHOOK_URL', 'DISCORD_PROJECT_WEBHOOK_URL', 'DISCORD_SOCIAL_WEBHOOK_URL', 'DISCORD_CV_WEBHOOK_URL']) {
    process.env[k] = `https://discord.invalid/${k}`;
}
const enviados = [];
let respuestaDiscord = { ok: true, status: 204, text: async () => '' };
globalThis.fetch = async (url, init) => {
    enviados.push({ url, cuerpo: JSON.parse(init.body) });
    return respuestaDiscord;
};

const { _resetLimits } = await import('../api/_track.js');
const log = (await import('../api/log.js')).default;
const logProject = (await import('../api/log-project.js')).default;
const logSocial = (await import('../api/log-social.js')).default;
const logCv = (await import('../api/log-cv.js')).default;

const ORIGEN = 'https://portfolio-javieroliver-web.vercel.app';
let ipSiguiente = 1;

async function llamar(handler, { method = 'POST', origin = ORIGEN, body = {}, ip, headers = {} } = {}) {
    const req = {
        method,
        headers: { origin, 'x-forwarded-for': ip ?? `198.51.100.${ipSiguiente++}`, ...headers },
        body,
    };
    const res = {
        estado: 0, json: null,
        status(s) { this.estado = s; return this; },
        json(j) { this.json = j; return this; },
    };
    await handler(req, res);
    return res;
}

const visita = { timestamp: '16/11/2026, 12:00:00', language: 'es-ES', screen: '1920x1080', userAgent: 'Mozilla/5.0 Chrome/130', page: `${ORIGEN}/` };

test('solo se aceptan avisos que vienen del propio portfolio', async () => {
    const antes = enviados.length;
    for (const h of [log, logProject, logSocial, logCv]) {
        assert.strictEqual((await llamar(h, { origin: 'https://evil.example', body: visita })).estado, 403);
        assert.strictEqual((await llamar(h, { origin: '', body: visita })).estado, 403, 'curl sin Origin');
        assert.strictEqual((await llamar(h, { method: 'GET' })).estado, 405);
    }
    assert.strictEqual(enviados.length, antes, 'nada llega a Discord');
});

test('una visita llega a Discord con la IP anonimizada', async () => {
    const res = await llamar(log, { body: { ...visita, referrer: 'https://www.linkedin.com/' }, ip: '1.2.3.4, 83.45.120.7' });
    assert.strictEqual(res.estado, 200);
    const embed = enviados.at(-1).cuerpo.embeds[0];
    assert.match(embed.title, /Nueva visita/);
    const campo = n => embed.fields.find(f => f.name.includes(n))?.value;
    assert.strictEqual(campo('IP'), '83.45.120.0', 'la IP real es la última de x-forwarded-for, y anonimizada');
    assert.strictEqual(campo('Referrer'), 'https://www.linkedin.com/');
    assert.strictEqual(campo('Navegador'), 'Chrome');
});

test('textos larguísimos se recortan (antes rompían el aviso de Discord)', async () => {
    await llamar(log, { body: { ...visita, page: 'x'.repeat(5000), screen: 'y'.repeat(5000), timestamp: 'z'.repeat(5000) } });
    for (const f of enviados.at(-1).cuerpo.embeds[0].fields) assert.ok(f.value.length <= 200, `${f.name}: ${f.value.length}`);
});

test('proyectos: solo los conocidos y con acción válida', async () => {
    assert.strictEqual((await llamar(logProject, { body: { ...visita, project: 'carniceria', action: 'web' } })).estado, 200);
    assert.match(enviados.at(-1).cuerpo.embeds[0].title, /Carnicería Raúl Oliver \(Sitio Web\)/);
    assert.strictEqual((await llamar(logProject, { body: { ...visita, project: '@everyone mira esto', action: 'web' } })).estado, 400);
    assert.strictEqual((await llamar(logProject, { body: { ...visita, project: 'vesta', action: 'hackeo' } })).estado, 400);
});

test('redes y CV: solo valores de la lista', async () => {
    assert.strictEqual((await llamar(logSocial, { body: { ...visita, social: 'linkedin' } })).estado, 200);
    assert.match(enviados.at(-1).cuerpo.embeds[0].title, /LinkedIn/);
    assert.strictEqual((await llamar(logSocial, { body: { ...visita, social: 'tiktok' } })).estado, 400);
    assert.strictEqual((await llamar(logCv, { body: { ...visita, cvLanguage: 'en' } })).estado, 200);
    assert.match(enviados.at(-1).cuerpo.embeds[0].title, /🇬🇧/);
    assert.strictEqual((await llamar(logCv, { body: { ...visita, cvLanguage: 'fr' } })).estado, 400);
});

test('cuerpos raros no tumban la función', async () => {
    assert.strictEqual((await llamar(log, { body: null })).estado, 400);
    assert.strictEqual((await llamar(log, { body: [1, 2] })).estado, 400);
    assert.strictEqual((await llamar(log, { body: visita, headers: { 'x-vercel-ip-city': '%E0%A4%A' } })).estado, 200, 'cabecera mal codificada');
});

test('una misma IP no puede mandar más de 20 avisos en 10 minutos', async () => {
    _resetLimits();
    const estados = [];
    for (let i = 0; i < 22; i++) estados.push((await llamar(log, { body: visita, ip: '203.0.113.9' })).estado);
    assert.deepStrictEqual(estados.slice(0, 20), Array(20).fill(200));
    assert.deepStrictEqual(estados.slice(20), [429, 429]);
    _resetLimits();
});

test('si Discord falla, no se le devuelve su respuesta a quien llama', async () => {
    respuestaDiscord = { ok: false, status: 400, text: async () => '{"message":"detalle interno de Discord"}' };
    const res = await llamar(log, { body: visita });
    respuestaDiscord = { ok: true, status: 204, text: async () => '' };
    assert.strictEqual(res.estado, 502);
    assert.deepStrictEqual(res.json, { error: 'Discord error' });
});
