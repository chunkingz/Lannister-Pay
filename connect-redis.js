const redis = require('redis');

const REDIS_PORT = process.env.REDIS_PORT

let client = ''
let errors = []

const redisConf = {
  host: process.env.REDISCACHEHOSTNAME,
  port: process.env.REDIS_PORT,
  password: process.env.REDISCACHEKEY
}

  if (process.env.REDISCACHEHOSTNAME) {
    /* 
    * In prod check for Azure Cache for Redis connection
    * https://docs.microsoft.com/en-us/azure/azure-cache-for-redis/cache-nodejs-get-started
    */
    client = redis.createClient(redisConf)
  } else {
    // fall back to local connection
    client = redis.createClient(REDIS_PORT)
  }


/**
 * Connect to Redis, and perform CRUD on the data
 * @param {any} FCScomparisonData 
 * @param {any} fullData 
 */
const connectRedis = async (FCScomparisonData, fullData) => {

  await client.PING().then(
    async () => {
      saveData(FCScomparisonData, fullData)
    }, 
    async () => {
      client.on('error', (err) => console.log('Redis Client Error', err));
      client = redis.createClient(REDIS_PORT)
      await client.connect();
      saveData(FCScomparisonData, fullData)
    })

}

const saveData = async (FCScomparisonData, fullData) => {

    // store data in Redis
    await client.SET('feeCurrency', FCScomparisonData[0]);
    await client.SET('feeLocale', FCScomparisonData[1])
    await client.SET('feeEntity', FCScomparisonData[2])
    await client.SET('entityProperty', FCScomparisonData[3])

    await client.SET('fullData', fullData);

}

const getData = async (payload) => {
let finalResponse = ''

    await client.PING().then(
      async () => {
        finalResponse = await getAndCompare(payload)
      }, 
      async () => {
        client.on('error', (err) => console.log('Redis Client Error', err));
        client = redis.createClient(REDIS_PORT)
        await client.connect();
        finalResponse = await getAndCompare(payload)
      })
 
      return finalResponse
}

const getAndCompare = async (payload) => {

  const amount = payload[0]
  const currency = payload[1]
  const currencyCountry = payload[2]
  const customer = payload[3]
  const paymentEntity = payload[4]
  const payEnt = Object.values(paymentEntity).splice(0, 5)

  // let feeCurrency = await client.get('feeCurrency');
  // feeCurrency = feeCurrency.split(',')

  // let feeLocale = await client.get('feeLocale');
  // feeLocale = feeLocale.split(',')

  let feeEntity = await client.get('feeEntity');
  feeEntity = feeEntity.split(',')

  let entityProperty = await client.get('entityProperty');
  entityProperty = entityProperty.split(',')


  let feeEntityIndex = []
  // check to see which of the FEE-ENTITY matches the Payment Entity type
  feeEntity.forEach((item, index) => {
    if(item == paymentEntity.Type || item == '*') {
      feeEntityIndex.push(index)
    }
  })

  let entityPropertyIndex = []
  // check to see which of the ENTITY-PROPERTY matches the Payment Entity
  entityProperty.forEach((item, index) => {
    if(payEnt.includes(item) || item == '*') {
      entityPropertyIndex.push(index)
    }
  })

  // check to make sure the array indexes match, remove those that don't
  const matchingIndex = entityPropertyIndex.filter(n => feeEntityIndex.includes(n))


  correctFeeEntityFCS = []
  correctEntityPropertyFCS = []

  //  check for Specificity
  if(matchingIndex.length > 1){
    for(let i=0 ; i<matchingIndex.length ; i++){
      if (feeEntity[matchingIndex[i]] == paymentEntity.Type){
        correctFeeEntityFCS.push(matchingIndex[i])
      }
      if (payEnt.includes(entityProperty[matchingIndex[i]])){
        correctEntityPropertyFCS.push(matchingIndex[i])
      }
    }
  } else if(matchingIndex.length == 1){
    correctFeeEntityFCS.push(matchingIndex.toString())
    correctEntityPropertyFCS.push(matchingIndex.toString())
  } else {
    errors.push("No applicable fee configuration spec was found.")
    return
  }

  let fullFCS = await getFullFCS()

  let correctData = ''

  if(correctFeeEntityFCS.length > 0){
    correctData = fullFCS[correctFeeEntityFCS]
  } else {
    correctData = fullFCS[correctEntityPropertyFCS]
  }


  let appliedFeeValue = ''
  let appliedFeeID = correctData.split(" ")[0]
  let feeType = correctData.split(" ")[6]
  let feeValue = correctData.split(" ")[7]
  let chargeAmount = ''
  let settlementAmount = ''


  if(feeType == 'FLAT'){
    appliedFeeValue = feeValue + amount
  }

  if(feeType == 'PERC'){
    appliedFeeValue = (feeValue / 100).toFixed(3) * amount
  }

  if(feeType == 'FLAT_PERC'){
    const fv_flat = parseInt(feeValue.split(':')[0])
    const fv_perc = parseFloat(feeValue.split(':')[1])
    appliedFeeValue = fv_flat + ((fv_perc / 100).toFixed(3) * amount)
  }

  if(customer.BearsFee){
    chargeAmount = amount + appliedFeeValue
  } else {
    chargeAmount = amount
  }

  settlementAmount = chargeAmount - appliedFeeValue

  const finalValues = {
    "AppliedFeeID": appliedFeeID, 
    "AppliedFeeValue": appliedFeeValue, 
    "ChargeAmount": chargeAmount, 
    "SettlementAmount": settlementAmount
  }

  return finalValues

}

const getFullFCS = async () => {
  let fullData = await client.get('fullData');
  fullData = fullData.split(',')
  return fullData
}

/**
 * Captures any FCS error and returns
 * @returns Array[]
 */
 const errorsArr = () => {
  return errors
}

module.exports = {connectRedis, saveData, getData, errorsArr}
