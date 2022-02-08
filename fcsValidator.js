let errors = []

/**
 * The Fee Configuration Spec (FCS) Validator function
 * @param {any} args 
 */
const fcsValidator = (args) => {
    let fcsData = []
    let compareFeeCurrency = []
    let compareFeeLocale = []
    let compareFeeEntity = []
    let compareEntityProperty = []

    for(let i=0 ; i < args.length ; i++) {
        fcsData.push(args[i].split(" "))
    }
    for(let j=0 ; j < fcsData.length ; j++){
        fcsData[j].splice(4, 2)

        compareFeeCurrency.push(fcsData[j][1])

        compareFeeLocale.push(fcsData[j][2])


        const FeeEntity = fcsData[j][3]
        let myArray1 = FeeEntity.split("(");
        let myArray2 = myArray1[1].split(")");

        compareFeeEntity.push(myArray1[0])

        compareEntityProperty.push(myArray2[0])

    }

    return [ compareFeeCurrency, compareFeeLocale, compareFeeEntity, compareEntityProperty ]
}

/**
 * Fee ID
 * spec: LNPY1221 | 8-Character (Alphanumeric)
 * @param {string} FeeID 
*/
const checkFeeID = (FeeID) => {
    if(FeeID.length == 8 &&  /^(LNPY)/gmi.test(FeeID)) {
        //console.log(`FeeID is valid`)
    } else {
        errors.push(`${FeeID} is not valid`)
    }
}

/**
 * Fee Currency
 * spec: The Currency that the FCS is applicable to
 * supported values: Nigerian Naira (NGN) | *
 * @param {string} FeeCurrency 
*/
const checkFeeCurrency = (FeeCurrency) => {
    if((FeeCurrency.length == 3 &&  /^(NGN)/gmi.test(FeeCurrency)) || FeeCurrency == '*') {
        //console.log(`FeeCurrency is valid`)
    } else {
        errors.push(`${FeeCurrency} is not valid`)
    }
}

/**
 * Fee Locale
 * spec: The Locale that the FCS is applicable in
 * supported values: LOCL | INTL | *
 * @param {string} FeeLocale 
*/
const checkFeeLocale = (FeeLocale) => {
    const locale = ['LOCL', 'INTL', '*']
    if(locale.includes(FeeLocale)) {
        //console.log(`FeeLocale is valid`)
    } else {
        errors.push(`${FeeLocale} is not valid`)
    }

}

/**
 * Fee Entity
 * spec: The entity to be charged for the transaction. This could be a credit / debit card, a USSD mobile number, a Nigerian Bank account OR a Wallet ID
 * supported values: CREDIT-CARD | DEBIT-CARD | BANK-ACCOUNT | USSD | WALLET-ID | *
 * @param {string} FeeEntity 
*/
const checkFeeEntity = (FeeEntity) => {
    const entity = ['CREDIT-CARD', 'DEBIT-CARD', 'BANK-ACCOUNT', 'USSD', 'WALLET-ID', '*']
    if(entity.includes(FeeEntity)) {
        //console.log(`FeeEntity is valid`)
    } else {
        errors.push(`${FeeEntity} is not valid`)
    }
}

/**
 * Entity Property
 * spec: This is used to define specificity. It refers to any of the valid payment entity properties. 
 * supported values: String | *
 * @param {string} EntityProperty 
*/
const checkEntityProperty = (EntityProperty) => {
    if(EntityProperty.trim().length > 0 || EntityProperty == '*') {
        //console.log(`EntityProperty is valid`)
    } else {
        errors.push(`${EntityProperty} is not valid`)
    }
}

/**
 * Fee Type
 * spec: The type of the fee that defines how it is applied.
 * supported values: FLAT | PERC | FLAT_PERC
 * @param {string} FeeType 
*/
const checkFeeType = (FeeType) => {
    const entity = ['FLAT', 'PERC', 'FLAT_PERC']
    if(entity.includes(FeeType)) {
        //console.log(`FeeType is valid`)
    } else {
        errors.push(`${FeeType} is not valid`)
    }
}

/**
 * Fee Value
 * spec: The value of the fee to be applied.
 * supported values: Numbers > 0
 * @param {string} FeeValue 
*/
const checkFeeValue = (FeeValue) => {
    if(FeeValue.includes(':')) {
        const fv = FeeValue.split(':')
        if((fv[0] > 0) && (fv[1] > 0)) {
            //console.log(`FeeValue is valid`)
        } else {
            errors.push(`${FeeValue} is not valid`)
        }
    }else if(FeeValue > 0) {
        //console.log(`FeeValue is valid`)
    } else {
        errors.push(`${FeeValue} is not valid`)
    }
}

/**
 * Captures any FCS error and returns
 * @returns Array[]
 */
const errorsArr = () => {
    return errors
}

module.exports = {fcsValidator, errorsArr};