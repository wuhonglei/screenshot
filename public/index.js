function ajax(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        var data = xhr.responseText,
            formatedData = JSON.parse(data);

        callback && callback(formatedData);
    };
    xhr.open('GET', url);
    xhr.send(null);
}

function setImage(url) {
    var img = document.querySelector('img');
    img.src = url;
}

function sendRequest() {
    var btn = document.querySelector('#button-addon2'),
        input = document.querySelector('input');

    if (!btn || !input) {
        return;
    }

    btn.onclick = function(event) {
        var value = input.value.trim();
        if (!value) {
            return;
        }

        let url = `./screenshot?site=${value}`;
        ajax(url, function(data) {
            setImage(data.pagePath);
        });
    }
}

sendRequest();