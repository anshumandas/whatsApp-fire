/* eslint-disable no-unused-vars */
/* eslint-disable max-len */

"use strict";

// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
require("firebase-functions/logger/compat");
const {logger} = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");
// const {onDocumentCreated} = require("firebase-functions/v2/firestore");

// The Firebase Admin SDK to access Firestore.
const {initializeApp} = require("firebase-admin/app");
const {getFirestore, FieldValue} = require("firebase-admin/firestore");
// const {sendMessage, getTemplateMessageInput} = require("./messageHelper");

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
    res.send(req.query["hub.challenge"]);
  } else {
    res.sendStatus(400);
  }
});

app.post("/", async (request, response) => {
  const array = request.body.entry;
  for (let i = 0; i < array.length; i++) {
    const body = array[i];
    const id = body.id;
    const changes = body.changes;

    for (let j = 0; j < changes.length; j++) {
      const field = changes[j].field;
      const change = changes[j].value;
      logger.log("webhook", `Incoming webhook ${id} with ${JSON.stringify(change)}`);
      if (field == "messages" && change.contacts.length > 0) {
        const senderName = change.contacts[0].profile.name;
        const messages = change.messages;
        for (let k = 0; k < messages.length; k++) {
          const message = messages[k];
          console.log(message);
          if (message.type == "text") { // TODO handle other types
            // Push the new message into Firestore using the Firebase Admin SDK.
            // const writeResult =
            const doc = getFirestore().collection("senders").doc(`${message.from}#${senderName}`)
                .collection("sessions").doc(id).collection("messages").doc(message.timestamp);
            await doc.set({data: message.text.body});
            // await doc.update({messages: FieldValue.arrayUnion({text: message.text.body, timestamp: message.timestamp})}); // being added like a stack
          }
        }
      }
    }
  }
  response.sendStatus(200);
});

exports.webhook = onRequest(app);

// Listens for new messages added to DB using onDocumentCreated and then initiate next steps such as response
// This ensures data gets added to DB before any other action
// Send back a message that we've successfully written the message
// using separate messageSend
// const data = getTemplateMessageInput(process.env.RECIPIENT_WAID, "hello_world");
// sendMessage(data); // can lead to webhook being called again (based on subscriptions) and infinite loop
