#!/usr/bin/env node
var _ = require('lodash');
var kickass = require('kickass-torrent');
var readline = require('readline');
var proc = require('child_process');
var torrents;
var pageNumber = 0;



function getLogTor(query, callback) {
    kickass(query, function(err, response) {
        if (err) console.error(err);
        pageNumber += 1;
        torrents = response.list;
        console.log(response.description + '\n' + 'total_results: ' + response.total_results);

        var len = response.list.length;
        for (var i = 0; i < len; i++) {
            console.log(i + '. \t' + response.list[i].title + '\n' + '\t' + response.list[i].pubDate + '\n' + '\t' + 'Peers: ' + response.list[i].peers + '\t' + 'Seeds: ' + response.list[i].seeds + '\t' + 'Votes: ' + response.list[i].votes);
        }
        callback();
    });
}

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


function ask(){
    rl.question('Search Kickass: ', function(answer) {
        getLogTor({
            q: answer,//actual search term
            field:'seeders',//seeders, leechers, time_add, files_count, empty for best match
            order:'desc',//asc or desc
            page: pageNumber,//page count, obviously
            url: 'http://kickass.to',//changes site default url (http://kickass.to)
        }, function () {
            rl.question('Press enter to search again or input number to stream torrent: ', function chooseRedo(n){
                    if(_.isString(n)){ ask();
                }else{
                    proc.exec(__dirname + '/node_modules/peerflix/app.js -v -r ' + torrents[n].torrentLink, function(err) {
                        if(err) console.error(err);
                        // findout how to send peerflix output to the console.
                    });
                }
            });

        });
    });
}

ask();
