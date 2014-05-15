'use strict'
var fs = require("fs")
var events = require("events")
var url = require("url")
var git = require("gift")
var uniq = require("uniq")

var Registry = module.exports = (function() {

  function Registry() {
    var _this = this
    this.entries = []
    this.preamble = ""
    this.dir = "/tmp/repo-" + Math.round(Math.random()*1000000)
    this.registryFile = this.dir + "/Registry.md"
    this.url = url.format({
      protocol: "https",
      auth: ":" + process.env.GITHUB_OAUTH_TOKEN,
      host: "github.com",
      pathname: "heroku/app.json.wiki"
    })

    // console.log(this.url)

    git.clone(this.url, this.dir, function(err, repo) {
      if (err)
        _this.emit("error", err)
      else
        _this.repo = repo
        _this.readDoc(function(){
          _this.emit("ready")
        })
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
    fs.readFile(this.registryFile, function(err, doc){
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
        .sort()

      _this.emit('doc-read')
      return cb(null)
    })
  }

  Registry.prototype.writeDoc = function(cb) {
    var _this = this
    var output = uniq(this.entries)
      .sort()
      .map(function(entry){
        return "- " + entry
      })
      .join("\n")
    fs.writeFile(this.registryFile, output, function(err){
      if (err) return cb(err)
      _this.emit('doc-write')
      return cb(null)
    })
  }

  Registry.prototype.publish = function(entry, cb) {
    var _this = this
    _this.repo.sync(function(err){
      if (err) return cb(err)
      _this.readDoc(function(err){
        if (err) return cb(err)
        _this.entries.push(entry)
        _this.writeDoc(function(err){
          if (err) return cb(err)
          // var author = "Zeke Sikelianos zeke@sikelianos.com"
          _this.repo.commit("Publish something", {all: true}, function(err){
            if (err) return cb(err)
            console.log(4)
            _this.repo.sync(function(err){
              if (err) return cb(err)
              console.log(5)
              return cb(null)
            })
          })
        })
      })
    })

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
