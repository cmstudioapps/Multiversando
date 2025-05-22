module.exports = async (req, res) => {
  const apiUrl = 'https://api.pushalert.co/rest/v1/send';
  const apiKey = '4963a3ae3e6d00a306ccf1ad9b15fb1c';

  // Dados da notificação conforme exigido pela API
  const notificationData = {
    title: "Atualização do Sistema",       // Obrigatório
    message: "Nova versão disponível!",    // Obrigatório
    url: "https://multiversando.vercel.app", // Obrigatório
    // Campos opcionais
    icon: "https://i.imgur.com/KkGuZYf.png",
    image: "",
    button_text: "Ver Novidades",          // Nome do campo corrigido
    ttl: 3600                             // Nome do campo corrigido
  };

  // Remove campos vazios ou não definidos
  const payload = Object.fromEntries(
    Object.entries(notificationData).filter(([_, v]) => v !== null && v !== "")
  );

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `api_key=${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error('Erro na API PushAlert:', {
        status: response.status,
        response: result,
        payload_sent: payload
      });
      return res.status(400).json({
        success: false,
        message: "Falha ao enviar notificação",
        api_error: result.msg || "Erro desconhecido",
        payload_sent: payload
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notificação enviada com sucesso!",
      notification_id: result.id,
      stats: {
        enviados: result.recipients,
        entregues: result.delivered
      }
    });

  } catch (error) {
    console.error('Erro no servidor:', {
      error: error.message,
      stack: error.stack
    });
    return res.status(500).json({
      success: false,
      message: "Erro interno no servidor",
      error: "Erro ao processar a requisição"
    });
  }
};