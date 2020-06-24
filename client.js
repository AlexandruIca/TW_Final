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

function sendLogRequest() {
    sendGetRequest('/log', (xhr) => {
        console.log('Sent log request!');
    });
}

setInterval(sendLogRequest, 10_000); // every 10 seconds