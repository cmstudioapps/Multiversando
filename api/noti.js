export default async function handler(req, res) {
  try {
    const response = await fetch("https://api.pushalert.co/rest/v1/send", {
      method: "POST",
      headers: {
        "Authorization": "4963a3ae3e6d00a306ccf1ad9b15fb1c",
        "Content-Type":"application/json"
      },
      body: new JSON.stringify({
        title: "Notificação de Teste",
        message: "Isso é um teste com PushAlert",
        url: "https://multiversando.vercel.app",
        image: ""
      })
    });

    const text = await response.text(); // Para entender o que vem de resposta
    console.log("Resposta PushAlert:", text);

    // Tenta converter para JSON, se for possível
    try {
      const json = JSON.parse(text);
      res.status(200).json(json);
    } catch (e) {
      res.status(200).send(text); // Retorna como texto simples se não for JSON
    }

  } catch (err) {
    console.error("Erro:", err);
    res.status(500).json({ error: err.message });
  }
}