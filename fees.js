const express = require('express');
const  {fcsValidator, errorsArr} = require('./fcsValidator');
const {connectRedis} = require('./connect-redis')

const app = express();
app.use(express.json());


/**
 * Fee setup endpoint
 * @param {any} req 
 * @param {any} res 
 */
const fees = (req, res) => {
    console.log('Fee setup endpoint')

    const fcs = (req.body.FeeConfigurationSpec).split("\n")

    const comparisonData = fcsValidator(fcs);

    connectRedis(comparisonData, fcs)

    // check to make sure the FCS data is valid
    if(errorsArr().length > 0) {
      res.status(400).send({
        "status": "Bad Request",
        "error": "Invalid fee configuration spec.",
        "errorData": errorsArr()
      })
    } else {
      res.status(200).send({
        "status": "ok",
        "data": fcs,
      })
    }

    // reset the errors array to avoid duplication
    errorsArr().length = 0
    
}

module.exports = fees
