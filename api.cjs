const fs = require('fs');
const myDictionary = {};
module.exports.processQuery = function(res, query) {
    let utils = new Utils()
    let prompt = query['text'];
    fs.readFile('trainingdata.json', 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file from disk: ${err}`);
        } else {
            // parse JSON string to JSON object
            const conversations = JSON.parse(data)[0]['conversations'];
            conversations.forEach(item => {
                myDictionary[item[0]] = item[1];
            });

        }
    });
    let best_match = '';
    let max_score = -Infinity;

    Object.keys(myDictionary).forEach(question => {
        const score = similarity(prompt.toLowerCase(), question.toLowerCase());
        if (score > max_score) {
            max_score = score;

            best_match = question;
        }
    });

    const similarity_score = max_score;
    if (similarity_score < 0.4) {
        response = "I'm sorry, but I don't have that information right now. However, I'll make sure to record your question for future reference. Thank you for understanding, and sorry for any inconvenience caused. 😊";
    }
    else {
        response = myDictionary[best_match];
    }

    try {
            response = response.replace("#Time#", new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            response = response.replace("#Date#", new Date().toLocaleDateString());
            response = response.replace("#Day#", new Date().toLocaleDateString('en-US', { weekday: 'long' }));
            response = response.replace("#Month#", new Date().toLocaleDateString('en-US', { month: 'long' }));
            response = response.replace("#Year#", new Date().getFullYear());
            response = response.replace("#Name#", query['name']);
            response = response.replace("#Location#", query['location']);
            response = response.replace("#Email#", query['email']);
            response = response.replace("#Phone#", query['phone']);
            response = response.replace("#Organization#", query['organization']);
            response = response.replace("#age#", new Date().getFullYear() - 2020);
            response = response.replace("#joke#", utils.getJoke());
    }
    catch (e) {

    }

    return response;
};

function similarity(a, b) {
    if (a.length > b.length) {
        [a, b] = [b, a];
    }
    let n = a.length;
    let m = b.length;
    if (m === 0) {
        return 0;
    }
    if (n === 0) {
        return m;
    }
    let previous_row = Array.from(Array(m + 1), (_, i) => i);
    for (let i = 0; i < n; i++) {
        let current_row = [i + 1];
        for (let j = 0; j < m; j++) {
            let insertions = previous_row[j + 1] + 1;
            let deletions = current_row[j] + 1;
            let substitutions = previous_row[j] + (a[i] !== b[j]);
            current_row.push(Math.min(insertions, deletions, substitutions));
        }
        previous_row = current_row;
    }
    return (m - previous_row[m]) / m;
}

class Utils {
    getJoke() {
        return fetch('https://v2.jokeapi.dev/joke/Programming,Dark,Pun?blacklistFlags=sexist&type=single')
            .then(response => response.json())
            .then(data => {
                return data.joke;
            });
    }
}