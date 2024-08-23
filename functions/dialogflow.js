/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
/* eslint-disable no-unused-vars */
const fs = require("./firestore");
const {logger} = require("firebase-functions");

// projectId: ID of the GCP project where Dialogflow agent is deployed
const projectId = process.env.DLGFLOW_PROJECT_ID;

// languageCode: Indicates the language Dialogflow agent should use to detect intents
const languageCode = "en";

// Imports the Dialogflow library
const dialogflow = require("@google-cloud/dialogflow");

// Instantiates a session client
const sessionClient = new dialogflow.SessionsClient();

async function detectIntent(mobile, name, sessionId, query) {
  // The path to identify the agent that owns the created intent.
  const sessionPath = sessionClient.projectAgentSessionPath(
      projectId,
      sessionId,
  );

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: languageCode,
      },
    },
  };

  // get context from firestore
  const contexts = fs.getContexts(mobile, name, sessionId);
  if (contexts && contexts.length > 0) {
    request.queryParams = {
      contexts: contexts,
    };
  }

  const response = (await sessionClient.detectIntent(request))[0];
  logger.log("dialogflow response", response);
  const context = response.queryResult.outputContexts;
  // save in firestore
  fs.addContext(mobile, name, sessionId, context);

  return response;
}

exports.detectIntent = detectIntent;
