module.exports = async (req, res) => {
  const apiUrl = 'https://api.pushalert.co/rest/v1/send';
  const apiKey = '4963a3ae3e6d00a306ccf1ad9b15fb1c';

  // Versão mínima obrigatória
  const payload = {
    title: "Teste Básico",
    message: "Testando API PushAlert",
    url: "https://multiversando.vercel.app"
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `api_key=${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Resposta completa da API:', {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: result
      });
      
      return res.status(400).json({
        success: false,
        message: "Resposta inválida da API",
        api_status: response.status,
        api_response: result,
        debug_info: {
          payload_sent: payload,
          timestamp: new Date().toISOString()
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Erro completo:', {
      error: error,
      request_details: {
        url: apiUrl,
        headers: {
          'Authorization': `api_key=${apiKey.substring(0, 5)}...`,
          'Content-Type': 'application/json'
        },
        body: payload
      }
    });
    
    return res.status(500).json({
      success: false,
      message: "Erro na comunicação com a API",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};