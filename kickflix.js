#!/usr/bin/env node

var http = require('http');
var kickass = require('kickass-torrent');
var readline = require('readline');
var spawn = require('child_process').spawn;

var BASEURL = 'http://kat.cr' || 'http://kickassto.co/' || 'http://katproxy.is/' || 'http://thekat.tv/' ;
var pageNumber = 0;
var torrents;

var rl = readline.createInterface(process.stdin, process.stdout);

function checkUpTime(url, cb) {
    http.get(url, function(response) {
        console.log('Kickass is up and running @', response.client._host);
        console.log('HTTP Response Status:', response.statusCode);
        cb();
    });
}

function getLogTor(query, cb) {
    kickass(query, function(err, response) {
        if (err) console.error(err);

        torrents = response.list;

        //check length of the returened array and assign appropriate value;
        var len;
        if(torrents.length < 10) len = torrents.length;
        len = 10;

        rl.write(response.description + '\n' + 'total_results: ' + response.total_results + '\n');

        for (var i = 0; i < len; i++) {
            rl.write(   i + '. \t' +
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

function ask() {
    rl.question('Search Kickass: ', function(answer) {
        if(answer.length === 0) {
            console.log("type in something");
            ask();
        }else{
            getLogTor({
                    q: answer, //actual search term
                    field: 'seeders', //seeders, leechers, time_add, files_count, empty for best match
                    order: 'desc', //asc or desc
                    page: pageNumber, //page count, obviously
                    url: BASEURL //changes site default url (http://kickass.to)
                }, function input(){
                rl.question('Press enter to search again or input number to stream torrent: ', function (n) {

                    if(n.length === 0) return ask();

                    if(typeof Number(n) === 'number'){

                        //spawn child process, and start peerflix with flags -v -r.
                        var vlc = spawn('./app.js', ['-v', '-r', torrents[n].torrentLink], {cwd: __dirname + '/node_modules/peerflix/'});

                        //pipe output to display
                        vlc.stdout.pipe(process.stdout);

                        vlc.stderr.on('data', function (data) {
                          console.error('stderr: ' + data);
                        });

                        vlc.on('close', function (code) {
                          rl.write('child process exited with code ' + code);
                          process.exit();
                        });

                    } else {
                        ask();
                    }
                });
            });
        }
    });
}

checkUpTime(BASEURL, ask);