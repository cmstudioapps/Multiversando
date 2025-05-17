export default function handler (req, res) {

const { dados } = req.body


fetch("https://cm-tube-default-rtdb.firebaseio.com/feed/.json", {

method: "POST",
headers: {
"Content-Type":"application/json"
},
body: JSON.stringify(dados)

}).then(response => response.json())
.then( data => res.status(200).send("Enviado ao banco de dados com sucesso!"))
.catch(error => res.status(400).send("Erro ao enviar ao banco de dados: "+error))



}