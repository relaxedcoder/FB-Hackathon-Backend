module.exports = (payload, firstName) => {
    var text
    var quick_replies

    switch (payload) {
        case 'START_OVER':
            text = [
                `Hi ${firstName}! Welcome to Medicine Delivery System.`,
                'At any time, please feel free to select one of the following options or start over by saying "Start over".'
            ]
            quick_replies = [
                {
                    "content_type": "text",
                    "title": "Upload prescription",
                    "payload": "UPLOAD_PRESCRIPTION"
                }, {
                    "content_type": "text",
                    "title": "Talk to human agent",
                    "payload": "HUMAN_AGENT"
                }
            ]
            break
        case 'UPLOAD_PRESCRIPTION':
            text = `Please tell if your doctor's prescription is printed or written.`
            quick_replies = [
                {
                    "content_type": "text",
                    "title": "Printed",
                    "payload": "PRINTED"
                }, {
                    "content_type": "text",
                    "title": "Written",
                    "payload": "WRITTEN"
                }
            ]
            break
        case 'PRINTED':
            text = 'Please upload the photo of the prescription.'
            break
        case 'WRITTEN':
            text = [
                'For written prescriptions, we will handover this conversation to a human agent.',
                'Please upload the photo of the prescription.'
            ]
            break
        case 'CONFIRM_ORDER':
            text = [
                'Thank you for the confirmation.',
                'The medicines will be delivered to your location.',
                'Thanks for using Medicine Delivery System.'
            ]
            break
        case 'HUMAN_AGENT':
            text = 'We will shortly connect you with a human agent.'
            break
        case 'NOTIFY':
            text = 'Okay, you will be notified.'
            break
        default:
            text = [
                `Sorry, I don't understand "${payload}".`,
                'At any time, please feel free to select one of the following options or start over by saying "Start Over".'
            ]
            quick_replies = [
                {
                    "content_type": "text",
                    "title": "Upload prescription",
                    "payload": "UPLOAD_PRESCRIPTION"
                }, {
                    "content_type": "text",
                    "title": "Talk to human agent",
                    "payload": "HUMAN_AGENT"
                }
            ]
    }

    return {
        text: text,
        quick_replies: quick_replies
    }
}