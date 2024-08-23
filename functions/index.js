/* eslint-disable new-cap */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */

"use strict";

// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
require("firebase-functions/logger/compat");
const {logger} = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");

// The Firebase Admin SDK to access Firestore.
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const actions = require("./actions");
const nlp = require("./nlp");


initializeApp();

const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  logger.log("webhook verification", req.query);

  if (
    req.query["hub.mode"] == "subscribe" &&
    req.query["hub.verify_token"] == "token" // SET THIS AS A SECRET. USE THAT SECRET IN WA CONFIG
  ) {
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    res.sendStatus(400);
  }
});

app.post("/", async (request, response) => {
  try {
    const array = request.body.entry;
    for (let i = 0; i < array.length; i++) {
      const body = array[i];
      logger.log("Incoming webhook", body);

      const changes = body.changes;

      for (let j = 0; j < changes.length; j++) {
        const field = changes[j].field;
        const change = changes[j].value;
        // We receive 3 messages with statuses instead of contacts for each response send to the customer number (and not from)
        // These are happening even when we only subscribe to messages and need to be ignored
        if (field == "messages") {
          if (change.contacts && change.contacts.length > 0) {
            const senderName = change.contacts[0].profile.name;
            const messages = change.messages;
            for (let k = 0; k < messages.length; k++) {
              const message = messages[k];
              if (message.type == "text") { // TODO handle other types
                // Push the new message into Firestore using the Firebase Admin SDK.
                // const writeResult =
                const user = getFirestore().collection("phones").doc(message.from).collection("users").doc(senderName);
                const u = await user.get();
                const isNew = !u.exists;
                if (isNew) {
                  const created = Date.now();
                  user.set({created});
                }
                const convs = user.collection("conversations");
                let conv = await convs.where("active", "==", true).get();
                const convStart = conv.empty;
                if (convStart) {
                  conv = await convs.add({active: true, newUser: isNew});
                } else {
                  conv = conv.docs[0].ref;
                }
                const doc = await conv.collection("messages").doc(message.timestamp);
                await doc.set({data: message.text.body, newConv: convStart});
              }
            }
          } else if (change.statuses && change.statuses.length > 0) {
            // can be message sent acknowledgement
            const msg = change.statuses[0];
            getFirestore().collection("phones").doc(msg.recipient_id).collection("responses").doc(msg.id).set({status: msg.status}, {merge: true});
          }
        }
      }
    }
  } catch (e) { // catch error as else 200 response does not get sent and message repeats
    // See Webhook Delivery Failure in WhatsApp API documentation
    logger.error(e);
  }
  response.sendStatus(200); // Must send 200 as else WA repeats sending message
});

exports.webhook = onRequest(app);

// Listens for new messages added to DB using onDocumentCreated and then initiate next steps such as response
// This ensures data gets added to DB before any other action
// Send back a message that we've successfully written the message

exports.onConversationCreated = onDocumentCreated("/phones/{mobile}/users/{name}/conversations/{convId}", async (event) => {
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

exports.onMessageCreated = onDocumentCreated("/phones/{mobile}/users/{name}/conversations/{convId}/messages/{messageId}", async (event) => {
  const newConv = event.data.data().newConv;
  const message = event.data.data().data;
  const cid = event.params.convId;
  const mid = event.params.messageId;
  const name = event.params.name;
  const mobile = event.params.mobile;
  if (process.env.DLGFLOW) {
    // send to Dialog Flow
  } else {
    const intent = nlp.classifyIntent(message);
    if (!(intent == "greeting" && newConv)) { // greeting response already sent
      if (intent == "greeting") {
        // send a response
        const response = `${message} again to you too ${name}`;
        const ref = await actions.respond(mobile, response);
        return event.data.ref.set({response: ref}, {merge: true});
      } else if (intent == "unknown") {
      // send a response
        const response = `${name} I didn't understand "${message}". Please clarify`;
        const ref = await actions.respond(mobile, response);
        return event.data.ref.set({response: ref}, {merge: true});
      } else {
        return actions.act(intent, message);
      }
    }
  }
});
