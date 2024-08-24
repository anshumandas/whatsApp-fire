/* eslint-disable linebreak-style */
/* eslint-disable require-jsdoc */
/* eslint-disable max-len */

import { getFirestore } from "firebase-admin/firestore";
import { sendMessage, getTextMessageInput, getTemplateMessageInput } from "./messageHelper";

export function welcome(phone: number, name: string) {
  // send a welcome message
  const data = getTemplateMessageInput(phone, "hello_world"); // create template for Welcome
  sendMessage(data); // will lead to webhook being called again for status
}

export async function act(intent: string, message: string) {
  // TODO
  console.log(intent);
  console.log(message);
}

export async function respond(phone: number, response: string) {
  // send a welcome message
  const data = getTextMessageInput(phone, response); // create template for Welcome
  const m = await sendMessage(data); // will lead to webhook being called again for status
  const ref = getFirestore().collection("phones").doc(""+phone).collection("responses").doc(m.data.messages[0].id);
  await ref.set({data: response});
  return ref;
}

export default {respond, act, welcome}