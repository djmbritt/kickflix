var progress = require('progress');

var bar = new progress(':bar', {total:10});

setInterval(() => {
	bar.tick();
}, 1000);
