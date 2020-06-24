const generateResponse = require('./generateResponse')
const send = require('./send')
const handleImage = require('./handleImage')
const handover = require('./handover')

module.exports = (webhookEvent, user) => {
    var response = {
        text: '',
        quick_replies: []
    }

    //Handle image attachment containing prescription
    if (webhookEvent.message.attachments) {
        webhookEvent.message.attachments.forEach(async attachment => {
            if (attachment.type === 'image') {
                response = await handleImage(attachment.payload.url, user)
                send(user, response.text, response.quick_replies)
            }
        })
    }

    //Handle quick replies
    else if (webhookEvent.message.quick_reply) {
        if (webhookEvent.message.quick_reply.payload === 'HUMAN_AGENT' ||
            webhookEvent.message.quick_reply.payload === 'WRITTEN') handover(user)
        response = generateResponse(webhookEvent.message.quick_reply.payload, user.first_name)
    }

    //Handle text messages
    else if (webhookEvent.message.text) {
        if (webhookEvent.message.nlp.entities.greetings) {
            if (webhookEvent.message.nlp.entities.greetings[0].confidence > 0.8)
                response = generateResponse('START_OVER', user.first_name)
        }
        else if (webhookEvent.message.text.trim().toLowerCase().includes('start over'))
            response = generateResponse('START_OVER', user.first_name)
        else response = generateResponse(webhookEvent.message.text)
    }

    //Send response text and quick replies
    send(user, response.text, response.quick_replies)
}