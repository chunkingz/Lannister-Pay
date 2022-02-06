const express = require('express');
const {getData} = require('./connect-redis');

const app = express();
app.use(express.json());

/**
 * Fee computation endpoint
 * @param {any} req 
 * @param {any} res 
 */
const computeTransactionFee = (req, res) => {
    console.log('Fee computation endpoint')

    const transactionPayload = req.body
    const { Amount, Currency, CurrencyCountry, Customer, PaymentEntity } = req.body

    if( Currency != 'NGN' || CurrencyCountry != 'NG') {
        res.status(400).send({
            "Error": "No fee configuration for USD transactions."
        })
    } else {
        // console.log([Amount, Currency, CurrencyCountry, Customer, PaymentEntity])
        getData([Amount, Currency, CurrencyCountry, Customer, PaymentEntity])

        const total = {
            "AppliedFeeID": "LNPY0222",
            "AppliedFeeValue": 230,
            "ChargeAmount": 5230,
            "SettlementAmount": 5000
        }
        res.status(200).send({
            "data": total,
            "transaction payload": transactionPayload
        })
    }
}

module.exports = computeTransactionFee
