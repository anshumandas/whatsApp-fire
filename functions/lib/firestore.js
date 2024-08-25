/* eslint-disable linebreak-style */
/* eslint-disable new-cap */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
require("firebase-functions/logger/compat");
const firestore_1 = require("firebase-functions/v2/firestore");
const firestore_2 = require("firebase-admin/firestore");
// The Firebase Admin SDK to access Firestore.
const actions_1 = __importDefault(require("./actions"));
const nlp_1 = __importDefault(require("./nlp"));
// Listens for new messages added to DB using onDocumentCreated and then initiate next steps such as response
// This ensures data gets added to DB before any other action
// Send back a message that we've successfully written the message
exports.onConversationCreated = (0, firestore_1.onDocumentCreated)("/phones/{mobile}/users/{name}/conversations/{convId}", async (event) => {
    const isNew = event.data.data().newUser;
    const cid = event.params.convId;
    const mid = event.params.messageId;
    const name = event.params.name;
    const mobile = event.params.mobile;
    if (isNew) {
        // check if new user. Do not respond to simple greeting in such case
        actions_1.default.welcome(mobile, name);
    }
    else {
        // check if new session to say welcome back
        // send a response
        const response = `Welcome back ${name}`;
        const ref = await actions_1.default.respond(mobile, response);
    }
});
exports.onMessageCreated = (0, firestore_1.onDocumentCreated)("/phones/{mobile}/users/{name}/conversations/{convId}/messages/{messageId}", async (event) => {
    const newConversation = event.data.data().newConv;
    const message = event.data.data().data;
    const cid = event.params.convId;
    const name = event.params.name;
    const mobile = event.params.mobile;
    const r = await nlp_1.default.processor(message, mobile, name, cid, newConversation, event.data.ref);
    return r;
});
exports.saveResponse = function (msg) {
    (0, firestore_2.getFirestore)().collection("phones").doc(msg.recipient_id).collection("responses").doc(msg.id).set({ status: msg.status }, { merge: true });
};
exports.addMessage = async function (message, senderName) {
    const user = (0, firestore_2.getFirestore)().collection("phones").doc(message.from).collection("users").doc(senderName);
    const u = await user.get();
    const isNew = !u.exists;
    if (isNew) {
        const created = Date.now();
        user.set({ created });
    }
    const convs = user.collection("conversations");
    let conv = await convs.where("active", "==", true).get();
    const convStart = conv.empty;
    if (convStart) {
        conv = await convs.add({ active: true, newUser: isNew });
    }
    else {
        conv = conv.docs[0].ref;
    }
    const doc = await conv.collection("messages").doc(message.timestamp);
    await doc.set({ data: message.text.body, newConv: convStart });
};
exports.getContexts = async function (phone, name, sessionId) {
    const ret = await (0, firestore_2.getFirestore)().collection("phones").doc("" + phone).collection("users").
        doc(name).collection("conversations").doc(sessionId).get();
    return ret.context;
};
exports.addContext = async function (phone, name, sessionId, context) {
    await (0, firestore_2.getFirestore)().collection("phones").doc("" + phone).collection("users").
        doc(name).collection("conversations").doc(sessionId).set({ context }, { merge: true });
};
exports.default = exports;
//# sourceMappingURL=firestore.js.map