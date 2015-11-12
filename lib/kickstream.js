#!/usr/bin/env node

var rl = require('readline');
var kickass = require('kat-api');
var spawn = require('child_process').spawn;
var chalk = require('chalk');
var commander = require('commander');
var torrentStream = require('torrent-stream');
var ProgressBar = require('progress');

var readline = rl.createInterface(process.stdin, process.stdout);
var torrents;
var pageNumber = 1;

var inputquery;
var testquery = process.argv[2];
if (testquery) inputquery = testquery;

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
      torrents.forEach(function(elem, i, arr) {
        readline.write(i + '. \t' +
          chalk.magenta.bold(elem.title) + '\n' + '\t' +
          chalk.green(elem.category) + '\t' +
          chalk.blue(elem.pubDate.slice(0, -5)) + '\n' + '\t' +
          'Seeders:' + chalk.yellow(elem.seeds) + ' - ' +
          'Leechers:' + chalk.yellow(elem.leechs) + ' - ' +
          'Peers:' + chalk.yellow(elem.peers) + ' - ' +
          'Votes:' + chalk.yellow(elem.votes) + ' - ' +
          'Size:' + chalk.yellow(Math.round(Math.pow(10, -6) * elem.size)) + 'Mb' + '\n'
        );
      });
      cb();
    }).catch(err => console.error(err));
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

      if (n == 'n') {
        if (pageNumber > 1) pageNumber--;
        return reQuery(answer);
      }

      if (typeof Number(n) === 'number') {


        console.log("Starting Engine with the following torrent: \n" +
          chalk.magenta.bold(torrents[n].title) + '\n' +
          chalk.green(torrents[n].category) + " - " +
          chalk.blue(torrents[n].pubDate) + '\n' +
          'Seeders:' + chalk.yellow(torrents[n].seeds) + ' - ' +
          'Leechers:' + chalk.yellow(torrents[n].leechs) + ' - ' +
          'Peers:' + chalk.yellow(torrents[n].peers) + ' - ' +
          'Votes:' + chalk.yellow(torrents[n].votes) + ' - ' +
          'Size:' + chalk.yellow(Math.round(Math.pow(10, -6) * torrents[n].size)) + 'Mb');

        var bar, engine, stream, fileLength;

        engine = torrentStream(torrents[n].magnet, () => {
          console.log('Strap in, Activating Torrent Engine...');
        });

        engine.on('ready', () => {
          console.log('ready');

          engine.files.forEach((file, index) => {
            console.log(index + ' - Filename: ' + file.name + " - " + file.length);
          });

          readline.question('Select file to stream: ', (m) => {
            fileLength = engine.files[m].length;
            stream = engine.files[m].createReadStream();
          });
        });

        bar = new ProgressBar(':bar', {
          total: torrents[n].size
        });

        engine.on('download', function(data) {
          console.log(data);
        });

      } else {
        console.log("something went wrong");
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

ask(inputquery);
