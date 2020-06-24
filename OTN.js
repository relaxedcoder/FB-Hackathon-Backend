const fetch = require('node-fetch')
const qs = require('querystring')

module.exports = async (user, medicine) => {
    const response = await fetch('https://graph.facebook.com/v7.0/me/messages?' +
        qs.stringify({
            access_token: process.env.PAGE_ACCESS_TOKEN
        }), {
        method: 'post',
        body: JSON.stringify({
            'recipient': {
                'id': user.psid
            },
            'message': {
                'attachment': {
                    'type': 'template',
                    'payload': {
                        'template_type': 'one_time_notif_req',
                        'title': `Notify when ${medicine} is restocked`,
                        'payload': `${medicine}_OTN`
                    }
                }
            }
        }),
        headers: { 'Content-Type': 'application/json' }
    })
}