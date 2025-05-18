export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://multiversando.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const dados  = req.body;
  const login = {dados.senha,dados.nome}
  delete dados.senha
  delete dados.nome
  if (!dados) {
    return res.status(400).send("Dados vazios");
  }

  fetch("https://cm-tube-default-rtdb.firebaseio.com/chat/.json", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(dados)
  })
    .then(response => response.json())
    .then(data => res.status(200).send("Enviado ao banco de dados com sucesso!"))
    .catch(error => res.status(400).send("Erro ao enviar ao banco de dados: " + error));
}