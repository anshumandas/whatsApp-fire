var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
require('dotenv').config()
const { sendMessage, getTemplateMessageInput } = require("../../functions/messageHelper");

router.use(bodyParser.json());

router.post('/', function(req, res, next) {
  
  var data = getTemplateMessageInput(req.body.phoneNumber || process.env.RECIPIENT_WAID, "hello_world");
  
  sendMessage(data)
    .then(function (response) {
        // console.log(response);
        
      res.sendStatus(200);
    //   res.redirect('/');
      return;
    })
    .catch(function (error) {
    //   console.log(error);
    //   console.log(error.response.data);
      res.sendStatus(500);
      return;
    });
});

module.exports = router;