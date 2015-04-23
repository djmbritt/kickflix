var torrent = require('webtorrent');
var kickass = require('kickass-torrent');
var prompt = require('prompt');



function getLogTor(query){
	kickass(query, function(err, response) {
		if (err) console.error(err);
		for(var i = 0; i <= response.list.length - 1; i++){
			console.log(response.list[i].title);
		}
	});
}

// mi a implementa e get torrent function, pa mi hanja e torrent.
// aworaki mi tin cu pasa door di e object, anto log e resultado nan cu mi ker
// cual ta... JSON.list[]

getLogTor(process.argv[2]);