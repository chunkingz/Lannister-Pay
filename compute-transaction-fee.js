const express = require('express');
const {getData, errorsArr} = require('./connect-redis');

const app = express();
app.use(express.json());

/**
 * Fee computation endpoint
 * @param {any} req 
 * @param {any} res 
 */
const computeTransactionFee = async (req, res) => {
    console.log('Fee computation endpoint')

    const transactionPayload = req.body
    const { Amount, Currency, CurrencyCountry, Customer, PaymentEntity } = req.body

    if( Currency != 'NGN' || CurrencyCountry != 'NG') {
        res.status(400).send({
            "Error": "No fee configuration for USD transactions."
        })
    } else {
        let finalResponse = await getData([Amount, Currency, CurrencyCountry, Customer, PaymentEntity])

        // check to make sure the FCS data is valid
        if(errorsArr().length > 0) {
            res.status(400).send({
                "error": errorsArr()
            })
        } else {
            res.status(200).send(finalResponse)
        }
  
        // reset the errors array to avoid duplication
        errorsArr().length = 0

    }
}

module.exports = computeTransactionFee
