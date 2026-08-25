import theme from "../../config.json";

const SITE_PASSWORD = theme.password;

const GATE = /action=["'][^"']*\.wf_auth/i;

async function authenticate(origin) {
    const formBody = new URLSearchParams({
        pass: SITE_PASSWORD,
        path: '/index.html',
        page: '',
    });

    const res = await fetch(`${origin}/.wf_auth`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody,
        redirect: 'manual',
    });

    const setCookie = res.headers.get('set-cookie');

    if (!setCookie) {
        throw new Error(`No Set-Cookie from ${origin}/.wf_auth (status ${res.status})`);
    }

    const match = setCookie.match(/wf_auth=[^;]+/);

    if (!match) {
        throw new Error(`wf_auth not found in Set-Cookie: ${setCookie}`);
    }

    return match[0];
}

async function fetchHTML(url, state) {
    const res = await fetch(url, {
        headers: state.cookie ? { Cookie: state.cookie } : {},
        redirect: 'follow',
        cf: {
            cacheTtl: 0,
        },
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch ${url}: ${res.status}`);
    }

    return { html: await res.text(), origin: new URL(res.url).origin };
}

async function handleCrawl({ request, env }) {
    const u = new URL(request.url);

    const name = u.searchParams.get('name');
    const dataURL = u.searchParams.get('dataURL');
    const param = u.searchParams.get('param');
    const pageSize = parseInt(u.searchParams.get('pageSize') || '100', 10);

    if (!name || !dataURL || !param) {
        return new Response('Bad request', { status: 400 });
    }

    const all = [];
    const state = { cookie: null };

    for (let page = 1; page <= 200; page++) {
        const pageURL = new URL(dataURL);
        pageURL.searchParams.set(param, String(page));

        let { html, origin } = await fetchHTML(pageURL, state);

        if (GATE.test(html)) {
            state.cookie = await authenticate(origin);
            ({ html } = await fetchHTML(pageURL, state));
        }

        const items = parse(html);

        console.log(`Page ${page}: ${items.length} items`);

        if (!items.length) {
            break;
        }

        all.push(...items);

        if (items.length < pageSize) {
            break;
        }
    }

    await env.COLLECTION_STORE.put(name, JSON.stringify(all));

    return Response.json({
        ok: true,
        name,
        count: all.length,
    });
}

export const onRequestGet = handleCrawl;
export const onRequestPost = handleCrawl;

function decode(str = '') {
    return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .trim();
}

function parseItem(part) {
    const item = {};
    const re = /data-key="([^"]+)"[^>]*>([\s\S]*?)<\/div>/gi;
    let m;

    while ((m = re.exec(part)) !== null) {
        const key = m[1].replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        const val = decode(m[2].replace(/<[^>]+>/g, '').trim());
        item[key] = val;
    }

    return item;
}

function parse(html) {
    const parts = html.split(/<div role="listitem" class="[^"]*\bg-ci\b[^"]*\bw-dyn-item\b[^"]*">/);

    parts.shift();

    return parts.map(parseItem);
}
