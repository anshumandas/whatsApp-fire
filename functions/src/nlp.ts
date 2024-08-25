/* eslint-disable linebreak-style */
/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
require("firebase-functions/logger/compat");
import { logger } from "firebase-functions";
import actions from "./actions";
import dialogflow from "./dialogflow";
import { callGeneralConversationFlow } from "./genkit";

export async function processor(message: string, mobile: number, name: string, session: string, newConversation: boolean, dataRef: any) {
  let fulfillmentText;
  
  if (process.env.NLU == "DialogFlow") {
    // Note that all interactions can be logged in Dialogflow as well, so the firestore may not be needed
    const r = await dialogflow.detectIntent(mobile, name, session, message, dataRef); // add context from previous queries
    // we can call fulfillment API from DialogFlow which could initiate another firebase function via Webhook OR
    // console.log(r.queryResult.intent.displayName); // the returned intent can also be used further here for fulfilment
    fulfillmentText = r.queryResult.fulfillmentText;
  } else if (process.env.NLU == "RASA") {
    // TODO
  } else {
    const intent = classifyIntent(message);
    if (!(intent == "greeting" && newConversation)) { // greeting response already sent
      if (intent == "greeting") {
        fulfillmentText = `${message} again to you too ${name}`;
      } else if (intent == "unknown") {
        if (process.env.NLU == "GenKit") {
          fulfillmentText = await callGeneralConversationFlow(message);
        } else {
          fulfillmentText = `${name} I didn't understand "${message}". Please clarify`;
        }
      } else {
        fulfillmentText = actions.act(intent, message);
      }
    }
  }
  if(fulfillmentText) return await fulfiller(mobile, fulfillmentText, dataRef);
}

async function fulfiller(mobile: any, fulfillmentText: any, dataRef: { set: (arg0: { response: any; }, arg1: { merge: boolean; }) => any; }) {
  const ref = await actions.respond(mobile, fulfillmentText);
  return dataRef.set({response: ref}, {merge: true});
}

function classifyIntent(message: string) {
  // this can use RASA or any other classifier
  if (["hi", "hello"].indexOf(message.toLowerCase()) > -1) return "greeting";
  return "unknown";
}

export default {processor}