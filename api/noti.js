export default async function handler(req, res) {
  try {
    const response = await fetch('https://pushalert.co/api/v1/send', {
      method: 'POST',
      headers: {
        'Authorization': '4963a3ae3e6d00a306ccf1ad9b15fb1c',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Nova notificação!',
        message: 'Você recebeu uma notificação via PushAlert.',
        targetUrl: 'https://multiversando.vercel.app',
      }),
    });

    const text = await response.text(); // Pegue o texto cru para ver mesmo que não seja JSON

    console.log('Status da resposta:', response.status);
    console.log('Resposta completa:', text);

    if (!response.ok) {
      throw new Error(`Erro da API PushAlert: ${response.status}`);
    }

    res.status(200).json({ success: true, response: text });
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    res.status(500).json({ error: 'Erro interno na função' });
  }
}