module.exports = async (req, res) => {
  // Configurações básicas
  const apiUrl = 'https://api.pushalert.co/rest/v1/send';
  const apiKey = 'SUA_API_KEY_AQUI'; // Substitua pela sua chave de API do PushAlert
  
  // Mensagem de notificação (pode ser personalizada conforme necessidade)
  const notificationData = {
    title: "Nova Atualização!",
    message: "Temos novidades para você!",
    url: "https://seusite.com", // URL para redirecionamento ao clicar
    icon: "https://seusite.com/icon.png" // URL do ícone
  };

  try {
    // Enviar a notificação para todos os usuários
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `api_key=${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(notificationData)
    });

    const result = await response.json();

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Notificação enviada com sucesso!",
        data: result
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Falha ao enviar notificação",
        error: result
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erro no servidor",
      error: error.message
    });
  }
};