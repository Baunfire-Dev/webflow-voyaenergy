import theme from "../../config.json";

const ALLOWED = new Set([theme.url]);

export async function onRequest(context) {
    const { request, next } = context;
    const origin = request.headers.get("Origin") || "";
    const allow = ALLOWED.has(origin) ? origin : "";

    if (request.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": allow,
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
                "Vary": "Origin",
            },
        });
    }

    const response = await next();
    const headers = new Headers(response.headers);
    headers.set("Access-Control-Allow-Origin", allow);
    headers.append("Vary", "Origin");
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    });
}