'use strict'
require("dotenv").load()
var fs = require("fs")
var events = require("events")
var url = require("url")
var git = require("gift")

var Registry = module.exports = (function() {

  function Registry() {
    var _this = this
    this.entries = []
    this.preamble = ""
    this.dir = "/tmp/repo-" + Math.round(Math.random()*1000000)
    this.url = url.format({
      protocol: "https",
      auth: ":" + process.env.GITHUB_OAUTH_TOKEN,
      host: "github.com",
      pathname: "heroku/app.json.wiki"
    })

    git.clone(this.url, this.dir, function(err, repo) {
      if (err)
        _this.emit("error", err)
      else
        _this.repo = repo
        _this.emit("ready", repo)
    })

    this.on("ready", function() {
      // console.log('ready')
    })

    this.on("doc-read", function() {
      // console.log('doc-read')
    })

    this.on("doc-write", function() {
      // console.log('doc-write')
    })

  }

  Registry.prototype = new events.EventEmitter

  Registry.prototype.readDoc = function(cb) {
    var _this = this
    var pattern = new RegExp("^- ")
    fs.readFile(this.dir + "/Registry.md", function(err, doc){
      if (err) return cb(err)

      // _this.preamble =

      _this.entries = doc.toString()
        .split("\n")
        .filter(function(line){
          return line.match(pattern)
        })
        .map(function(line){
          return line.replace(pattern, '')
        })

      _this.emit('doc-read')
      return cb(null)
    })
  }

  Registry.prototype.writeDoc = function(cb) {
    var _this = this
    var output = this.entries.map(function(entry){
      return "- " + entry
    }).join("\n")
    fs.writeFile(this.dir + "/Registry.md", output, function(err){
      if (err) return cb(err)
      _this.emit('doc-write')
      return cb(null)
    })
  }

  Registry.prototype.publish = function(entry, cb) {
    // git sync
    // read entries from doc
    // push new entry
    // write entries to doc
    // git sync
  }

  Registry.init = function(cb) {
    return new Registry(cb)
  }

  return Registry

})()
