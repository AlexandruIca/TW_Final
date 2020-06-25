const express = require('express');
const bodyParser = require('body-parser');
const { writeFile, readFile } = require('fs');

let logData = "";
let users;

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

function initUsers() {
    readFile('users.json', function (err, usersData) {
        if (err) {
            log('Error reading JSON data!');
            return;
        }

        users = JSON.parse(usersData);
    });
}

function handleNewUser(name) {
    if (name in users) {
        log(`Long time no see ${name}...`);
    }
    else {
        log(`New user: ${name}!`);
        users[name] = { max_score: 0, num_quizzes: 0 };
    }
}

function handleStoreUser(name, score) {
    if (name in users) {
        log(`User ${name} scored: ${score}!`);

        if (score > users[name].max_score) {
            users[name].max_score = score;
            log(`New high score for ${name}: ${score}! Congrats!`);
        }

        users[name].num_quizzes++;
        log(`Registered new completed quiz for ${name}!`);
        writeFile('users.json', JSON.stringify(users), function (err) {
            if (err) {
                log('Error writing users data!');
            }
        });
    }
    else {
        log(`Invalid user store request: ${name} - user not found!`);
    }
}

function getUsersStats() {
    return JSON.stringify(users);
}

const router = express.Router();
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

router.post('/login', (req, res) => {
    log(`User request: ${req.body.user}`);
    log(`Password request: ${req.body.password}`);
    res.end('yes');
});

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.get('/', (req, res) => {
    log('New request!');
    res.send('Hello');
});

app.get('/log', (req, res) => {
    writeFile('cpp_quiz_log.txt', logData + '\n', { 'flag': 'a' }, function (err) {
        if (err) {
            console.log('Error writing log data!');
        }
    });
    log('Updated log file!');
    res.send('Logged');
});

app.get('/new_user/:name', (req, res) => {
    handleNewUser(req.params.name);
    res.send('Handled new user');
});

app.get('/store_user/:name/:score', (req, res) => {
    handleStoreUser(req.params.name, req.params.score);
    res.send('Stored');
});

app.get('/get_stats', (req, res) => {
    log('Stats requested!');
    res.send(getUsersStats());
});

app.get('/new_quiz/:name', (req, res) => {
    log('New quiz requested!');
    readFile('./questions.json', 'utf-8', (err, json) => {
        if(err) {
            log('Error reading questions file!');
        }
        res.send(json);
    });
});

const defaultPort = 8080;
const port = process.env.PORT || defaultPort;

app.listen(port, () => {
    log('App started...');
    console.log(`App available at localhost:${port}`);
    initUsers();
});