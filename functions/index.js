/* eslint-disable new-cap */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */

"use strict";

// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
require("firebase-functions/logger/compat");
const {logger} = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");

// The Firebase Admin SDK to access Firestore.
const {initializeApp} = require("firebase-admin/app");
const fs = require("./firestore");

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
                await fs.addMessage(message, senderName);
              }
            }
          } else if (change.statuses && change.statuses.length > 0) {
            // can be message sent acknowledgement
            const msg = change.statuses[0];
            fs.saveResponse(msg);
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
exports.onConversationCreated = fs.onConversationCreated;
exports.onMessageCreated = fs.onMessageCreated;
