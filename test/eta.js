const ETA = require('extratorrent-api').Website
const ExtraTorrentApi = new ETA({baseUrl: 'https://extra.to'})

ExtraTorrentApi.search('ettv')
  .then(res => console.log(res))
  .catch(err => console.error(err));
