"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
require('dotenv').load();
var journalTemplate = require('./content/morningJournal');
var request = require('request');

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


var diagArray = [];


for (var q of journalTemplate.structure.questions) {
  if (q.type === 'nine-scale-question') {
    diagArray.push(function (session) {
      if (q.additonalInfo != null) session.send('*' + q.additonalInfo + '*')
      builder.Prompts.number(session, q.question);
    })
  }
  else if (q.type === 'open-question') {
    diagArray.push(function (session) {
      builder.Prompts.text(session, q.question)
    })
  }
}
diagArray.push(
  function (session, results, next) {
    session.send('thanks for you entry: ' + results.response)
    next()
  }
);


bot.dialog('/morning-journal', diagArray)



bot.dialog('/morning-motivation', [
  function moreThings(session, numRequested) {
    if (numRequested == null) numRequested = 3;

    request('http://localhost:3333/cards/random/' + numRequested, function (error, response, body) {
      if (!error && response.statusCode == 200) {

        for (var card of JSON.parse(body)) {
          session.send('#### ' + card.title + '\n' + card.description);
        }
      }

      builder.Prompts.choice(session, 'Do you want more, or do you want to move on?', ['more', 'next', 'quit']);
    })
  },
  function (session, results, next) {
    if (results.response.entity === 'more') session.beginDialog('/morning-motivation', 2);
    if (results.response.entity === 'next') session.replaceDialog('/morning-journal')
    if (results.response.entity === 'quit') session.endDialog();
  }
]);

bot.dialog('/journal', [
  function (session) {
    session.send('Rankings from 1-9: 1 > awful,depressed; 5 > neutral 9 > extermely happy, motivated')
    builder.Prompts.number(session, 'How did you feel when you woke up this morning? [1-9]');
  },
  function (session, results) {
    builder.Prompts.text(session, 'How do you feel right now? Reflect on what is influencing this?');
  },
  function (session, results, next) {
    session.send('thanks for you entry: ' + results.response)
    next();
  }
]);

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
