const express = require('express');
require('dotenv').config()
const fees = require('./fees')
const computeTransactionFee = require('./compute-transaction-fee')
const {connectRedis} = require('./connect-redis')


const app = express();
app.use(express.json());

const PORT = process.env.PORT;

app.get('/', (req, res) => res.status(200).send('API service running'));

app.post('/fees', fees, connectRedis)

app.post('/compute-transaction-fee', computeTransactionFee);


app.listen(PORT, () => console.log(`Lannister Pay API Service running on port ${PORT}`));
