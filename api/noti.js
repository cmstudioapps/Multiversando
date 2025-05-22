module.exports = async (req, res) => {
  // Configurações da API PushAlert
  const apiUrl = 'https://api.pushalert.co/rest/v1/send';
  const apiKey = '4963a3ae3e6d00a306ccf1ad9b15fb1c'; // Sua API key
  
  // Dados da notificação com validação robusta
  const notificationData = {
    title: (req.query.title || "Notificação Importante").toString().substring(0, 100), // Limita a 100 caracteres
    message: (req.query.message || "Você tem uma nova mensagem!").toString().substring(0, 250), // Limita a 250 caracteres
    url: (req.query.url || "https://seusite.com").toString(),
    icon: req.query.icon ? req.query.icon.toString() : undefined // Opcional
  };

  // Validação rigorosa dos campos
  if (!notificationData.title.trim() || !notificationData.message.trim() || !notificationData.url.trim()) {
    return res.status(400).json({
      success: false,
      message: "Parâmetros inválidos",
      details: {
        title_required: "Mínimo 1 caractere",
        message_required: "Mínimo 1 caractere",
        url_required: "URL válida (ex: https://...)",
        current_values: notificationData
      }
    });
  }

  try {
    // Preparar o corpo da requisição removendo campos undefined
    const requestBody = JSON.parse(JSON.stringify(notificationData));
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `api_key=${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const result = await response.json();

    // Verificação detalhada da resposta
    if (!response.ok || !result.success) {
      console.error('Erro na API PushAlert:', result);
      return res.status(400).json({
        success: false,
        message: "Falha na API PushAlert",
        api_response: result,
        sent_data: notificationData
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notificação push enviada!",
      notification_id: result.id,
      recipients: result.recipients
    });

  } catch (error) {
    console.error('Erro no servidor:', error);
    return res.status(500).json({
      success: false,
      message: "Erro interno no servidor",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};