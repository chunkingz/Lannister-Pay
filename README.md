# Lannister Pay (Flutterwave NodeJS Assessment)

Payment processing involves several components / services. One of such is determining the processing fee to charge per transaction. This is about implementing an NGN (Nigerian Naira) fee processing service for a fictional Payment Processor (LannisterPay).

LannisterPay has reached out, to help implement a transaction fee processing service. This service is meant to calculate the fee applicable to a transaction based on specific fee configurations.

LannisterPay uses a custom fee configuration spec (FCS) to describe applicable fees.

<br>

## How to use :bulb:

Clone the repo by typing the command below into your terminal.

```
git clone https://github.com/chunkingz/Lannister-Pay.git
```

```
cd Lannister-Pay
``` 


---
<br>

## Development server :sparkles:

Type `npm run dev` for a dev server. Open Postman and nav using the POST verb to `http://localhost:5000/fees` or `http://localhost:5000/compute-transaction-fee` supplying the required payloads.

---
<br>

## Sample Payload to test /fees :rocket:

```
{
  "FeeConfigurationSpec": "LNPY1221 NGN * *(*) : APPLY PERC 1.4\nLNPY1222 NGN INTL CREDIT-CARD(VISA) : APPLY PERC 5.0\nLNPY1223 NGN LOCL CREDIT-CARD(*) : APPLY FLAT_PERC 50:1.4\nLNPY1224 NGN * BANK-ACCOUNT(*) : APPLY FLAT 100\nLNPY1225 NGN * USSD(MTN) : APPLY PERC 0.55"
}
```

---
<br>

## Sample Payload to test /compute-transaction-fee :fire:

```
{
    "ID": 91203,
    "Amount": 5000,
    "Currency": "NGN",
    "CurrencyCountry": "NG",
    "Customer": {
        "ID": 2211232,
        "EmailAddress": "anonimized29900@anon.io",
        "FullName": "Abel Eden",
        "BearsFee": true
    },
    "PaymentEntity": {
        "ID": 2203454,
        "Issuer": "GTBANK",
        "Brand": "MASTERCARD",
        "Number": "530191******2903",
        "SixID": 530191,
        "Type": "CREDIT-CARD",
        "Country": "NG"
    }
}
```

---

- :bowtie: yours truly
