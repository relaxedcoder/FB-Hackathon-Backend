const express = require('express')
const app = express()
require('dotenv').config()

const bodyParser = require('body-parser')
app.use(bodyParser.json())

const fetch = require('node-fetch')
const qs = require('querystring')

const fetchUser = require('./fetchUser.js')
const handleWebhook = require('./handleWebhook.js')
const db = require('./database')

setInterval(() => {
    db.notifyRestock()
}, 5000)

app.get("/webhook", (req, res) => {
    // Parse the query params
    let mode = req.query["hub.mode"]
    let token = req.query["hub.verify_token"]
    let challenge = req.query["hub.challenge"]

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {
        // Checks the mode and token sent is correct
        if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
            // Responds with the challenge token from the request
            res.status(200).send(challenge)
        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403)
        }
    }
})

app.post('/webhook', (req, res) => {
    var { body } = req

    if (body.object === "page") {
        res.status(200).send("EVENT_RECEIVED")

        body.entry.forEach(async entry => {

            //Check standby for Start over
            if (entry.standby) {
                if (entry.standby[0].message.text.trim().toLowerCase().includes('start over')) {
                    const response = await fetch('https://graph.facebook.com/v2.6/me/take_thread_control?' +
                        qs.stringify({
                            access_token: process.env.PAGE_ACCESS_TOKEN
                        }), {
                        method: 'post',
                        body: JSON.stringify({
                            'recipient': {
                                'id': entry.standby[0].sender.id
                            }
                        }),
                        headers: { 'Content-Type': 'application/json' }
                    })
                    var user = await fetchUser(entry.standby[0].sender.id)
                    handleWebhook({
                        message: {
                            quick_reply: {
                                payload: 'START_OVER'
                            }
                        }
                    }, user)
                }
            }

            //App is primary receiver
            else {
                var webhookEvent = entry.messaging[0]
                if ("read" in webhookEvent || "delivery" in webhookEvent) return

                //Get user PSID and info
                var psid = webhookEvent.sender.id
                var user = await fetchUser(psid)

                //Add OTN to medicine in database
                if (webhookEvent.optin) {
                    if (webhookEvent.optin.type === 'one_time_notif_req') {
                        var med = webhookEvent.optin.payload.split('_')[0]
                        db.addOTN(med, webhookEvent.optin.one_time_notif_token)
                        handleWebhook({
                            message: {
                                quick_reply: {
                                    payload: 'NOTIFY'
                                }
                            }
                        }, user)
                    }
                }

                //Handle webhookEvent
                handleWebhook(webhookEvent, user)
            }
        })
    } else {
        res.sendStatus(404)
    }
})

app.listen(process.env.PORT || 8000)