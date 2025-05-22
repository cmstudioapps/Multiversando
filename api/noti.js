export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const PUSHALERT_API_KEY = "4963a3ae3e6d00a306ccf1ad9b15fb1c";

  try {
    const body = new URLSearchParams({
      auth_key: PUSHALERT_API_KEY,
      title: "OPAAAA!",
      message: "Quital da uma olhada nos conteúdos novos?",
      url: "https://multiversando.vercel.app",
      icon: "https://i.imgur.com/KkGuZYf.png",
      target: "all"
    });

    const response = await fetch("https://pushalert.co/api/v1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body
    });

    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      throw new Error(
        (isJson ? data.message : data) || "Erro ao enviar notificação"
      );
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}