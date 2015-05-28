var kickass = require('kickass-torrent');

function getLogTor(readline, query, cb) {
    kickass(query, function(err, response) {
        if (err) console.error(err);

        var torrents = response.list;

        //check length of the returened array and assign appropriate value;
        var len;
        torrents.length < 10 ? len = torrents.length : len = 10;

        //readline.createInterface
        readline.write(response.description + '\n' + 'total_results: ' + response.total_results + '\n');

        for (var i = 0; i < len; i++) {
            readline.write(   i + '. \t' +
                        torrents[i].title + '\n' + '\t' +
                        torrents[i].pubDate + '\n' + '\t' +
                        'Peers: ' + torrents[i].peers + '\t' +
                        'Seeds: ' + torrents[i].seeds + '\t' +
                        'Votes: ' + torrents[i].votes + '\t' +
                        'Size: '  + Math.round(Math.pow(10, -6)*torrents[i].size) + ' Mb' + '\n'
            );
        }

        cb();
    });
}

module.exports = getLogTor;