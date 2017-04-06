const chalk = require('chalk');

module.exports.extraTor = function (str, ind){
  let color
  ind % 2 === 1 ? color = chalk.bgRed : color = chalk.green
  return ind + color(
    `\t${str.title(0, 50)}...\n\t
      Seeds:${str.seeds}
      Leechs:${str.leechers}
      Qlty:${str.quality}
      Added:${str.date_added}
      Size:${str.size}\n
    `
  )
}

module.exports.pirateBay = function (str, ind){
  let color
  ind % 2 === 1 ? color = chalk.red : color = chalk.cyan
  return color(
    `${ind}\t${chalk.bold(str.name.substring(0, 50))}...
      Seeds:${str.seeders} Leechs:${str.leechers} Added:${str.uploadDate} Size:${str.size
    `
  )
}
