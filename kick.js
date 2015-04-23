var kickass = require('kickass-torrent');
var readline = require('readline');
var proc = require('child_process');
var torrents;

function getLogTor(query, callback){
	kickass(query, function(err, response) {
		if (err) console.error(err);
		torrents = response.list;
		console.log(response.description + '\n' + 'total_results: ' + response.total_results);
		for(var i = 0; i < response.list.length; i++){
			console.log(i + '. \t' + response.list[i].title);
		}
		callback();
	});
}

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var kickFlix = rl.question('Search KickAss: ', function(answer){
	getLogTor(answer, function() {
		rl.question('Choose torrent to stream (type in the number): ', function(n){
			proc.exec(process.cwd() + '/node_modules/peerflix/app.js -v -r ' + torrents[n].torrentLink, function(err, ouput, stdin) {
				if(err) console.error(err);
				output.pipe(stdout);
			});
		});

	});
});

module.exports = kickFlix;