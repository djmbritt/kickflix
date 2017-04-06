#!/usr/bin/env node
'use strict'

const readline = require('readline');
const dns = require('dns');
const spawn = require('child_process').spawn;
const logupdate = require('log-update');
const thepiratebay = require('thepiratebay');
const commander = require('commander');
const chalk = require('chalk');
const debounce = require('lodash').debounce;
const hasAnsi = require('has-ansi');
const inquirer = require('inquirer');

const rline = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

readline.emitKeypressEvents(process.stdin, [rline])
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
      logUpdate()
      rline.moveCursor(process.stdout, 0, 1)
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
    return
  }


  if (key.name === 'enter') {

    query.length = 0
    readline.cursorTo(process.stdout, 0, 0)
    readline.clearScreenDown(process.stdout, 0, 0)
    logupdate('searching...')

    return thepiratebay.search(queryStr)
      .then(data => {

        logupdate('Searching...')

        if (data.length === 0) {
          logupdate('No results for this query, try again...')
          return
        }

        //stop keypress input


        return inquirer.prompt([{
          name: 'torrents',
          message: 'Search torrents with KickFlix: ',
          type: 'list',

          pageSize: 5,
          choices: data.slice(0, 30)
        }])
          .then((query) => {
            console.log(chalk.red(query.name));
          })
          .catch(err => console.error(err))

      })
      .catch(err => console.error(err))

  }

}) //process.stdin.on('keypress')
