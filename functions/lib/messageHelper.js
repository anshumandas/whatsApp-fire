/* eslint-disable linebreak-style */
/* eslint-disable require-jsdoc */
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTextMessageInput = exports.getTemplateMessageInput = exports.sendMessage = void 0;
const axios_1 = __importDefault(require("axios"));
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
    return (0, axios_1.default)(config);
}
exports.sendMessage = sendMessage;
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
exports.getTemplateMessageInput = getTemplateMessageInput;
// https://developers.facebook.com/docs/whatsapp/cloud-api/messages/text-messages
function getTextMessageInput(recipient, text, enableLink = false) {
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
exports.getTextMessageInput = getTextMessageInput;
//# sourceMappingURL=messageHelper.js.map