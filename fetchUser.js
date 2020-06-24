const fetch = require('node-fetch')
const qs = require('querystring')

module.exports = async (psid) => {
    const response = await fetch(`https://graph.facebook.com/${psid}?` +
        qs.stringify({
            access_token: process.env.PAGE_ACCESS_TOKEN,
            fields: 'first_name'
        })
    )
    const json = await response.json()
    json['psid'] = psid
    return json
}