export default {
  async fetch(request) {
    try {
      const url = new URL(request.url);
      const target = url.searchParams.get("url");
      if (!target) {
        return new Response(JSON.stringify({ error: "Missing url parameter" }), { status: 400, headers: { "Content-Type": "application/json" } });
      }
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS" } });
      }
      const response = await fetch(target, { method: request.method });
      const body = await response.text();
      return new Response(body, { status: response.status, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Content-Type": response.headers.get("Content-Type") || "application/json" } });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.toString() }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
  }
};
