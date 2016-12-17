"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
require('dotenv').load();

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
  appId: process.env['MicrosoftAppId'],
  appPassword: process.env['MicrosoftAppPassword'],
  stateEndpoint: process.env['BotStateEndpoint'],
  openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector, [
]);



bot.dialog('/', [
  function (session, args) {

    // Prompt user for next field
    builder.Prompts.text(session, 'Are you ready to kick-off?');
  },
  function (session, results) {
    console.log(results)
    if (results.response == 'y') {
      session.beginDialog('/motivate', 4);
    }
  },
    function (session, results) {
      session.beginDialog('/journal')
  },

  function (session, results) {
    session.send('thanks - dude, see you tomorrow')
  }

]);

bot.dialog('/motivate', [
  function moreThings(session, numRequested) {
    if (numRequested == null) numRequested = 3;
    for (let i = 0; i < numRequested; i++) {
      session.send('boom - motivation ' + i);
    }
    builder.Prompts.choice(session, 'Do you want more, or are you ready to journal?', ['more', 'journal', 'quit']);
  },
  function (session, results, next) {
    if (results.response.entity === 'more') session.beginDialog('/motivate', 2);
    if (results.response.entity === 'quit') session.endDialog();
    if (results.response.entity === 'journal') next();

  }
]);

bot.dialog('/journal', [
  function (session) {
    builder.Prompts.text(session, 'Please add a journal entry (todo)?');
  },
  function (session, results, next) {
    session.send('thanks for you entry: ' + results.response)
    next();
  }
]);


if (useEmulator) {
  var restify = require('restify');
  var server = restify.createServer();
  server.listen(3978, function () {
    console.log('test bot endpont at http://localhost:3978/api/messages');
  });
  server.post('/api/messages', connector.listen());
} else {
  module.exports = { default: connector.listen() }
}
