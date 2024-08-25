import * as z from "zod";
// import 'dotenv/config'
// Import the Genkit core libraries and plugins.
import {generate} from "@genkit-ai/ai";
import {configureGenkit} from "@genkit-ai/core";
import {firebase} from "@genkit-ai/firebase";
import {googleAI} from "@genkit-ai/googleai";

// Import models from the Google AI plugin. The Google AI API provides access to
// several generative models. Here, we import Gemini 1.5 Flash.
import {gemini15Flash} from "@genkit-ai/googleai";

// From the Firebase plugin, import the functions needed to deploy flows using
// Cloud Functions.
// import {firebaseAuth} from "@genkit-ai/firebase/auth";
import {noAuth, onFlow} from "@genkit-ai/firebase/functions";
import { runFlow } from "@genkit-ai/flow";
// import {defineSecret} from "firebase-functions/params";
const googleAIapiKey = ""+process.env.GOOGLE_GENAI_API_KEY; //defineSecret("GOOGLE_GENAI_API_KEY");
 
configureGenkit({
  plugins: [
    // Load the Firebase plugin, which provides integrations with several
    // Firebase services.
    firebase({projectId: process.env.PROJECT_ID}),
    // Load the Google AI plugin. You can optionally specify your API key
    // by passing in a config object; if you don't, the Google AI plugin uses
    // the value from the GOOGLE_GENAI_API_KEY environment variable, which is
    // the recommended practice.
    googleAI({ apiKey: googleAIapiKey }),
  ],
  // Log debug output to tbe console.
  logLevel: "debug",
  // Perform OpenTelemetry instrumentation and enable trace collection.
  enableTracingAndMetrics: true,
});

// Define a simple flow that prompts an LLM to generate menu suggestions.
export const generalConversationFlow = onFlow(
  {
    name: "generalConversationFlow",
    httpsOptions: {
      secrets: [googleAIapiKey],
      cors: true, 
    },
    inputSchema: z.string(),
    outputSchema: z.string(),
    authPolicy: noAuth(), // WARNING: noAuth() creates an open endpoint!
    // authPolicy: firebaseAuth((user) => {
      // By default, the firebaseAuth policy requires that all requests have an
      // `Authorization: Bearer` header containing the user's Firebase
      // Authentication ID token. All other requests are rejected with error
      // 403. If your app client uses the Cloud Functions for Firebase callable
      // functions feature, the library automatically attaches this header to
      // requests.

      // You should also set additional policy requirements as appropriate for
      // your app. For example:
      // if (!user.email_verified) {
      //   throw new Error("Verified email required to run flow");
      // }
    // }),
  },
  async (subject) => {
		// Construct a request and send it to the model API.
    const prompt =
      `Reply to the user as a chatbot when user said ${subject}`;
    const llmResponse = await generate({
      model: gemini15Flash,
      prompt: prompt,
      config: {
        temperature: 1,
      },
    });

		// Handle the response from the model API. In this sample, we just
		// convert it to a string, but more complicated flows might coerce the
		// response into structured output or chain the response into another
		// LLM call, etc.
    return llmResponse.text();
  }
);

export async function callGeneralConversationFlow(theme: string) {
  const flowResponse = await runFlow(generalConversationFlow, theme);
  console.log(flowResponse);
  return flowResponse;
}