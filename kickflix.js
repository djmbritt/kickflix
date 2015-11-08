#!/usr/bin/env node

var readline = require('readline');
var kickass = require('kat-api');
var spawn = require('child_process').spawn;
var colors = require('colors');
var checkUpTime = require('./lib/upcheck');


var pageNumber = 0;
var torrents;

var rl = readline.createInterface(process.stdin, process.stdout);


function getLogTor(readline, query, cb) {
  kickass(query, function(err, response) {
    if (err) console.error(err);

    torrents = response.list;

    //check length of the returened array and assign appropriate value;
    var len;
    torrents.length < 10 ? len = torrents.length : len = 10;

    //readline.createInterface
    readline.write(response.description + '\n' + 'total_results: ' + response.total_results + '\n');

    for (var i = 0; i < len; i++) {
      readline.write(i + '. \t' +
        colors.magenta.bold(torrents[i].title) + '\n' + '\t' +
        colors.blue(torrents[i].pubDate.slice(0, -5)) + '\n' + '\t' +
        'Peers: ' + colors.yellow(torrents[i].peers) + '\t' +
        'Seeds: ' + colors.yellow(torrents[i].seeds) + '\t' +
        'Votes: ' + colors.yellow(torrents[i].votes) + '\t' +
        'Size: ' + colors.yellow(Math.round(Math.pow(10, -6) * torrents[i].size)) + ' Mb' + '\n'
      );
    }
    cb();
  });
}




function ask(answer) {
  rl.question('Search Kickass: ', function(answer) {
    if (answer.length === 0) {
      console.log("type in something");
      return ask();
    } else {
      getLogTor(rl, {
          q: answer, //actual search term
          field: 'seeders', //seeders, leechers, time_add, files_count, empty for best match
          order: 'desc', //asc or desc
          page: pageNumber, //page count, obviously
          url: BASEURL //changes site default url (http://kickass.to)
        },
        function input() {
          rl.question('Press enter to search again or input number to stream torrent: ', function(n) {

            if (n.length === 0) return ask();
            if (typeof Number(n) === 'number') {

              //spawn child process, and start peerflix with flags -v -r.
              var vlc = spawn('./app.js', ['-v', '-r', torrents[n].torrentLink], {
                cwd: __dirname + '/node_modules/peerflix/'
              });

              //pipe output to display, need to figure out how to not make it scroll
              vlc.stdout.pipe(process.stdout);

              vlc.stderr.on('data', function(data) {
                console.error('stderr: ' + data);
              });

              vlc.on('close', function(code) {
                rl.write('child process exited with code ' + code);
                process.exit();
              });

            } else {
              return ask();
            }
          });
        });
    }
  });
}

checkUpTime(BASEURL, ask);
