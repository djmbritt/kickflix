// Prototype for interactive UI.
var blessed = require('blessed');

var screen = blessed.screen({
	autoPadding: true,
	smartCSR: true
});

screen.title = 'Kick Flix';

var form = blessed.form({
    parent: screen,
    name: 'form',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
});

var input = blessed.textbox({
    parent: form,
    name: 'input',
    input: true,
    keys: true,
    inputOnFocus: true,
    content: 'Search KickAss Torrents: ',
    top: 0,
    left: 0,
    height: 1,
    width: '100%',
    style: {
        fg: 'white',
        bg: 'black',
        focus: {
            bg: 'red',
            fg: 'white'
        }
    }
});

input.focus();

screen.key(['enter'], function() {
	var searchQuery = form.getValue();
	form.clearValue();
	form.setContent('You inputted: ' + searchQuery);
	screen.render();
;})

screen.key(['backspace'], function(ch, key) {
	form.clearValue();
})

screen.key(['escape'], function(ch, key) {
  return process.exit(0);
});

screen.render();
