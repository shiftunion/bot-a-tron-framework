"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
require('dotenv').load();

var useEmulator = (process.env.NODE_ENV == 'development');

console.log("em:" + useEmulator);

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
  });

var bot = new builder.UniversalBot(connector, [
  function (session) {
    session.beginDialog('q&aDialog');
  },
  function (session, results) {
    session.send("Thanks %(name)s... You're %(age)s and located in %(state)s.", results.response);
  }
]);

bot.dialog('/', [
  function (session) {
    session.beginDialog('q&aDialog');
  },
]);

// Add Q&A dialog
bot.dialog('q&aDialog', [
  function (session, args) {
    // Save previous state (create on first call)
    session.dialogData.index = args ? args.index : 0;
    session.dialogData.form = args ? args.form : {};

    // Prompt user for next field
    builder.Prompts.text(session, questions[session.dialogData.index].prompt);
  },
  function (session, results) {
    // Save users reply
    var field = questions[session.dialogData.index++].field;
    session.dialogData.form[field] = results.response;

    // Check for end of form
    if (session.dialogData.index >= questions.length) {
      // Return completed form
      session.endDialogWithResult({ response: session.dialogData.form });
    } else {
      // Next field
      session.replaceDialog('q&aDialog', session.dialogData);
    }
  }
]);

var questions = [
  { field: 'name', prompt: "What's your name?" },
  { field: 'age', prompt: "How old are you?" },
  { field: 'state', prompt: "What state are you in?" }
];


if (useEmulator) {
  var restify = require('restify');
  var server = restify.createServer();
  server.listen(3978, function() {
    console.log('test bot endpont at http://localhost:3978/api/messages');
  });
  server.post('/api/messages', connector.listen());
} else {
  module.exports = { default: connector.listen() }
}
