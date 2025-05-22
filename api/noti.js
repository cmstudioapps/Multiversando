module.exports = async (req, res) => {
  // Configurações fixas (pré-definidas)
  const apiUrl = 'https://api.pushalert.co/rest/v1/send';
  const apiKey = '4963a3ae3e6d00a306ccf1ad9b15fb1c';
  
  // Mensagem totalmente pré-definida no código
  const notificationData = {
    title: "Atualização do Sistema",
    message: "Nova versão disponível! Clique para saber mais.",
    url: "https://multiversando.vercel.app",
    icon: "https://i.imgur.com/KkGuZYf.png",
    // Campos adicionais suportados pela API
    
    button: "Ver Novidades",
    timeToLive: 3600 // 1 hora em segundos
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `api_key=${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(notificationData)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error('Erro na API PushAlert:', {
        status: response.status,
        response: result
      });
      return res.status(400).json({
        success: false,
        message: "Falha ao enviar notificação pré-definida",
        error: result.msg || "Erro desconhecido na API",
        notification_data: notificationData
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notificação pré-definida enviada com sucesso!",
      notification_id: result.id,
      stats: {
        recipients: result.recipients,
        delivered: result.delivered,
        failed: result.failed
      }
    });

  } catch (error) {
    console.error('Erro no servidor:', error);
    return res.status(500).json({
      success: false,
      message: "Erro ao processar notificação pré-definida",
      error: error.message
    });
  }
};