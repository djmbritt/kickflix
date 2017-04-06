#!/usr/bin/env node

'use strict'

const readline = require('readline');
const dns = require('dns');
const ExtraTorrentApi = require('extratorrent-api').Website;
// const searchPrintQuery = require('./lib/searchPrintQuery');
const spawn = require('child_process').spawn;
const meow = require('meow');
const logUpdate = require('log-update');
const chalk = require('chalk');
const hasAnsi = require('has-ansi');
const debounce = require('lodash.debounce');


//Memoize function, caches input, figure out how to use it.
// const mem = require('mem');

//Delays function excecution by 200 ms, avoiding unnecessary requests.
// const debouncer = debounce(cb => cb(), 200)

//Setup of the UI
readline.emitKeypressEvents(process.stdin);
// process.stdin.setRawMode(true);

//array used for search query
const pre = `\n${chalk.bold.cyan('>')}`
const query = []
let prevResult = ''

//BaseUrl for extraTorrent
const baseUrl = 'https://www.extratorrent.one'
//hanja sa kico e parameter nan pa ExtraTorrentApi() ta
const eta = new ExtraTorrentApi();

//display usage kickflix, expand with usage of search results.
const cli = meow(`
  Usage
    $ kickflix

  Example
    Search KickFlix: <Your Search Query>

  Press [Enter] to search.
`);

// Checks if extratorrent.cc is up
// dns.lookup(baseUrl, err => {
//   if (err && err.code === 'ENOTFOUND') {
//     logUpdate(`\n${chalk.dim('Check your internet connection...')}`)
//     process.exit(1)
//   } else {
//     logUpdate(`\n${chalk.dim('Search with KickFlix: ')}`)
//   }
// })

// logUpdate(`\n${chalk.dim('Search with KickFlix: ')}`)
logUpdate(`${pre}${chalk.dim('Search with KickFlix:')}${pre}\b`);


process.stdin.on('keypress', (char, key) => {
    key = key || {}

    if (hasAnsi(key.sequence)) {
        return
    }


    if (key.name === 'escape' || (key.ctrl && key.name === 'c')) {
        if (query.length <= 1) {
            logUpdate()
            readline.moveCursor(process.stdout, 0, -1)
        }
        process.exit()
    }

    if (key.name === 'backspace') {
        query.pop()
    } else if (key.ctrl && key.name === 'backspace') {
        query.length = 0
    } else {
        query.push(char)
    }

    const queryStr = query.join('')

    logUpdate(`${pre}${chalk.bold(queryStr)}\n\n`)

    if (query.length <= 1) {
        prevResult = ''
        logUpdate(`${pre}${chalk.bold(queryStr)}\n\n`)
        return
    }

    let queryObj = {
        with_words: queryStr,
        page: 1
    }

    if (key.name = 'return') {
      eta.search(queryObj)
          .then(res => res.results.slice(0,10))
          .then(res => {
              return res.map((val, idx, ary) => {
                return (`${val.title.substring(0, 50)}...\n\t` +
                        `Seeds:${val.seeds} ` +
                        `Leechs:${val.leechers} ` +
                        `Qlty:${val.quality} ` +
                        `Added:${val.date_added} ` +
                        `Size:${val.size}\n`)
              })
          })
          .then(res => logUpdate(res))
          .catch(err => console.error(err))
    }





})
