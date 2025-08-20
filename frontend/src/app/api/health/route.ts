export async function GET() {
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080").replace(/\/$/, "");
  const url = `${base}/healthz`;

  try {
    const res = await fetch(url, { cache: "no-store", next: { revalidate: 0 } });
    const text = await res.text(); // <- backend returns plain text
    return new Response(text, {
      status: res.status,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("Health proxy failed:", err);
    return Response.json({ error: "Unable to reach backend" }, { status: 502 });
  }
}
