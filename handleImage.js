const Tesseract = require('tesseract.js')
const db = require('./database')
const OTN = require('./OTN.js')

module.exports = async (imageURL, user) => {

    var meds = await db.getMedicines()

    var wordsArray = (await Tesseract.recognize(imageURL, 'eng')).data.text
    wordsArray = wordsArray.replace(/\n|\.|\,|\(|\)/g, ' ')
    wordsArray = wordsArray.split(/ +/)

    var numMeds = 0
    var flag = false

    var medicines = []
    wordsArray.forEach(word => {
        if (word) {
            word = word.toLowerCase()
            meds.forEach(med => {
                if (med.name === word) {
                    flag = true
                    if (med.stock > 0) {
                        medicines.push(med.name)
                        med.stock = med.stock - 1
                        numMeds = numMeds + 1
                    }
                    else {
                        medicines.push(med.name + ' - ' + 'Out of stock')
                        OTN(user, med.name)
                    }
                }
            })
        }
    })

    db.updateStock(medicines)

    if (flag) {
        if (numMeds > 0) {
            return {
                text: [medicines.join('\n'), 'Do you want to confirm your order?'],
                quick_replies: [
                    {
                        "content_type": "text",
                        "title": "Confirm",
                        "payload": "CONFIRM_ORDER"
                    }, {
                        "content_type": "text",
                        "title": "Talk to human agent",
                        "payload": "HUMAN_AGENT"
                    }, {
                        "content_type": "text",
                        "title": "Start over",
                        "payload": "START_OVER"
                    }
                ]
            }
        }
        else return {
            text: [medicines.join('\n')]
        }
    }
    else return {
        text: [
            'Sorry, we could not detect any medicines.',
            'Do you want to chat with a human agent?'
        ],
        quick_replies: [
            {
                "content_type": "text",
                "title": "Yes",
                "payload": "HUMAN_AGENT"
            }, {
                "content_type": "text",
                "title": "Start over",
                "payload": "START_OVER"
            }
        ]
    }
}