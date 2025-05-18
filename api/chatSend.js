export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://multiversando.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const dados = req.body;

  if (!dados || !dados.senha || !dados.nome) {
    return res.status(400).send("Dados vazios ou incompletos");
  }

  const login = {
    senha: dados.senha,
    nome: dados.nome
  };

  delete dados.senha;
  delete dados.nome;

  fetch("https://cm-tube-default-rtdb.firebaseio.com/adm/" + login.nome + ".json")
    .then(response => response.json())
    .then(data => {
      if (data && data.senha === login.senha) {
        // Primeiro envia a mensagem ao banco, depois responde ao cliente
        enviar(dados)
          .then(() => {
            res.status(200).json({ logar: true, mensagem: "Enviado ao banco de dados com sucesso!" });
          })
          .catch(error => {
            res.status(500).json({ logar: true, erro: "Erro ao enviar ao banco de dados: " + error });
          });
      } else {
        res.status(401).json({ logar: false, erro: "Senha ou nome incorretos" });
      }
    })
    .catch(err => {
      res.status(500).json({ logar: false, erro: "Erro ao verificar login" });
    });

  function enviar(dadosLimpos) {
    return fetch("https://cm-tube-default-rtdb.firebaseio.com/chat/.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dadosLimpos)
    }).then(response => response.json());
  }
}