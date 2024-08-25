"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processor = processor;
/* eslint-disable linebreak-style */
/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
require("firebase-functions/logger/compat");
const actions_1 = __importDefault(require("./actions"));
const dialogflow_1 = __importDefault(require("./dialogflow"));
const genkit_1 = require("./genkit");
async function processor(message, mobile, name, session, newConversation, dataRef) {
    let fulfillmentText;
    if (process.env.NLU == "DialogFlow") {
        // Note that all interactions can be logged in Dialogflow as well, so the firestore may not be needed
        const r = await dialogflow_1.default.detectIntent(mobile, name, session, message, dataRef); // add context from previous queries
        // we can call fulfillment API from DialogFlow which could initiate another firebase function via Webhook OR
        // console.log(r.queryResult.intent.displayName); // the returned intent can also be used further here for fulfilment
        fulfillmentText = r.queryResult.fulfillmentText;
    }
    else if (process.env.NLU == "RASA") {
        // TODO
    }
    else {
        const intent = classifyIntent(message);
        if (!(intent == "greeting" && newConversation)) { // greeting response already sent
            if (intent == "greeting") {
                fulfillmentText = `${message} again to you too ${name}`;
            }
            else if (intent == "unknown") {
                if (process.env.NLU == "GenKit") {
                    fulfillmentText = await (0, genkit_1.callGeneralConversationFlow)(message);
                }
                else {
                    fulfillmentText = `${name} I didn't understand "${message}". Please clarify`;
                }
            }
            else {
                fulfillmentText = actions_1.default.act(intent, message);
            }
        }
    }
    if (fulfillmentText)
        return await fulfiller(mobile, fulfillmentText, dataRef);
}
async function fulfiller(mobile, fulfillmentText, dataRef) {
    const ref = await actions_1.default.respond(mobile, fulfillmentText);
    return dataRef.set({ response: ref }, { merge: true });
}
function classifyIntent(message) {
    // this can use RASA or any other classifier
    if (["hi", "hello"].indexOf(message.toLowerCase()) > -1)
        return "greeting";
    return "unknown";
}
exports.default = { processor };
//# sourceMappingURL=nlp.js.map