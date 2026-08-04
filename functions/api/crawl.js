import theme from "../../config.json";

const WEBFLOW_ORIGIN = theme.url;
const SITE_PASSWORD = theme.password;

let cachedCookie = null;

async function authenticateAndGetCookie() {
    const formBody = new URLSearchParams({
        pass: SITE_PASSWORD,
        path: '/index.html',
        page: '',
    });

    const res = await fetch(`${WEBFLOW_ORIGIN}/.wf_auth`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody,
        redirect: 'manual',
    });

    const setCookie = res.headers.get('set-cookie');

    if (!setCookie) {
        throw new Error(`No Set-Cookie header. Status: ${res.status}`);
    }

    const match = setCookie.match(/wf_auth=[^;]+/);

    if (!match) {
        throw new Error(`wf_auth not found in Set-Cookie: ${setCookie}`);
    }

    return match[0];
}

async function getCookie(forceRefresh = false) {
    if (!cachedCookie || forceRefresh) {
        cachedCookie = await authenticateAndGetCookie();
    }

    return cachedCookie;
}

export async function onRequestGet({ request, env }) {
    const u = new URL(request.url);

    const name = u.searchParams.get('name');
    const dataURL = u.searchParams.get('dataURL');
    const param = u.searchParams.get('param');
    const pageSize = parseInt(u.searchParams.get('pageSize') || '100', 10);

    if (!name || !dataURL || !param) {
        return new Response('Bad request', { status: 400 });
    }

    const all = [];

    for (let page = 1; page <= 200; page++) {
        const url = `${dataURL}?${param}=${page}`;

        let cookie = await getCookie();

        let res = await fetch(url, {
            headers: {
                Cookie: cookie,
            },
            redirect: 'manual',
            cf: {
                cacheTtl: 0,
            },
        });

        if (res.status >= 300 && res.status < 400) {
            cookie = await getCookie(true);

            res = await fetch(url, {
                headers: {
                    Cookie: cookie,
                },
                redirect: 'manual',
                cf: {
                    cacheTtl: 0,
                },
            });
        }

        if (!res.ok) {
            throw new Error(`Failed to fetch page ${page}: ${res.status}`);
        }

        const html = await res.text();

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