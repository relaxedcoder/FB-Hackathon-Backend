const fetch = require('node-fetch')
const qs = require('querystring')

send = async (user, text, quick_replies) => {
    const response = await fetch('https://graph.facebook.com/v7.0/me/messages?' +
        qs.stringify({
            access_token: process.env.PAGE_ACCESS_TOKEN
        }), {
        method: 'post',
        body: JSON.stringify({
            'messaging_type': 'RESPONSE',
            'recipient': {
                'id': user.psid
            },
            'message': {
                'text': text,
                'quick_replies': quick_replies
            }
        }),
        headers: { 'Content-Type': 'application/json' }
    })
}

module.exports = (user, text, quick_replies) => {
    if (Array.isArray(text)) {
        text.forEach((responseText, index) => {
            setTimeout(() => {
                send(user, responseText, quick_replies)
            }, 1000 * index)
        })
    }
    else send(user, text, quick_replies)
}