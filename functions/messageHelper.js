var axios = require('axios');

function sendMessage(data) {
  var config = {
    method: 'post',
    url: `https://graph.facebook.com/${process.env.VERSION}/${process.env.PHONE_NUMBER_ID}/messages`,
    headers: {
      'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    data: data
  };
console.log(config);

  return axios(config)
}

function getTemplateMessageInput(recipient, template) {
  return JSON.stringify({
    "messaging_product": "whatsapp",
    // "preview_url": false,
    // "recipient_type": "individual",
    "to": recipient,
    "type": "template",
    "template": {
        "name": template,
        "language": {
            "code": "en_US"
        }
    }
  });
}

module.exports = {
  sendMessage: sendMessage,
  getTemplateMessageInput: getTemplateMessageInput
};