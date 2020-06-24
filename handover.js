const fetch = require('node-fetch')
const qs = require('querystring')

module.exports = async (user) => {
    const response = await fetch('https://graph.facebook.com/v2.6/me/pass_thread_control?' +
        qs.stringify({
            access_token: process.env.PAGE_ACCESS_TOKEN
        }), {
        method: 'post',
        body: JSON.stringify({
            recipient: {
                id: user.psid
            },
            target_app_id: process.env.PAGE_INBOX
        }),
        headers: { 'Content-Type': 'application/json' }
    })
}