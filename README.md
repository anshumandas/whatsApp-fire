# whatsApp-fire

Simple WhatsApp Business API integration with intent classifiers like DialogFlow using Firebase.

In my web search, did not get any easy steps to integrate WhatsApp Business API with DialogFlow. Many sites mentioned a third-party integration like Twilio.

However, using Firebase Functions to run webhooks that WhatsApp calls and using it to call services such as DialogFLow seemed to be a simpler solution.

Used the following for inspiration and guidance:

* WhatsApp API
  * https://developers.facebook.com/blog/post/2022/10/31/sending-messages-with-whatsapp-in-your-nodejs-application/
  * https://developers.facebook.com/docs/whatsapp/sample-app-endpoints
  * https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components
  * https://developers.facebook.com/docs/whatsapp/cloud-api/messages/text-messages
* Firebase
  * https://medium.com/plus-minus-one/how-to-use-a-firebase-function-to-handle-incoming-webhook-91760e0fcc94
  * https://firebase.google.com/docs/functions/get-started?hl=en&authuser=0&gen=2nd
  * https://cloud.google.com/firestore/docs/samples/firestore-data-query
* DialogFlow
  * https://cloud.google.com/dialogflow/es/docs/quick/api
* GenAI
  * https://medium.com/aimonks/intent-classification-generative-ai-based-application-architecture-3-79d2927537b4
  * https://js.langchain.com/v0.2/docs/tutorials/
  * https://medium.com/@tanabee/implementing-function-calling-using-genkit-0c03f6cb9179
  * https://firebase.google.com/docs/genkit
  * https://firebase.google.com/docs/genkit/plugins/langchain

This also saves the messages in **Firestore** in the following manner:

* Each Phone and Name combination is stored as a separate user
* Phone and name are added as separate fields for lookups using where clause
* Each user can have multiple conversations (done in same or different days). Only one conversation can be active at a time.
* The bot closes a conversation when it gets confirmation of closure of user query. If confirmation is seeked but not given, it will ask again if a new conversation is initiated in the same session. If a new session gets created, old session may remain with one active conversation, which is infact closed.
* Each *conversation* can have several messages added as per their timestamp
* Each message can have a response added once response generated via
  * DialogFlow
  * Firebase Genkit (Similar to LangChain but by Firebase)
  * Optional TODO: LangChain (direct or via Firebase Genkit)
  * TODO: RASA
  * TODO: Embedded NLP (like https://github.com/axa-group/nlp.js)

**Behaviour**

* Every new conversation starts with a greeting
* A separate thread can create summary of the *conversation*. This can be triggered and added when a conversation is closed.
* Individual messages could be truncated or archived as a separate EOD job or on session closure via a separate thread
* Each *conversation* summarization can lead to some customer insights that can be added to the user level. E.g. we can add the last *conversation* finish timestamp.
* If the user does not have any previous *conversation*, then state is new, and we send a welcome message on first interaction of a session
* If the user does have previous sessions, we send a "Welcom Back" or "How are you doing today" based on the last interaction date
* TODO: Closure of a *conversation* is done by a standard closure template

**Steps**

1. Create WhatsApp Business Account - follow steps https://developers.facebook.com/docs/whatsapp/cloud-api/get-started
2. Create firebase project - Login with your Google account at https://console.firebase.google.com/ and create a new project
3. Add Functions to the project and upgrade project's plan to Blaze OR
   * Use Emulator
   * Use Ngrok to tunnel webhook to localhost - https://dev.to/ibrarturi/how-to-test-webhooks-on-your-localhost-3b4f
4. Add Firestore and follow https://firebase.google.com/docs/functions/get-started
5. Add Dialogflow
   * Create Dialogflow project, Intents etc. https://cloud.google.com/dialogflow/es/docs/quick/setup
   * Enable API for Dialogflow and Firebase projects from each of their settings
6. Convert to Typescript (Note that Emulator does not watch TS and only JS. See https://github.com/firebase/firebase-tools/issues/4691 and the solution I suggested in the end)
7. Add Genkit. See https://firebase.google.com/docs/genkit/nextjs and instead of NextJS use Firebase functions to call

**Run using Emulator**

1. Add a *.env* file where all the env secrets are kept - check sample.env for guidance
2. NOTE you will either need to **refresh** the ACCESS_TOKEN everyday or get a Permanent token from Meta
3. Test sending messages using

   https://developers.facebook.com/apps/{some number}/whatsapp-business/wa-dev-console/?business_id={some number}

   Or (see the first few commits for this as was removed later on)

   ```
   npm start
   ```

   at the root level of the project and click the button on the browser
4. Create ngrok tunnel. See https://dashboard.ngrok.com/get-started/your-authtoken then

   ```
   ngrok http 127.0.0.1:5001
   ```
5. Add the Webhook URL (similar to https://`<some code string>`.ngrok-free.app/`<firebase app name>`/us-central1/webhook)
6. Subcribe to "messages" webhook field
7. Run the following

   ```
   cd functions
   npm run serve
   ```
8. You can initiate the first conversation

   * by sending a template message to the recipient phone (This is chargable by Meta)
   * recipient initiates by calling (deeplink)[https://api.whatsapp.com/send?phone=`<the business phone number>`&text=hi] (This is not charged)

**Future Work**

1. Integrate with
   * RASA for end to end flow or DIET Intent Classifier only
   * Langchain and use RAG https://medium.com/@talon8080/mastering-rag-chatbots-building-advanced-rag-as-a-conversational-ai-tool-with-langchain-d740493ff328
2. Use personal number instead of business account by leveraging https://github.com/pedroslopez/whatsapp-web.js
3. Use other service providers for the time consuming OpenAI etc calls to save money in production. See https://medium.com/@raphox/integrating-google-firebase-firestore-with-chatgpt-api-saving-money-a90148e619b9
4. Improve Typescript by creating classes etc.
   * Take inspiration from https://gist.github.com/jakebloom/2d8468229eb40b99b72e039fd2150831
   * We can use https://github.com/Secreto31126/whatsapp-api-js for Typescript library to call WhatsApp Business API in a more structural manner.
   * WhatsApp's own SDK https://github.com/WhatsApp/WhatsApp-Nodejs-SDK is archived
