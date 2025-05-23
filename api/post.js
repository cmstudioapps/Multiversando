export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://multiversando.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ message: "Método não permitido, use POST" });
    return;
  }

  const dados = req.body;

  if (!dados || !dados.nome || !dados.senha) {
    res.status(400).json({ message: "Dados vazios ou incompletos" });
    return;
  }

  if (dados.texto && dados.texto.length < 100) {
    res.status(400).json({ message: "É preciso mais de 100 caracteres" });
    return;
  }

  const login = {
    nome: dados.nome,
    senha: dados.senha
  };

  // Remover campos de login para não salvar no feed
  delete dados.nome;
  delete dados.senha;

  try {
    // Verifica login
    const loginResponse = await fetch("https://cm-tube-default-rtdb.firebaseio.com/adm/" + login.nome + "/.json");
    const loginData = await loginResponse.json();

    if (!loginData || loginData.senha !== login.senha) {
      res.status(401).json({ logar: false, erro: "Senha ou nome incorretos" });
      return;
    }

    // Salva no Realtime Database
    const saveResponse = await fetch("https://cm-tube-default-rtdb.firebaseio.com/feed/.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });

    if (!saveResponse.ok) {
      throw new Error("Erro ao salvar dados no banco");
    }

    // Se titulo e texto existirem, envia notificação
if (dados.titulo && dados.texto) {
  const textoLimitado = dados.texto.length > 100 
  ? dados.texto.substring(0, 80) + "..."  // Mudei para 80 caracteres como você pediu
  : dados.texto; // Corrigido o typo aqui

  await fetch("https://onesignal.com/api/v1/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Basic os_v2_app_bbokkq4cnjhqjgbuwznbkiownitgq65d3bxeype2owlhizj2mpssgw55rwb3dhgvlw3fal47ozqpvbpbo46xfegudi2btyl4yctrowa"
    },
    body: JSON.stringify({
      app_id: "085ca543-826a-4f04-9834-b65a1521d66a",
      included_segments: ["All"],
      headings: { pt: dados.titulo, en: dados.titulo },
      contents: { pt: textoLimitado, en: textoLimitado },
      url: "https://multiversando.vercel.app/index.html",
  big_picture: dados.imagem
    })
  });
}

    res.status(200).json({ logar: true, mensagem: "Enviado ao banco de dados com sucesso e notificação disparada!" });

  } catch (error) {
    res.status(500).json({ logar: false, erro: "Erro no servidor: " + error.message });
  }
}