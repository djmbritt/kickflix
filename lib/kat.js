'use strict'

var request = require('request'),
  URI = require('urijs'),
  Q = require('q')

var url = URI('https://kat.cr'),
  mirror = URI('http://kickassunblock.net')

var queryTorrents = function (query, retry) {
  var defer = Q.defer(),
    queryParams = {},
    endpoint = 'json.php'

  if (!query || (query && typeof query !== 'string' && !query.query && !query.category && !query.min_seeds && !query.uploader && !query.age && !query.safety_filter && !query.verified && !query.language)) {
    defer.reject(new Error('Missing a mandatory parameter'))
    return defer.promise
  }

  if (typeof query === 'string') {
    queryParams = { q: query }
  } else {
    queryParams.q = query.query || ''
    if (query.category) queryParams.q += ' category:' + query.category
    if (query.min_seeds) queryParams.q += ' seeds:' + query.min_seeds
    if (query.uploader) queryParams.q += ' user:' + query.uploader
    if (query.age) queryParams.q += ' age:' + query.age
    if (query.safety_filter) queryParams.q += ' is_safe:' + query.safety_filter
    if (query.verified) queryParams.q += ' verified:' + query.verified
    if (query.language) queryParams.q += ' lang_id:' + filteredLangCode(query.language)
    if (query.imdb) queryParams.q += ' imdb:' + query.imdb.replace(/\D/g, '')
    if (query.tvrage) queryParams.q += ' tv:' + query.tvrage
    if (query.sort_by) queryParams.field = query.sort_by
    if (query.order) queryParams.order = query.order
    if (query.page) queryParams.page = query.page
  }

  var requestUri
  if (!retry) {
    requestUri = url.clone()
      .segment(endpoint)
      .addQuery(queryParams)
  } else {
    requestUri = mirror.clone()
      .segment(endpoint)
      .addQuery(queryParams)
  }

  var t = Date.now()
  request(requestUri.toString(), {
    json: true
  }, function (error, response, body) {
    if (error) {
      defer.reject(error, retry)
    } else if (!body || response.statusCode >= 400) {
      defer.reject(new Error('No data'), retry)
    } else if (!body.list || Object.keys(body.list).length === 0) {
      defer.reject(new Error('No results'), retry)
    } else {
      defer.resolve(format(body, query.page || 1, Date.now() - t))
    }
  })

  return defer.promise
}

var format = function (response, page, responseTime) {
  var formatted = {}
  formatted.results = response.list

  // Format
  formatted.response_time = parseInt(responseTime)
  formatted.page = parseInt(page)
  formatted.total_results = parseInt(response.total_results)
  formatted.total_pages = Math.ceil(formatted.total_results / 25)

  // Add magnet
  for (var i = 0; i < formatted.results.length; i++) {
    formatted.results[i].magnet = 'magnet:?xt=urn:btih:' + formatted.results[i].hash + '&dn=' + formatted.results[i].title.replace(/[^a-z|^0-9]/gi, '+').replace(/\++/g, '+').toLowerCase() + '&tr=udp%3A%2F%2Ftracker.publicbt.com%2Fannounce&tr=udp%3A%2F%2Fopen.demonii.com%3A1337'
  }
  return formatted
}

var search = function (query) {
  return queryTorrents(query)
    .then(function (response, retry) {
      return response
    })
    .catch(function (error, retry) {
      if (!retry) {
        return queryTorrents(query, true)
      } else {
        return error
      }
    })
}

module.exports = {
  search: search
}
