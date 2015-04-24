# CLI tool for looking up and streaming torrents via KickAss

KickFlix is a simple command line program that you can use to stream torrents to VLC.
It uses the peerflix module and it queries kickass torrents.

#To Do

- Fetch more pages from response, filter the response and push it into a new array for display.
- refactor readline to use rl.prompt() method
- Use [blessed](https://github.com/chjj/blessed) for the interface instead of only built in readline module.
- Eventually learn how to use [torrentstream](https://github.com/mafintosh/torrent-stream)
- 