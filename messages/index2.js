"use strict";

var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
require('dotenv').load();
var request = require('request');
var journal = require('./journal')

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
  appId: process.env['MicrosoftAppId'],
  appPassword: process.env['MicrosoftAppPassword'],
  stateEndpoint: process.env['BotStateEndpoint'],
  openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector, []);

bot.endConversationAction('bye', 'bye :)', { matches: /^bye/i });
bot.beginDialogAction('go', '/', { matches: /^go/i });

function mainRouter(message) {
  if (message.toLowerCase().includes('morning')) {
    return 'morning-motivation';
  }
  if (message.toLowerCase().includes('journal')) {
    return 'journal';
  }
  if (message.toLowerCase().includes('hi')) {
    return 'main';
  }
  return 'main';
}

bot.dialog('/', [
  function (session, args, next) {

    // Prompt user for next field
    var route = mainRouter(session.message.text)

    if (route != 'main') {
      session.beginDialog('/' + route);
    }
    else {
      builder.Prompts.text(session, 'hi, how can i help you?');
    }
  },
  function (session, results) {
    session.replaceDialog('/')
  },
  function (session, results) {
    session.send('thanks dude, all done for now')
  }
]);

journal.journalDialog(bot);
// ToDo: Dynimically load bots in a specific folder

bot.dialog('/morning-motivation', [
  function moreThings(session, numRequested) {
    if (numRequested == null) numRequested = 3;

    request('http://localhost:3333/cards/random/' + numRequested, function (error, response, body) {
      if (!error && response.statusCode == 200) {

        for (var card of JSON.parse(body)) {
          session.send('#### ' + card.title + '\n' + card.description);
        }
      }
      else {
        console.log('Error: ' + error)
      }

      builder.Prompts.choice(session, 'Do you want more, or do you want to move on?', ['more', 'next', 'quit']);
    })
  },
  function (session, results, next) {
    if (results.response.entity === 'more') session.beginDialog('/morning-motivation', 2);
    if (results.response.entity === 'next') session.replaceDialog('/journal')
    if (results.response.entity === 'quit') session.endDialog();
  },
  function (session, results) {
        session.send("Excellent dude", results.response);
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
