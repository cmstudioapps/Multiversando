export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao enviar notificação");
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}