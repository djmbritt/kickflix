# CLI tool for looking up and streaming torrents via KickAss

KickFlix is a simple command line program that you can use to stream torrents to VLC.
It uses the peerflix module and it queries kickass torrents.

# Usage
$ sudo npm install -g kickflix

$ kickflix

# To Do

- after final selection pipe the peerflix interface to the console
- Fetch more pages from response, filter the response and push it into a new array for display in getLogTor, abstract this functionality.
- add option to sort the response object
- use colors to display and enhance UI
- Add option to scroll through response object at chooseRedo()
- Eventually learn how to use [torrentstream](https://github.com/mafintosh/torrent-stream)