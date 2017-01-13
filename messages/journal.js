var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");

var journalTemplate = require('./content/morningJournal').structure;

var request = require('request');

exports.journalDialog = function (bot) {
    bot.dialog('/journal', [
        function (session, args) {
            // Save previous state (create on first call)
            session.dialogData.index = args ? args.index : 0;
            session.dialogData.form = args ? args.form : {};

            let qtn = journalTemplate.questions[session.dialogData.index]

            if (qtn.type === 'nine-scale-question') {
                if (qtn.additonalInfo != null) session.send('*' + qtn.additonalInfo + '*')
                builder.Prompts.number(session, qtn.question);
            }
            else if (qtn.type === 'open-question') {
                if (qtn.additonalInfo != null) session.send('*' + qtn.additonalInfo + '*')
                builder.Prompts.text(session, qtn.question)
            }
        },
        function (session, results) {
            // Save users reply
            var field = journalTemplate.questions[session.dialogData.index++].id;
            session.dialogData.form[field] = results.response;

            // Check for end of form
            if (session.dialogData.index >= journalTemplate.questions.length) {
                // Return completed form

                session.endDialogWithResult({ response: session.dialogData.form });
            } else {
                // Next field
                session.replaceDialog('/journal', session.dialogData);
            }
        }
    ]);
}

function saveJournalEntriesToTrello(formData) {
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
}