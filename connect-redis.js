const redis = require('redis');

const REDIS_PORT = process.env.REDIS_PORT || 6379

const client = redis.createClient(REDIS_PORT)


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

    await client.PING().then(
      async () => {
        getAndCompare(payload)
      }, 
      async () => {
        client.on('error', (err) => console.log('Redis Client Error', err));
        await client.connect();
        getAndCompare(payload)
      })
 
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


  // console.log(feeCurrency);
  // console.log(feeLocale);
  console.log(feeEntity);
  console.log(entityProperty);


  let feeEntityIndex = []
  // check to see which of the FEE-ENTITY matches the Payment Entity type
  feeEntity.forEach((item, index) => {
    if(item == paymentEntity.Type || item == '*') {
      feeEntityIndex.push(index)
    }
  })
  console.log(feeEntityIndex);

  let entityPropertyIndex = []
  // check to see which of the ENTITY-PROPERTY matches the Payment Entity
  entityProperty.forEach((item, index) => {
    if(payEnt.includes(item) || item == '*') {
      entityPropertyIndex.push(index)
    }
  })
  console.log(entityPropertyIndex);

  // check to make sure the array indexes match, remove those that don't
  const matchingIndex = entityPropertyIndex.filter(n => feeEntityIndex.includes(n))

  console.log(matchingIndex);

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
  } else {
    correctFeeEntityFCS.push(matchingIndex.toString())
    correctEntityPropertyFCS.push(matchingIndex.toString())
  }

  // console.log(correctFeeEntityFCS);
  // console.log(correctEntityPropertyFCS);

  let fullFCS = await getFullFCS()

  if(correctFeeEntityFCS.length > 0){
    console.log(fullFCS[correctFeeEntityFCS])
  } else {
    console.log(fullFCS[correctEntityPropertyFCS])
  }

}

const getFullFCS = async () => {
  let fullData = await client.get('fullData');
  fullData = fullData.split(',')
  return fullData
}


module.exports = {connectRedis, saveData, getData}
