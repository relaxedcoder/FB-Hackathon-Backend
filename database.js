const MongoClient = require('mongodb').MongoClient
const assert = require('assert')

const url = 'mongodb+srv://khanna:honululu@cluster69-ddhsv.mongodb.net'

const dbName = 'Medeli'
var db

const fetch = require('node-fetch')
const qs = require('querystring')
const send = require('./send')

MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
    assert.equal(null, err)
    console.log('Connected')

    db = client.db(dbName)
})

module.exports.getMedicines = async () => {
    return await db.collection('Medicine').find({}).toArray()
}

module.exports.updateStock = async (medicines) => {
    medicines.forEach(medicine => {
        db.collection('Medicine').findOneAndUpdate({ name: medicine }, { $inc: { stock: -1 } })
    })
}

module.exports.notifyRestock = async () => {
    if (db) {
        (await db.collection('Medicine').find({}).toArray()).forEach(medicine => {
            if (medicine.stock > 0) {
                medicine.otn.forEach(userOTN => {
                    sendOTN(userOTN, medicine.name)
                    db.collection('Medicine').updateOne({ name: medicine.name }, {
                        $set: { otn: [] }
                    })
                })
            }
        })
    }
}

sendOTN = (userOTN, medName) => {
    fetch('https://graph.facebook.com/v7.0/me/messages?' +
        qs.stringify({
            access_token: process.env.PAGE_ACCESS_TOKEN
        }), {
        method: 'post',
        body: JSON.stringify({
            'recipient': {
                'one_time_notif_token': userOTN
            },
            'message': {
                'text': `This is to notify you that ${medName} is back in stock.`
            }
        }),
        headers: { 'Content-Type': 'application/json' }
    })
}

module.exports.addOTN = async (medicine, OTN) => {
    db.collection('Medicine').updateOne({ name: medicine }, {
        $push: {
            otn: OTN
        }
    })
}