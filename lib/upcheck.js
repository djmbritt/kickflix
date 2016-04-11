// Checks if kickass is online
var https = require('https');

function checkUpTime(url, cb) {
    https.get(url, function(response) {
        if (response.statusCode === 200) console.log('Kickass is up and running @ https://' + response.client._host);
        	else
        		console.log("Server not serving..." + response.client._host);
        cb();
    });
}

module.exports = checkUpTime;
