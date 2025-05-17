export default function handler(req, res) {
  const url = "https://palavras-22e2c-default-rtdb.firebaseio.com/";
  const { sala, ver, ...valores } = req.query;

  if (!sala) {
    return res.status(400).json({ error: "O parâmetro 'sala' é obrigatório." });
  }

  if (ver === "true") {
    fetch(url + sala + "/.json")
      .then(response => response.json())
      .then(data => {
        if (valores.valores) {
          const keys = valores.valores.split(",");
          const responseData = {};
          let singleValue = null;
          let isSingleKey = keys.length === 1;

          keys.forEach(key => {
            if (data[key] !== undefined) {
              responseData[key] = data[key];
              if (isSingleKey) {
                singleValue = data[key];
              }
            }
          });

          if (isSingleKey) {
            if (singleValue !== null) {
              return res.status(200).send(singleValue.toString());
            }
            return res.status(404).send("Valor não encontrado");
          }

          return res.status(200).json(responseData);
        } else {
          return res.status(200).json(data);
        }
      })
      .catch(error => {
        res.status(500).json({ error: "Erro ao recuperar os dados.", detalhes: error.message });
      });
  } else if (ver === "false") {
    fetch(url + sala + "/.json", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(valores),
    })
      .then(response => response.json())
      .then(data => {
        res.status(200).json({ message: "Dados enviados com sucesso!", response: data });
      })
      .catch(error => {
        res.status(500).json({ error: "Erro ao enviar os dados.", detalhes: error.message });
      });
  } else {
    res.status(400).json({ error: "O parâmetro 'ver' deve ser 'true' ou 'false'." });
  }
}