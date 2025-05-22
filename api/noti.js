export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    // Responde OK para pré-flight
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const formData = new URLSearchParams();
  formData.append("auth_key", "4963a3ae3e6d00a306ccf1ad9b15fb1c");
  formData.append("title", "OPAAAA!");
  formData.append("message", "Quital da uma olhada nos conteúdos novos?");
  formData.append("url", "https://multiversando.vercel.app");
  formData.append("icon", "https://i.imgur.com/KkGuZYf.png");
  formData.append("target", "all");

  try {
    const response = await fetch("https://pushalert.co/api/v1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formData.toString()
    });

    const text = await response.text();

    try {
      const data = JSON.parse(text);
      if (!response.ok) {
        console.error("PushAlert API error:", data);
        return res.status(500).json({ success: false, error: data.message || "Erro ao enviar notificação" });
      }
      return res.status(200).json({ success: true, data });
    } catch (jsonError) {
      console.error("Erro de parsing da resposta PushAlert:", text);
      return res.status(500).json({ success: false, error: "Resposta inválida da PushAlert" });
    }

  } catch (error) {
    console.error("Erro no fetch para PushAlert:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}