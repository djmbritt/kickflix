#!/usr/bin/env node

var rl = require('readline');
var kickass = require('kat-api');
var spawn = require('child_process').spawn;
var chalk = require('chalk');
var checkUpTime = require('./lib/upcheck');
// var commander = require('commander');

// keypress(process.stdin);

var readline = rl.createInterface(process.stdin, process.stdout);
var torrents;
var pageNumber = 1;

function kickAssQuery(kickQuery, cb) {
  kickass.search({
      query: kickQuery,
      page: pageNumber,
      verified: 1,
      sort_by: 'seeders'
    }, kickQuery)
    .then(function(data) {
      torrents = data.results;
      console.log(chalk.bgYellow.black("PageNumber: " + data.page + " TotalPages: " + data.total_pages + " TotalResults: " + data.total_results));
      for (var i = 0; i < torrents.length; i++) {
        readline.write(i + '. \t' +
          chalk.magenta.bold(torrents[i].title) + '\n' + '\t' +
          chalk.green(torrents[i].category) + '\t' + 
          chalk.blue(torrents[i].pubDate.slice(0, -5)) + '\n' + '\t' +
          'Seeders:' + chalk.yellow(torrents[i].seeds) + ' - ' +
          'Leechers:' + chalk.yellow(torrents[i].leechs) + ' - ' +
          'Peers:' + chalk.yellow(torrents[i].peers) + ' - ' +
          'Votes:' + chalk.yellow(torrents[i].votes) + ' - ' +
          'Size:' + chalk.yellow(Math.round(Math.pow(10, -6) * torrents[i].size)) + 'Mb' + '\n'
        );
      }
      cb();
    })
    .catch(err => console.error(err));
}

function reQuery(answer) {

  kickAssQuery(answer, function() {

    var askForInput = "[enter] to search again, [m] load next page, [n] previous page, [number] to stream torrent: ";
    readline.question(askForInput, function(n) {
      if (n.length === 0) return ask();

      if (n == 'm') {
        pageNumber++;
        return reQuery(answer);
      }

      if(n == 'n'){
      	if(pageNumber>1) pageNumber--;
      	return reQuery(answer);
      }

      if (typeof Number(n) === 'number') {
        var vlc = spawn('./app.js', ['-v', '-r', torrents[n].magnet], {
          cwd: __dirname + '/node_modules/peerflix'
        });

        console.log("Starting stream...\n" + torrents[n].title  + "\n" + torrents[n].pubDate + '\n' + torrents[n].size);
        // vlc.stdout.pipe(process.stdout);

        vlc.stdout.on('data', function(data) {
          process.stdout.write(data);
        });

        vlc.stderr.on('data', function(data) {
          console.error('\n Error: ' + data + '\n');
        });

        vlc.on('close', function(data) {
          readline.write('\n Something went wrong with the child_process, Error: ' + data + '\n');
        });
      } else {
        return ask();
      }
    });

  });
};

function ask(answer) {
  readline.question('Search Kickass: ', function(answer) {
    if (answer.length === 0) {
      console.log('Input your query...');
      return ask();
    } else {
      reQuery(answer);
    }
  });
}

ask();
