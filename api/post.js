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
      await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic os_v2_app_yjeezj3nbzaupifjdimjlxwd7z5n6mrvptzuxeuiswcttgjosbfivdd3z3rvk4l5s2gdsg32egyhjk5fkkljdriwdfibr67l372ih2y"
        },
        body: JSON.stringify({
          app_id: "c2484ca7-6d0e-4147-a0a9-1a1895dec3fe",
          included_segments: ["All"],
          headings: { pt: dados.titulo, en: dados.titulo },
          contents: { pt: dados.texto, en: dados.texto },
          url: dados.url || "https://multiversando.vercel.app"
        })
      });
    }

    res.status(200).json({ logar: true, mensagem: "Enviado ao banco de dados com sucesso e notificação disparada!" });

  } catch (error) {
    res.status(500).json({ logar: false, erro: "Erro no servidor: " + error.message });
  }
}