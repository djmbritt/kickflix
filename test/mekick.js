#!/usr/bin/env node
'use strict'

const readline = require('readline');
const dns = require('dns');
const spawn = require('child_process').spawn;
const logupdate = require('log-update');
const thepiratebay = require('thepiratebay');
// const commander = require('commander');
const chalk = require('chalk');
// const debounce = require('lodash').debounce;
const hasAnsi = require('has-ansi');
const inquirer = require('inquirer');

readline.emitKeypressEvents(process.stdin)
if (process.stdin.isTTY) {
  process.stdin.setRawMode(true)
}

readline.cursorTo(process.stdout, 0, 0)
readline.clearScreenDown(process.stdout, 0, 0)

readline.cursorTo(process.stdout, 0, 0)
console.log('KickFlix.');

const baseUrl = thepiratebay.baseUrl.substring(8)
dns.lookup(baseUrl, (err) => {
  if (err && err.code === 'ENOTFOUND') {
      logupdate(chalk.dim('Site might be down, or check your internet connection, exiting..'))
      process.exit(1)
  } else {
    logupdate(chalk.dim('Search pirateBay:'))
  }

})

let query = []
let prevResult = ''

process.stdin.on('keypress', (char, key) => {
  key = key || {}

  if(hasAnsi(key.sequence)) {
    return
  }

  if (key.name === 'escape' || key.ctrl && key.name === 'c') {
    if (query.length <= 1) {
      logupdate()
      readline.moveCursor(process.stdout, 0, 1)
    }
    process.exit()
  }

  if (key.name === 'backspace') {
    query.length = 0
  } else if (key.ctrl && key.name === 'backspace'){
    query.length = 0
  }else {
    query.push(char)
  }

  let queryStr = query.join('')
  logupdate(chalk.bold(queryStr))

  if (query.length <= 1) {
    prevResult = ''
    logupdate(chalk.bold(queryStr))
  }


  if (key.name === 'enter') {
    queryStr = query.join('')
    query.length = 0
    readline.cursorTo(process.stdout, 0, 0)
    readline.clearScreenDown(process.stdout, 0, 0)
    logupdate('searching...')

    thepiratebay.search(queryStr)
      .then(data => {

        logupdate('Searching...')

        if (data.length === 0) {
          logupdate('No results for this query, try again...')
          return
        }

        //stop keypress input
        // readline.emitKeypressEvents(process.stdout)
        // process.stdin.pause()

        inquirer.prompt([{
          name: 'torrents',
          message: 'Search torrents with KickFlix: ',
          type: 'rawlist',
          pageSize: 10,
          choices: data.slice(0, 30)
        }])
          .then((query) => {
            console.log(query);
          })
          .catch(err => console.error(err))

      })
      .catch(err => console.error(err))

  }

}) //process.stdin.on('keypress')
