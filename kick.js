#!/usr/bin/env node

const rl = require('readline')
const ExtraTorrentApi = require('extratorrent-api')
const spawn = require('child_process').spawn
const logUpdate = require('log-update')
const chalk = require('chalk')

const eta = new ExtraTorrentApi();
const readline = rl.createInterface(process.stdin, process.stdout)

function kickAssQuery (kickQuery, pageNumber, cb) {
  query = {
    with_words: kickQuery,
    page: pageNumber
  }

  eta.search(query , kickQuery)
    .then(data => {

      if(data.total_results === 0){
        console.log('No results for this search, try again.')
        return ask()
      }

      console.log(
        chalk.bgYellow.black(
          `PageNumber:${data.page} - TotalPages:${data.total_pages} - ` +
          `TotalResults:${data.total_results} - ResponseTime:${data.response_time}ms`
        )
      );

      torrentList = data.results.map((val, idx, ary) => {
        readline.write(
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

function reQuery (answer, pageNumber) {
  kickAssQuery(answer, pageNumber, (torrentList) => {
    const askForInput = 'Search again [enter], next page [m], previous page [n], stream torrent [number]: '

    readline.question(askForInput, (n) => {
      if (n.length === 0) return ask()

      if (n === 'm') {
        console.log(chalk.bgRed('Next page.'))
        pageNumber++
        return reQuery(answer, pageNumber)
      }

      if (n === 'n') {

        if (pageNumber > 1) {
          console.log(chalk.bgRed('Previous page.'))
          pageNumber--
          return reQuery(answer, pageNumber)
        } else {
          console.log(chalk.bgRed('This is already the first page.'))
          return reQuery(answer, pageNumber)
        }

      } else if (n > torrentList.length) {
        console.log(chalk.bgRed('Choose between 0 and 49!'))
        return reQuery(answer, pageNumber)

      } else if (!isNaN(n)) {
        const vlc = spawn('node', ['./node_modules/peerflix/app.js', '-v', '-r', '-d', torrentList[n].magnet], {
          stdio: 'inherit' // output streams in real time
        })

        console.log(`Starting stream...\n ${torrentList[n].title} \n ${torrentList[n].size}`)

        vlc.on('error', err => {
          console.error(err)
          process.exit(0)
        })

        vlc.on('exit', data => {
          console.log('Exiting gracefully.')
          process.exit(0)
        })

      } else {
        console.log(chalk.bgRed('Returning Ask()'))
        return ask()
      }
    })
  })
}

function ask (answer, cb) {
  readline.question(chalk.yellow('KickFlix Search: '), answer => {
    if (answer.length === 0) {
      console.log('Try again: ')
      return ask()
    } else {
      cb(answer, 1)
    }
  })
}

ask()
