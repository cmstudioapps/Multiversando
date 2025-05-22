module.exports = async (req, res) => {
  const apiUrl = 'https://api.pushalert.co/rest/v1/send';
  const apiKey = '4963a3ae3e6d00a306ccf1ad9b15fb1c';

  // Versão com encoding explícito e formatação garantida
  const payload = {
    title: encodeURIComponent("Teste Básico").substring(0, 100),
    message: encodeURIComponent("Testando API PushAlert").substring(0, 250),
    url: "https://multiversando.vercel.app"
  };

  // Verificação final dos campos
  if (!payload.title || !payload.message || !payload.url) {
    return res.status(400).json({
      success: false,
      message: "Validação local falhou",
      details: {
        title_length: payload.title.length,
        message_length: payload.message.length,
        url_valid: payload.url.startsWith('http')
      }
    });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `api_key=${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'PushAlert-Node-Client/1.0'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erro completo:', {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorData
      });
      
      return res.status(502).json({
        success: false,
        message: "Erro na comunicação com a API PushAlert",
        status_code: response.status,
        api_response: errorData
      });
    }

    const result = await response.json();
    return res.status(200).json(result);

  } catch (error) {
    console.error('Erro completo:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      payload_sent: payload
    });

    return res.status(500).json({
      success: false,
      message: "Erro no servidor",
      error_type: error.name,
      suggestion: "Verifique a API key e os logs do servidor"
    });
  }
};