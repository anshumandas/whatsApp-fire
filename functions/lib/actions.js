"use strict";
/* eslint-disable linebreak-style */
/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
Object.defineProperty(exports, "__esModule", { value: true });
exports.respond = exports.act = exports.welcome = void 0;
const firestore_1 = require("firebase-admin/firestore");
const messageHelper_1 = require("./messageHelper");
function welcome(phone, name) {
    // send a welcome message
    const data = (0, messageHelper_1.getTemplateMessageInput)(phone, "hello_world"); // create template for Welcome
    (0, messageHelper_1.sendMessage)(data); // will lead to webhook being called again for status
}
exports.welcome = welcome;
async function act(intent, message) {
    // TODO
    console.log(intent);
    console.log(message);
}
exports.act = act;
async function respond(phone, response) {
    // send a welcome message
    const data = (0, messageHelper_1.getTextMessageInput)(phone, response); // create template for Welcome
    const m = await (0, messageHelper_1.sendMessage)(data); // will lead to webhook being called again for status
    const ref = (0, firestore_1.getFirestore)().collection("phones").doc(phone).collection("responses").doc(m.data.messages[0].id);
    await ref.set({ data: response });
    return ref;
}
exports.respond = respond;
exports.default = { respond, act, welcome };
//# sourceMappingURL=actions.js.map