/* eslint-disable linebreak-style */
/* eslint-disable require-jsdoc */
/* eslint-disable max-len */

const {getFirestore} = require("firebase-admin/firestore");
const {sendMessage, getTextMessageInput, getTemplateMessageInput} = require("./messageHelper");

function welcome(phone, name) {
  // send a welcome message
  const data = getTemplateMessageInput(phone, "hello_world"); // create template for Welcome
  sendMessage(data, name); // will lead to webhook being called again for status
}

async function act(intent, message) {
  // TODO
  console.log(intent);
  console.log(message);
}

async function respond(phone, response) {
  // send a welcome message
  const data = getTextMessageInput(phone, response); // create template for Welcome
  const m = await sendMessage(data); // will lead to webhook being called again for status
  const ref = getFirestore().collection("phones").doc(phone).collection("responses").doc(m.data.messages[0].id);
  await ref.set({data: response});
  return ref;
}

exports.welcome = welcome;
exports.respond = respond;
exports.act = act;
