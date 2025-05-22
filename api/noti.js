// api/notificar.js
export default async function handler(req, res) {
  const response = await fetch('https://pushalert.co/api/v1/send', {
    method: 'POST',
    headers: {
      'Authorization': '4963a3ae3e6d00a306ccf1ad9b15fb1c',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Nova notificação!',
      message: 'Você recebeu uma notificação via PushAlert.',
      targetUrl: 'https://seusite.com',
      // outros parâmetros opcionais aqui
    }),
  });

  const data = await response.json();

  res.status(200).json(data);
}