export default async function handler(req, res) {
  try {
    const response = await fetch("https://pushalert.co/api/v1/notification/send", {
      method: "POST",
      headers: {
        "Authorization": "4963a3ae3e6d00a306ccf1ad9b15fb1c",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        title: "Notificação de Teste",
        message: "Isso é um teste com PushAlert",
        url: "https://multiversando.vercel.app",
        image: ""
      })
    });

    const data = await response.json();
    res.status(200).json(data);

  } .catch(err => {
  console.error("Erro:", err);
  res.status(500).json({ error: err.message });
});
}