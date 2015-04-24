//Script for testing the kickass api, write a json file to this folder.
var fs = require('fs');
var kick = require('kickass-torrent');

var search = process.argv[2].toString();
var fileName = search + '.json';

function getTor(query) {
    kick(query, function(err, data) {
        if (err) console.error(err);
        blob = JSON.stringify(data);
        fs.writeFile(fileName, blob, 'utf8', function(err) {
            if (err) console.error(err);
            console.log('Check out file: ' + 'kick.json');
        });
    });
}

getTor(search);