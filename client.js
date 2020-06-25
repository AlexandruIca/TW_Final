function sendGetRequest(to, callback) {
    const url = new URL(to, 'http://localhost:8080');
    const xhr = new XMLHttpRequest();

    xhr.open('GET', url.toString());
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            callback(xhr);
        }
    }
    xhr.send();
}

function sendPostRequest(to, json) {
    const url = new URL(to, 'http://localhost:8080');
    const xhr = new XMLHttpRequest();

    xhr.open('POST', url.toString());
    xhr.setRequestProperty("Content-Type", "application/json; utf-8");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            console.log('Sent question!');
        }
    }
    xhr.send(json);
}

function sendLogRequest() {
    sendGetRequest('/log', (xhr) => {
        console.log('Sent log request!');
    });
}

setInterval(sendLogRequest, 10_000); // every 10 seconds

function showStats() {
    sendGetRequest('/get_stats', (xhr) => {
        const stats = JSON.parse(xhr.responseText);
        let content = "";

        for (let user in stats) {
            content += `<div style="display: flex; flex-flow: row nowrap; justify-content: space-between">
            <p class="title">${user} - </p>
            <p class="text">${stats[user].max_score} max score, quizzes taken: ${stats[user].num_quizzes}</p>
            </div>`;
        }

        document.getElementById('main-content').innerHTML = content;
    });
}

let userName;
let userPassword;

function validateUser() {
    const userName = document.forms["userData"]["fname"].value;
    const userPasswd = document.forms["userData"]["fpasswd"].value;

    alert(`${docuemnt.forms["userData"]["foptions"].value}`);

    const json = {
        user: userName,
        password: userPasswd,
        question: {
            code: document.forms["userData"]["fcode"].value,
            options: document.forms["userData"]["foptions"].value,
            correct: document.forms["userData"]["fcorrect"].value
        }
    };

    sendPostRequest('/login', json);

    return true;
}

function addQuestion() {
    document.getElementById('main-content').innerHTML = `
    <form name="userData" onsubmit="return validateUser()" class="text">
        <label for="fname">Username:</label>
        <input type="text" id="fname" name="fname"><br><br>
        <label for="fpasswd">Password:</label>
        <input type="password" id="fpasswd" name="fpasswd"><br><br>
        <label for="fcode">Code:</label>
        <input type="text" id="fcode" name="fcode"><br><br>
        <label for="foptions">Options:</label>
        <input type="text" id="foptions" name="foptions"><br><br>
        <label for="fcorrect">Correct option:</label>
        <input type="text" id="fcorrect" name="fcorrect"><br><br>
        <input type="submit" value="Submit">
    </form>
    `;
}

function shuffle(arr) {
    arr.sort(function () {
        return 0.5 - Math.random();
    });
}

let quizData;
let quizDataIndex = 0;
let currentUserName;
let currentScore = 0;

function clicked(what) {
    console.log(`Clicked ${what}`);

    if(quizData[quizDataIndex].correct.find(elem => elem === what)) {
        currentScore++;
    }

    quizDataIndex++;

    if (quizDataIndex >= 2) {
        document.getElementById('main-content').innerHTML = `<p class="title">Score: ${currentScore}</p>`;
        sendGetRequest(`/store_user/${currentUserName}/${currentScore}`);
        currentScore = 0;
    }
    else {
        let buttons = "";

        for (let i = 0; i < quizData[quizDataIndex].options.length; i++) {
            buttons += `<button type="button" onclick="clicked(${i})">${quizData[quizDataIndex].options[i]}</button>`;
        }

        document.getElementById('main-content').innerHTML = `
        <div style="display: flex; flex-flow: column nowrap; justify-content: center">
        <div class="code-snippet">
            <p>${quizData[quizDataIndex].code}</p>
         </div>
         ${buttons}
         </div>
        `;
    }
}

function validateUserName() {
    const userName = document.forms["userName"]["userQuiz"].value;
    currentUserName = userName;
    sendGetRequest(`/new_quiz/${userName}`, (xhr) => {
        quizData = JSON.parse(xhr.responseText);
        shuffle(quizData);
        quizDataIndex = 0;
        currentScore = 0;

        let buttons = "";

        for (let i = 0; i < quizData[quizDataIndex].options.length; i++) {
            buttons += `<button type="button" onclick="clicked(${i})">${quizData[quizDataIndex].options[i]}</button>`;
        }

        document.getElementById('main-content').innerHTML = `
        <div style="display: flex; flex-flow: column nowrap; justify-content: center">
        <div class="code-snippet">
            <p>${quizData[quizDataIndex].code}</p>
         </div>
         ${buttons}
         </div>`;
    });
    sendGetRequest(`/new_user/${userName}`, (xhr) => {
        console.log('New user!');
    });
}

function takeQuiz() {
    document.getElementById('main-content').innerHTML = `
    <form name="userName" class="text">
        <label for="userQuiz">Username:</label>
        <input type="text" id="userQuiz" name="userQuiz">
    </form>
    <button type="button" onclick="validateUserName()">Start!</button>
    `;
}