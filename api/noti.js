export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const PUSHALERT_API_KEY = "4963a3ae3e6d00a306ccf1ad9b15fb1c";

  try {
    const response = await fetch("https://pushalert.co/api/v1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": PUSHALERT_API_KEY // aqui está corrigido
      },
      body: JSON.stringify({
        title: "OPAAAA!",
        message: "Quital da uma olhada nos conteúdos novos?",
        url: "https://multiversando.vercel.app",
        icon: "https://i.imgur.com/KkGuZYf.png",
        target: "all"
      })
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