"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.menuSuggestionFlow = void 0;
const z = __importStar(require("zod"));
// Import the Genkit core libraries and plugins.
const ai_1 = require("@genkit-ai/ai");
const core_1 = require("@genkit-ai/core");
// From the Firebase plugin, import the functions needed to deploy flows using
// Cloud Functions.
const auth_1 = require("@genkit-ai/firebase/auth");
const functions_1 = require("@genkit-ai/firebase/functions");
(0, core_1.configureGenkit)({
    plugins: [
    /* Add your plugins here. */
    ],
    // Log debug output to tbe console.
    logLevel: "debug",
    // Perform OpenTelemetry instrumentation and enable trace collection.
    enableTracingAndMetrics: true,
});
// Define a simple flow that prompts an LLM to generate menu suggestions.
exports.menuSuggestionFlow = (0, functions_1.onFlow)({
    name: "menuSuggestionFlow",
    inputSchema: z.string(),
    outputSchema: z.string(),
    authPolicy: (0, auth_1.firebaseAuth)((user) => {
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
    }),
}, async (subject) => {
    // Construct a request and send it to the model API.
    const prompt = `Suggest an item for the menu of a ${subject} themed restaurant`;
    const llmResponse = await (0, ai_1.generate)({
        model: '' /* TODO: Set a model. */,
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
});
//# sourceMappingURL=genkit.js.map