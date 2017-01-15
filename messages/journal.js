var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");

var journalTemplate = require('./content/morningJournal').structure;
const crypto = require("crypto");

var request = require('request');

var journalGuid = crypto.randomBytes(8).toString("hex");

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
                saveJournalEntriesToTrello(session.dialogData.form);
                session.endDialogWithResult({ response: session.dialogData.form });
            } else {
                // Next field
                session.replaceDialog('/journal', session.dialogData);
            }
        }
    ]);
}

function saveJournalEntriesToTrello(formData) {

    console.log('############## FORM ###########:' + JSON.stringify(formData))

    request.post('http://localhost:3333/journal/', JSON.stringify(formData), processPostResponse)

    function processPostResponse(error, httpResponse, body) {
        if (!error && response.statusCode == 200) {
           console.log('all good')
        }
        else {
            console.log('Error: ' + error)
        }
    }
}