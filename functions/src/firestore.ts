/* eslint-disable linebreak-style */
/* eslint-disable new-cap */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
"use strict";

// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
require("firebase-functions/logger/compat");
import { logger } from "firebase-functions";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { getFirestore } from "firebase-admin/firestore";

// The Firebase Admin SDK to access Firestore.
import actions from "./actions";
import nlp from "./nlp";

// Listens for new messages added to DB using onDocumentCreated and then initiate next steps such as response
// This ensures data gets added to DB before any other action
// Send back a message that we've successfully written the message

exports.onConversationCreated = onDocumentCreated("/phones/{mobile}/users/{name}/conversations/{convId}", async (event:any) => {
  const isNew = event.data.data().newUser;
  const cid = event.params.convId;
  const mid = event.params.messageId;
  const name = event.params.name;
  const mobile = event.params.mobile;
  if (isNew) {
    // check if new user. Do not respond to simple greeting in such case
    actions.welcome(mobile, name);
  } else {
    // check if new session to say welcome back
    // send a response
    const response = `Welcome back ${name}`;
    const ref = await actions.respond(mobile, response);
  }
});

exports.onMessageCreated = onDocumentCreated("/phones/{mobile}/users/{name}/conversations/{convId}/messages/{messageId}", async (event:any) => {
  const newConversation = event.data.data().newConv;
  const message = event.data.data().data;
  const cid = event.params.convId;
  const name = event.params.name;
  const mobile = event.params.mobile;
  const r = await nlp.processor(message, mobile, name, cid, newConversation, event.data.ref);
  return r;
});

exports.saveResponse = function(msg:any) {
  getFirestore().collection("phones").doc(msg.recipient_id).collection("responses").doc(msg.id).set({status: msg.status}, {merge: true});
};

exports.addMessage = async function(message: { from: string; timestamp: number; text: { body: string; }; }, senderName: string) {
  const user = getFirestore().collection("phones").doc(message.from).collection("users").doc(senderName);
  const u = await user.get();
  const isNew = !u.exists;
  if (isNew) {
    const created = Date.now();
    user.set({created});
  }
  const convs = user.collection("conversations");
  let conv:any = await convs.where("active", "==", true).get();
  const convStart = conv.empty;
  if (convStart) {
    conv = await convs.add({active: true, newUser: isNew});
  } else {
    conv = conv.docs[0].ref;
  }
  const doc = await conv.collection("messages").doc(message.timestamp);
  await doc.set({data: message.text.body, newConv: convStart});
};

exports.getContexts = async function(phone: number, name: string, sessionId: string) {
  const ret:any = await getFirestore().collection("phones").doc(""+phone).collection("users").
      doc(name).collection("conversations").doc(sessionId).get();
  return ret.context;
};

exports.addContext = async function(phone: number, name: string, sessionId: string, context: [any]) {
  await getFirestore().collection("phones").doc(""+phone).collection("users").
      doc(name).collection("conversations").doc(sessionId).set({context}, {merge: true});
};

export default exports
