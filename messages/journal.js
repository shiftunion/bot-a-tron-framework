var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");

var journalTemplate = require('./content/morningJournal').structure;
const crypto = require("crypto");

var request = require('request');

var journalGuid = crypto.randomBytes(8).toString("hex");

exports.journalDialog = function (bot) {
    bot.dialog('/journal', [
        function (session, args) {
            // Save previous state (or create on first call)
            session.dialogData.index = args ? args.index : 0;
           // session.dialogData.form = args ? args.form : {};
            session.dialogData.questions = args ? args.questions : [];

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
            let qtn = journalTemplate.questions[session.dialogData.index++];
           // session.dialogData.form[questionId] = results.response;

            session.dialogData.questions.push(
                {
                    'questionId': qtn.id,
                    'response': results.response,
                    'question': qtn.question,
                    'questionType': qtn.type
                }
            )

            // Check for end of form
            if (session.dialogData.index >= journalTemplate.questions.length) {
                // Return completed form
                saveJournalEntriesToTrello(session.dialogData.questions);
                session.endDialogWithResult({ response: session.dialogData.form });
            } else {
                // Next field
                session.replaceDialog('/journal', session.dialogData);
            }
        }
    ]);
}

function saveJournalEntriesToTrello(questions) {

    // map form data to the format you want to use using array.map



    let payload = {
        'questionAnswerSetType': 'morning-journal-001',
        'questions': questions
    }


    console.log('############## FORM ###########:' + JSON.stringify(payload))

    request({
        method: 'POST',
        uri: 'http://localhost:3333/question/',
        json: payload
    },
        processPostResponse
    )


    //request.post('http://localhost:3333/journal/', payload, processPostResponse).json = formData



    function processPostResponse(error, httpResponse, body) {
        if (!error && httpResponse.statusCode == 200) {
            console.log('√√√√√ all good')
        }
        else {
            console.log('√√√√ ErRor => ' + error + '\n BoDy => ' + JSON.stringify(body))
        }
    }
}