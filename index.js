const express = require('express');
const { writeFile } = require('fs');

let logData = "";

function getTimeStamp() {
    const d = new Date();
    return `[${d.getDate()}/${d.getMonth()}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}.${d.getMilliseconds()}]`;
}

function log(str) {
    const now = getTimeStamp();
    console.log(`${now} ${str}`);

    if (logData.length > 0) {
        logData = `${logData}\n${now} ${str}`;
    }
    else {
        logData = `${now} ${str}`;
    }
}

const app = express();

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.get('/', (req, res) => {
    log("New request!");
    res.send('Hello');
});

app.get('/log', (req, res) => {
    writeFile('cpp_quiz_log.txt', logData + '\n', { 'flag': 'a' }, function (err) {
        if (err) {
            console.log('Error writing log data!');
        }
    });
    res.send('Logged');
});

const defaultPort = 8080;
const port = process.env.PORT || defaultPort;

app.listen(port, () => {
    log('App started...');
    console.log(`App available at localhost:${port}`);
});