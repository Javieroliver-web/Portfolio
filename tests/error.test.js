// Tests del receptor de errores (api/error.js), con el runner de Node
// (node --test): sin dependencias nuevas. Discord se sustituye por un fetch
// falso que apunta lo que le llegaría.
import test from 'node:test';
import assert from 'node:assert';

process.env.DISCORD_ERRORS_WEBHOOK_URL = 'https://discord.invalid/webhook-de-prueba';
const enviados = [];
globalThis.fetch = async (url, init) => {
    enviados.push({ url, cuerpo: JSON.parse(init.body) });
    return { ok: true, status: 204, text: async () => '' };
};
const { default: handler } = await import('../api/error.js');

let ipSiguiente = 1;
function peticion({ method = 'POST', origin = 'https://becamax.vercel.app', body, ip } = {}) {
    const req = {
        method,
        headers: { origin, 'user-agent': 'Navegador/1.0', 'x-forwarded-for': ip ?? `10.0.0.${ipSiguiente++}` },
        body: body ?? JSON.stringify({ site: 'becamax', type: 'error', message: `fallo ${Math.random()}`, page: 'https://becamax.vercel.app/' }),
    };
    const res = {
        estado: 0, cabeceras: {}, json: null,
        status(s) { this.estado = s; return this; },
        json(j) { this.json = j; return this; },
        end() { return this; },
        setHeader(k, v) { this.cabeceras[k] = v; },
    };
    return { req, res };
}

async function enviar(opciones) {
    const { req, res } = peticion(opciones);
    await handler(req, res);
    return res;
}

test('solo acepta los orígenes de las webs de Javier', async () => {
    const antes = enviados.length;
    assert.strictEqual((await enviar({ origin: 'https://evil.example' })).estado, 403);
    assert.strictEqual((await enviar({ origin: '' })).estado, 403);
    assert.strictEqual(enviados.length, antes, 'nada llega a Discord');
});

test('un informe bueno llega a Discord con el mensaje recortado', async () => {
    const antes = enviados.length;
    const largo = 'x'.repeat(1000);
    const res = await enviar({ body: JSON.stringify({ site: 'carniceria', message: largo }) });
    assert.strictEqual(res.estado, 202);
    assert.strictEqual(enviados.length, antes + 1);
    const embed = enviados.at(-1).cuerpo.embeds[0];
    assert.match(embed.title, /Carnicería Raúl Oliver/);
    assert.ok(embed.description.length <= 310, 'el mensaje se recorta a 300 caracteres');
});

test('rechaza lo que no es un informe de una de sus webs', async () => {
    assert.strictEqual((await enviar({ body: '{no es json' })).estado, 400);
    assert.strictEqual((await enviar({ body: JSON.stringify({ site: 'otra-web', message: 'x' }) })).estado, 400);
    assert.strictEqual((await enviar({ method: 'GET' })).estado, 405);
});

test('el preflight responde con CORS solo para sus orígenes', async () => {
    const bueno = await enviar({ method: 'OPTIONS' });
    assert.strictEqual(bueno.estado, 204);
    assert.strictEqual(bueno.cabeceras['Access-Control-Allow-Origin'], 'https://becamax.vercel.app');
    const malo = await enviar({ method: 'OPTIONS', origin: 'https://evil.example' });
    assert.strictEqual(malo.cabeceras['Access-Control-Allow-Origin'], undefined);
});

test('el mismo error repetido no inunda el canal', async () => {
    const body = JSON.stringify({ site: 'portfolio', message: 'siempre el mismo', source: 'app.js', line: 3 });
    const antes = enviados.length;
    await enviar({ body });
    const segunda = await enviar({ body });
    assert.strictEqual(segunda.json.deduplicated, true);
    assert.strictEqual(enviados.length, antes + 1);
});

test('una misma IP no puede mandar más de 10 informes seguidos', async () => {
    const estados = [];
    for (let i = 0; i < 12; i++) estados.push((await enviar({ ip: '203.0.113.7' })).estado);
    assert.deepStrictEqual(estados.slice(0, 10), Array(10).fill(202));
    assert.deepStrictEqual(estados.slice(10), [429, 429]);
});
