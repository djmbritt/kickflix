#!/usr/bin/env node

var rl = require('readline')
var kickass = require('./lib/kat.js')
var spawn = require('child_process').spawn
var chalk = require('chalk')

var readline = rl.createInterface(process.stdin, process.stdout)
var pageNumber = 1
var torrents

function kickAssQuery (kickQuery, cb) {
  kickass.search({
    query: kickQuery,
    page: pageNumber,
    verified: 1,
    sort_by: 'seeders'
  }, kickQuery).then((data) => {
    torrents = data.results

    console.log(chalk.bgYellow.black(
      'PageNumber: ' + data.page +
      ' TotalPages: ' + data.total_pages +
      ' TotalResults: ' + data.total_results
    ))

    for (var i = 0; i < torrents.length; i++) {
      readline.write(i + '. \t' +
        chalk.magenta.bold(torrents[i].title) + '\n' + '\t' +
        chalk.green(torrents[i].category) + '\t' +
        chalk.blue(torrents[i].pubDate.slice(0, -5)) + '\n' + '\t' +
        'Seeders:' + chalk.yellow(torrents[i].seeds) + ' - ' +
        'Leechers:' + chalk.yellow(torrents[i].leechs) + ' - ' +
        'Peers:' + chalk.yellow(torrents[i].peers) + ' - ' +
        'Votes:' + chalk.yellow(torrents[i].votes) + ' - ' +
        'Size:' + chalk.yellow(Math.round(Math.pow(10, -6) * torrents[i].size)) + 'Mb' + '\n'
      )
    }

    cb()
  }).catch(err => console.error(err))
}

function reQuery (answer) {
  kickAssQuery(answer, () => {
    var askForInput = '[enter] to search again, [m] load next page, [n] previous page, [number] to stream torrent: '

    readline.question(askForInput, (n) => {
      if (n.length === 0) return ask()

      if (n === 'm') {
        console.log(chalk.bgRed('Next page.'))
        pageNumber++
        return reQuery(answer)
      }

      if (n === 'n') {
        if (pageNumber > 1) {
          console.log(chalk.bgRed('Previous page.'))
          pageNumber--
          return reQuery(answer)
        } else {
          console.log(chalk.bgRed('This is allready the first page.'))
          return reQuery(answer)
        }
      } else if (n > torrents.length) {
        console.log(chalk.bgRed('Choose between 0 and 24!'))
        return reQuery(answer)
      } else if (!isNaN(n)) {
        var vlc = spawn('node ./node_modules/peerflix/app.js', ['-v', '-r', '-d', torrents[n].magnet], {
          // cwd: __dirname + '/node_modules/peerflix',
          stdio: 'inherit' // output all streams in real time
          // shell: true // vlc.on('exit', afn) does not work anymore
        })

        console.log('Starting stream...\n' + torrents[n].title + '\n' + torrents[n].pubDate + '\n' + torrents[n].size)

        vlc.on('error', (err) => {
          console.error(err)
          process.exit(0)
        })

        vlc.on('exit', (data) => {
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

function ask (answer) {
  readline.question(chalk.yellow('Welcome to KickFlix!\nSearch Kickass: '), (answer) => {
    if (answer.length === 0) {
      console.log('Input your query...')
      return ask()
    } else {
      reQuery(answer)
    }
  })
}

ask()
