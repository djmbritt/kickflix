var http = require('http');

function checkUpTime(url, cb) {
    http.get(url, function(response) {
        if (response.statusCode === 200) console.log('Kickass is up and running @ http://' + response.client._host);
        cb();
    });
}

module.exports = checkUpTime;