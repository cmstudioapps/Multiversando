export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
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
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json" // Solicita explicitamente JSON
      },
      body: formData.toString()
    });

    const text = await response.text();
    console.log("Raw response:", text); // Log para depuração

    try {
      const data = text ? JSON.parse(text) : {};
      
      if (!response.ok) {
        console.error("PushAlert API error:", data);
        return res.status(500).json({ 
          success: false, 
          error: data.message || data.error || "Erro ao enviar notificação",
          status: response.status
        });
      }
      
      return res.status(200).json({ success: true, data });
    } catch (e) {
      console.error("JSON parse error:", e, "Response text:", text);
      return res.status(500).json({ 
        success: false, 
        error: "Resposta inválida da PushAlert",
        rawResponse: text 
      });
    }
  } catch (error) {
    console.error("Network error:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}