/* eslint-disable linebreak-style */
/* eslint-disable require-jsdoc */
"use strict";

const axios = require("axios");

function sendMessage(data) {
  const config = {
    method: "post",
    url: `https://graph.facebook.com/${process.env.VERSION}/${process.env.PHONE_NUMBER_ID}/messages`,
    headers: {
      "Authorization": `Bearer ${process.env.ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    data: data,
  };

  return axios(config);
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
        "code": "en_US",
      },
    },
  });
}
// https://developers.facebook.com/docs/whatsapp/cloud-api/messages/text-messages
function getTextMessageInput(recipient, text, enableLink) {
  return JSON.stringify({
    "messaging_product": "whatsapp",
    // "preview_url": false,
    // "recipient_type": "individual",
    "to": recipient,
    "type": "text",
    "text": {
      "preview_url": enableLink,
      "body": text,
    },
  });
}

module.exports = {
  sendMessage: sendMessage,
  getTemplateMessageInput: getTemplateMessageInput,
  getTextMessageInput: getTextMessageInput,
};
