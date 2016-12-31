exports.structure =
    {
        id: 'morning-journal',
        description: 'sort out my morning',
        type: 'survey',
        questions:
        [
            {
                type: 'nine-scale-question',
                id: 'feeling-morning-scale',
                question: 'How did you feel when you woke up this morning? [1-9]',
                additonalInfo: 'Rankings from 1-9: \n 1 > awful,depressed \n 5 > neutral \n 9 > extermely happy, motivated'
            },
            {
                type: 'nine-scale-question',
                id: 'feeling-now-scale',
                question: 'How did do you feel now? [1-9]',
                additonalInfo: 'Rankings from 1-9: \n 1 > awful,depressed \n 5 > neutral \n 9 > extermely happy, motivated'
            },
            {
                type: 'open-question',
                id: 'how-feeling-now-open',
                question: 'How do you feel right now? What is influencing this?',
            },
            {
                type: 'open-question',
                id: 'activity-and-rest',
                question: 'How much activity, planned rest and sleep did you do yesterday > what does this mean for today\'s plan?',
            },
            {
                type: 'open-question',
                id: 'gratefulness',
                question: 'What are three or more things that I am grateful for?',
                additonalInfo: 'These can be small or incentital, or major things',
            },
            {
                type: 'open-question',
                id: 'today-goals',
                question: 'What is your anchor task for today?',
                additonalInfo: 'One thing that if completed would make today a success',
            },
            {
                type: 'open-question',
                id: 'resonating-today',
                question: 'What truth or question is resonating right now?',
            }
        ]
    }

