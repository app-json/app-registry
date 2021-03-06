"use strict"
require("dotenv").load()
var registry = require("./lib/registry").init()
var express = require("express")
var cors = require("cors")
var app = express()

app.set("port", (process.env.PORT || 5000))
app.use(cors())

app.get("/apps", function(req, res){
  res.json(registry.entries)
})

registry.on("ready", function(){
  app.listen(app.get("port"), function(){
    console.log("Listening on port %d", app.get("port"))
  })

  if (process.env.GIT_SYNC_INTERVAL) {
    setInterval(function(){
      registry.repo.sync(function(err){
        if (err) return console.error(err)
        console.log("git repo sync complete")
      })
    }, Number(process.env.GIT_SYNC_INTERVAL)*1000)
  }

})
