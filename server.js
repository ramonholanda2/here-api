const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8181;
const axios = require('axios')
const cors = require('cors')

app.use(cors())

app.use(express.json())

app.use("/public", cors(), express.static(path.join(__dirname, 'public')));

app.get('/', cors(), (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.post('/api/rotas', async (req, res) => {


  const URL = "https://my367994.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/RouteCollection";

  await axios.get(URL+"?$top=1", {
    headers: {
      'Authorization': 'Basic Q0FTU0lBTkUuQ09GQ0VXSUNaOkZvcnRsZXZAMjAyNUZvcnRsZXZAMjAyNSEh',
      "x-csrf-token": "fetch"
    }
  }).then( async (res) => {

    const csrfToken = res.headers['x-csrf-token'];
    const cookies = res.headers['set-cookie']; 

    await axios.post(URL, req.body, {
      headers: {
        'Content-Type': "application/json",
        'Authorization': 'Basic Q0FTU0lBTkUuQ09GQ0VXSUNaOkZvcnRsZXZAMjAyNUZvcnRsZXZAMjAyNSEh',
        'x-csrf-token': csrfToken,
        'Cookie': cookies.join('; ')
      },
    }).catch(err => console.log(err))
  })

  res.sendStatus(201);

})

app.get('/api/clientes', cors(), async (req, res) => {

  const url = `https://my367994.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi/CorporateAccountCollection?$filter=OwnerID eq '${req.query.employeeID}'&$expand=CorporateAccountAddress&$format=json`;
  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': 'Basic Q0FTU0lBTkUuQ09GQ0VXSUNaOkZvcnRsZXZAMjAyNUZvcnRsZXZAMjAyNSEh',
      }
    });

    const data = response.data.d.results.map((customer, index) => {
      const address = customer.CorporateAccountAddress?.[0];
      return {
        id: customer.AccountID,
        nome: customer.Name,
        endereco: `${address?.FormattedPostalAddressDescription}`,
        latitude: parseFloat(address?.Latitude || 0),
        longitude: parseFloat(address?.Longitude || 0),
        status: 'vermelho'
      };
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar dados dos clientes.' });
  }
});



app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
