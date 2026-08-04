export async function onRequestGet({ request, env }) {
    const name = new URL(request.url).searchParams.get('name');
    const body = (await env.COLLECTION_STORE.get(name)) || '[]';
    return new Response(body, {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=60',
        },
    });
}