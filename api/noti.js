module.exports = async (req, res) => {
  const apiUrl = 'https://api.pushalert.co/rest/v1/send';
  const apiKey = '4963a3ae3e6d00a306ccf1ad9b15fb1c';

  // Versão com encoding alternativo e verificação extrema
  const payload = {
    title: "Teste Final".trim(),
    message: "Última tentativa de integração".trim(),
    url: "https://multiversando.vercel.app/".trim()
  };

  // Verificação extrema dos campos
  const validation = {
    titleValid: payload.title.length > 0 && payload.title.length <= 100,
    messageValid: payload.message.length > 0 && payload.message.length <= 250,
    urlValid: payload.url.match(/^https?:\/\/.+\..+$/)
  };

  if (!validation.titleValid || !validation.messageValid || !validation.urlValid) {
    return res.status(400).json({
      success: false,
      message: "Validação local falhou",
      validation,
      payload
    });
  }

  try {
    // Método alternativo usando XMLHttpRequest
    const result = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', apiUrl, true);
      xhr.setRequestHeader('Authorization', `api_key=${apiKey}`);
      xhr.setRequestHeader('Content-Type', 'application/json');
      
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch (e) {
              resolve(xhr.responseText);
            }
          } else {
            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
          }
        }
      };
      
      xhr.onerror = function() {
        reject(new Error('Erro de conexão'));
      };
      
      xhr.send(JSON.stringify(payload));
    });

    if (result && result.success) {
      return res.status(200).json({
        success: true,
        notification_id: result.id,
        recipients: result.recipients
      });
    }

    return res.status(400).json({
      success: false,
      message: "API PushAlert retornou erro",
      api_response: result
    });

  } catch (error) {
    console.error('Erro crítico:', {
      timestamp: new Date().toISOString(),
      error: error.message,
      payload,
      stack: error.stack
    });

    return res.status(503).json({
      success: false,
      message: "Serviço indisponível",
      technical_message: "Falha persistente na comunicação com PushAlert",
      action_required: [
        "Verifique a API Key no dashboard",
        "Confira os logs de erro do PushAlert",
        "Contate o suporte técnico do PushAlert"
      ],
      support_contact: "support@pushalert.co"
    });
  }
};