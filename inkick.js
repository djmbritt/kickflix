#!/usr/bin/env node

// 'use strict'

const readline = require('readline');
const dns = require('dns');
const spawn = require('child_process').spawn;
const thepiratebay = require('thepiratebay');
// const commander = require('commander'); //add options for later use
const chalk = require('chalk');
const inquirer = require('inquirer');
const ora = require('ora');

readline.cursorTo(process.stdout, 0, 0)
readline.clearScreenDown(process.stdout, 0, 0)

const baseUrl = thepiratebay.baseUrl.substring(8)
dns.lookup(baseUrl, (err) => {
  if (err && err.code === 'ENOTFOUND') {
    console.log(chalk.dim('Site might be down or check your internet connection, exiting..'))
    process.exit(1)
  }
})

prompt()

function prompt() {

  readline.cursorTo(process.stdout, 1, 0)
  readline.clearScreenDown(process.stdout, 0, 0)

  let torrentList = []
  let magnetLink = ''

  inquirer.prompt({
      name: 'searchquery',
      message: `Search torrents with KickFlix: (leave empty to search TOP25)\n`,
      type: 'input',
      default: () => undefined

    })
    .then((val) => {

      const inputQuery = val.searchquery.length === 0 ? undefined : val.searchquery

      const spinner = new ora()
      spinner.start('\b')

      const queryObj = {
        category: 'video', // default - 'all' | 'all', 'audio', 'video', 'xxx',
        filter: {
          verified: true // default - false | Filter all VIP or trusted torrents
        },
        // page: 0, // default - 0 - 99
        orderBy: 'seeds', // default - name, date, size, seeds, leeches
        sortBy: 'desc'
      }

      inquirer.prompt({
          name: 'torrents',
          message: `\t${chalk.red('Seed')}\t${chalk.green('Leech')}\t${chalk.blue('Size')}\t${chalk.yellow('Date')}\t\t${chalk.cyan('Name')}`,
          choices: () => {
            return thepiratebay.search(inputQuery, queryObj)
              .then(data => {
                if (data.length === 0) {
                  spinner.warn()
                  return ['Y) No results for this query, try again...']
                } else {
                  let ary = data.map((el, ind) => {
                    torrentList.push(el.magnetLink)
                    return torrentsString(el, ind)
                  })
                  spinner.succeed()
                  ary.push(`X)\tSearch again...`)
                  return ary
                }
              })
              .catch(err => console.error(err))
          },
          type: 'list',
          default: 'Something went wrong...',
          pageSize: 10

        })
        .then((data) => {
          const torStr = data.torrents
          if (torStr.charAt(0) === 'X') {
            delete this
            prompt()
          }
          if (torStr.charAt(0) === 'Y') {
            delete this
            prompt()
          } else {
            magnetLink = torrentList[parseInt(torStr.charAt(0) + torStr.charAt(1)) || parseInt(torStr.charAt(0))]
            reQuery(magnetLink)
          }
        })
        .catch(err => console.error(err))

    })
    .catch(err => console.error(err))

}


function torrentsString(el, ind) {
  return `${ind})\t${chalk.red(kify(el.seeders))}` +
    `\t${chalk.green(kify(el.leechers))}` +
    `\t${chalk.blue(trimString(el.size))}` +
    `\t${chalk.yellow(el.uploadDate)}` +
    `\t${el.name}`
}

function trimString(str) {
  let stringDot = str.split(' ')
  let numberString = stringDot[0].slice(0, 3)
  if (str.endsWith('GiB')) {
    return `${Number.parseFloat(numberString)}${str.slice(-3,-2)}B`
  } else {
    return `${Number.parseInt(numberString)}${str.slice(-3,-2)}B`
  }
}

function kify(str) {
  if (str.length > 4) {
    return str.slice(0, 2) + 'K'
  } else {
    return str
  }
}


function reQuery(answer) {

  const vlc = spawn('node', ['./node_modules/peerflix/app.js', '-v', '-r', '-d', answer], {
    stdio: 'inherit' // output streams in real time
  })

  vlc.on('error', err => {
    console.error(err)
    process.exit(0)
  })

  vlc.on('exit', data => {
    console.log('Exiting gracefully.')
    process.exit(0)
  })
}
