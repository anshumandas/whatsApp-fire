/* eslint-disable linebreak-style */
/* eslint-disable require-jsdoc */
/* eslint-disable max-len */


function classifyIntent(message) {
  // this can use RASA or any other classifier
  if (["hi", "hello"].indexOf(message.toLowerCase()) > -1) return "greeting";
  return "unknown";
}

exports.classifyIntent = classifyIntent;
