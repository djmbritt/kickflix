var kickass = require('kickass-torrent');
var readline = require('readline');
var proc = require('child_process');
var colors = require('colors');
var torrents;

function getLogTor(query, callback){
	kickass(query, function(err, response) {
		if (err) console.error(err);
		torrents = response.list;
		console.log(response.description + '\n' + 'total_results: ' + response.total_results);
		
		var len = response.list.length;
		for(var i = 0; i < len; i++){
			console.log(i + '. \t' + response.list[i].title + '\n' + '\t' + response.list[i].pubDate + '\n' + '\t' + 'Peers: ' + response.list[i].peers + '\t' + 'Seeds: ' + response.list[i].seeds + '\t' + 'Votes: ' + response.list[i].votes);
		}
		callback();
	});
}

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var kickflix = rl.question('Search KickAss: ', function(answer){
	getLogTor(answer, function() {
		rl.question('Choose torrent to stream (type in the number): ', function(n){
			proc.exec(process.cwd() + '/node_modules/peerflix/app.js -v -r ' + torrents[n].torrentLink, function(err, ouput, stdin) {
				if(err) console.error(err);
				output.pipe(stdout);
			});
		});

	});
});

module.exports = kickflix;