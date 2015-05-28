#!/usr/bin/env node

var http = require('http');
var readline = require('readline');
var spawn = require('child_process').spawn;
var getLogTor = require('./lib/getlog.js');
var checkUpTime = require('./lib/upcheck');


var BASEURL = 'http://kat.cr' || 'http://kickassto.co/' || 'http://katproxy.is/' || 'http://thekat.tv/' ;
var pageNumber = 0;

var rl = readline.createInterface(process.stdin, process.stdout);

function ask() {
    rl.question('Search Kickass: ', function(answer) {
        if(answer.length === 0) {
            console.log("type in something");
            ask();
        }else{
            getLogTor(rl, 
                {   q: answer, //actual search term
                    field: 'seeders', //seeders, leechers, time_add, files_count, empty for best match
                    order: 'desc', //asc or desc
                    page: pageNumber, //page count, obviously
                    url: BASEURL //changes site default url (http://kickass.to)
                }, 
                function input(){
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