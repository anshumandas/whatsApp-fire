/* eslint-disable linebreak-style */
/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
const actions = require("./actions");
const dialogflow = require("./dialogflow");

async function processor(message, mobile, name, session, newConversation) {
  if (process.env.NLU == "DialogFlow") {
    // Note that all interactions can be logged in Dialogflow as well, so the firestore may not be needed
    const r = await dialogflow.detectIntent(mobile, name, session, message); // add context from previous queries
    // we can call fulfillment API from DialogFlow which could initiate another firebase function via Webhook OR
    // console.log(r.queryResult.intent.displayName); // the returned intent can also be used further here for fulfilment
    return r.queryResult.fulfillmentText;
  } else if (process.env.NLU == "RASA") {
    // TODO
  } else if (process.env.NLU == "LangChain") {
    // TODO
  } else {
    const intent = classifyIntent(message);
    if (!(intent == "greeting" && newConversation)) { // greeting response already sent
      if (intent == "greeting") {
        return `${message} again to you too ${name}`;
      } else if (intent == "unknown") {
        return `${name} I didn't understand "${message}". Please clarify`;
      } else {
        return actions.act(intent, message);
      }
    }
  }
}

function classifyIntent(message) {
  // this can use RASA or any other classifier
  if (["hi", "hello"].indexOf(message.toLowerCase()) > -1) return "greeting";
  return "unknown";
}

exports.processor = processor;
