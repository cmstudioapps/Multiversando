export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
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
      if (!response.ok) throw new Error(data.message || "Erro ao enviar notificação");
      return res.status(200).json({ success: true, data });
    } catch (jsonError) {
      console.error("Erro de parsing:", text);
      throw new Error("Resposta inválida da PushAlert");
    }

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}