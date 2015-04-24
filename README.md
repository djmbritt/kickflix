# CLI tool for looking up and streaming torrents via KickAss

KickFlix is a simple command line program that you can use to stream torrents to VLC.
It uses the peerflix module and it queries kickass torrents.

# Usage
$ sudo npm install -g kickflix
$ kickflix

# To Do

- after final selection pipe the peerflix interface to the console
- Fetch more pages from response, filter the response and push it into a new array for display.
- refactor readline to use rl.prompt() method
- refactor the line 15
- add option to scroll through response object
- add option to sort the response object
- Use [blessed](https://github.com/chjj/blessed) for the interface instead of only built in readline module
- Eventually learn how to use [torrentstream](https://github.com/mafintosh/torrent-stream)