#!/usr/bin/env node

const readline = require('readline');
const dns = require('dns');
const ExtraTorrentApi = require('extratorrent-api');
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
process.stdin.setRawMode(true);

//array used for search query
const query = []

//hanja sa kico e parameter nan pa ExtraTorrentApi() ta
const eta = new ExtraTorrentApi();

//display usage kickflix, expand with usage of search results.
// const cli = meow(`
//   Usage
//     $ kickflix
//
//   Example
//     Search KickFlix: <Your Search Query>
//
//   Press [Enter] to search.
// `);

//Checks if extratorrent.cc is up
dns.lookup('extratorrent.cc', err => {
  if (err && err.code === 'ENOTFOUND') {
    logUpdate(`\n${chalk.dim('Check your internet connection...')}`)
    process.exit(1)
  } else {
    logUpdate(`\n${chalk.dim('Search with KickFlix: ')}`)
  }
})

process.stdin.on('keypress', (char, key) => {
  key = key || {}

  // if (hasAnsi) {
  //
  // }


  if(key.name === 'escape' || (key.ctrl && key.name === 'c')){
    if (query.length <= 1) {
      logUpdate()
      readline.moveCursor(process.stdout, 0, -1)
    }
    process.exit()
  }

  if (key.name === 'backspace') {
    query.pop()
  // } else if (key.name === 'return') {
  //  search query
  } else {
    query.push(char)
  }

  const queryStr = query.join('')
  let pageNumber = 1



})


function kickAssQuery (kickQuery, page, cb) {
  query = {
    with_words: kickQuery,
    page: page
  }

  eta.search(query , kickQuery)
    .then(data => {

      if(data.total_results === 0){
        logUpdate('No results for this search, try again.')
        return ask()
      }

      logUpdate(
        chalk.bgYellow.black(
          `PageNumber:${data.page} - TotalPages:${data.total_pages} - ` +
          `TotalResults:${data.total_results} - ResponseTime:${data.response_time}ms`
        )
      );

      torrentList = data.results.map((val, idx, ary) => {
        logUpdate(
          `${idx}\t${chalk.magenta.bold(val.title.substring(0, 50))}...\n\t` +
          `Seeds:${chalk.green(val.seeds)} ` +
          `Leechs:${chalk.green(val.leechers)} ` +
          `Qlty:${chalk.green(val.quality)} ` +
          `Added:${chalk.green(val.date_added)} ` +
          `Size:${chalk.green(val.size)}\n`
        )
      });

      cb(torrentList)
    })
    .catch(err => console.error(err))
}

function reQuery (answer, page, query, torrentList) {
  kickAssQuery(answer, page, query, (torrentList) => {
    const askForInput = 'Search again [enter], next page [m], previous page [n], stream torrent [number]: '
    logUpdate(askForInput)

      if (n === 'm') {
        logUpdate(chalk.bgRed('Next page.'))
        page++
        return reQuery(answer, page)
      }

      if (n === 'n') {

        if (page > 1) {
          logUpdate(chalk.bgRed('Previous page.'))
          page--
          return reQuery(answer, page)
        } else {
          logUpdate(chalk.bgRed('This is already the first page.'))
          return reQuery(answer, page)
        }

      } else if (n > torrentList.length) {
        logUpdate(chalk.bgRed('Choose between 0 and 49!'))
        return reQuery(answer, page)

      } else if (!isNaN(n)) {
        const vlc = spawn('node', ['./node_modules/peerflix/app.js', '-v', '-r', '-d', torrentList[n].magnet], {
          stdio: 'inherit' // output streams in real time
        })

        logUpdate(`Starting stream...\n ${torrentList[n].title} \n ${torrentList[n].size}`)

        vlc.on('error', err => {
          console.error(err)
          process.exit(0)
        })

        vlc.on('exit', data => {
          logUpdate('Exiting gracefully.')
          process.exit(0)
        })

      } else {
        logUpdate(chalk.bgRed('Returning Ask()'))
        return ask()
      }
    })
  })
}

function ask (answer, cb) {
    if (answer.length === 0) {
      logUpdate('Try again: ')
      return ask()
    } else {
      reQuery(answer, 1)
    }
  })
}

ask()
