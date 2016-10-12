var et = require('extratorrent-api');

var extrator = new et()

extrator.search('last week tonight')
  .then(res => console.log(res))
  .catch(err => console.error(err))
