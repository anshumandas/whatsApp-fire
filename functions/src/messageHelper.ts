/* eslint-disable linebreak-style */
/* eslint-disable require-jsdoc */
"use strict";

import axios from "axios";

export function sendMessage(data: any) {
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

export function getTemplateMessageInput(recipient: any, template: any) {
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
export function getTextMessageInput(recipient: number, text: string, enableLink: boolean = false) {
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
