# whatsApp-fire

Simple WhatsApp Business API and Firebase integration

In my web search, did not get any easy steps to integrate WhatsApp Business API with Firebase. Many sites mentioned a third-party integration like Twilio.

However, using Firebase Functions to run webhooks that WhatsApp calls seemed to be a simpler solution. Used the following for inspiration and guidance

* https://developers.facebook.com/blog/post/2022/10/31/sending-messages-with-whatsapp-in-your-nodejs-application/
* https://developers.facebook.com/docs/whatsapp/sample-app-endpoints
* https://medium.com/plus-minus-one/how-to-use-a-firebase-function-to-handle-incoming-webhook-91760e0fcc94

This also saves the messages in Firestore

**Steps**

1. Create WhatsApp Business Account - follow steps https://developers.facebook.com/docs/whatsapp/cloud-api/get-started
2. Create firebase project - Login with your Google account at https://console.firebase.google.com/ and create a new project
3. Add Functions to the project and upgrade project's plan to Blaze OR
   * Use Emulator
   * Use Ngrok to tunnel webhook to localhost - https://dev.to/ibrarturi/how-to-test-webhooks-on-your-localhost-3b4f
4. Add Firestore and follow https://firebase.google.com/docs/functions/get-started

**Run using Emulator**

1. Add a .env file where all the env secrets are kept - check sample.env for guidance
2. Test sending messages using

   ```
   npm start
   ```

   at the root level of the project and click the button on the browser
3. Create ngrok tunnel. See https://dashboard.ngrok.com/get-started/your-authtoken then

   ```
   ngrok http 127.0.0.1:5001
   ```
4. Add the Webhook URL (similar to https://`<some code string>`.ngrok-free.app/`<firebase app name>`/us-central1/webhook)
5. Subcribe to "messages" webhook field
6. Run the following

   ```
   cd functions
   npm run serve
   ```
7. You can initiate the first conversation by calling (deeplink)[https://api.whatsapp.com/send?phone=`<the business phone number>`&text=hi]

**Future Work**

1. We can use https://github.com/Secreto31126/whatsapp-api-js for Typescript library to call WhatsApp Business API in a more structural manner. WhatsApp's own SDK https://github.com/WhatsApp/WhatsApp-Nodejs-SDK is archived
