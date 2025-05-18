export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const dados = req.body;

  if (!dados || !dados.nome || !dados.senha) {
    return res.status(400).send("Dados vazios ou incompletos");
  }

  const login = {
    nome: dados.nome,
    senha: dados.senha
  };

  delete dados.nome;
  delete dados.senha;

  fetch("https://cm-tube-default-rtdb.firebaseio.com/adm/" + login.nome + "/.json")
    .then(response => response.json())
    .then(data => {
      if (data && data.senha === login.senha) {
        // Login válido, salva no banco de dados
        fetch("https://cm-tube-default-rtdb.firebaseio.com/feed/.json", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(dados)
        })
          .then(response => response.json())
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
    .catch(error => {
      res.status(500).json({ logar: false, erro: "Erro ao verificar login: " + error });
    });
}