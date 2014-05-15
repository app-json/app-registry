'use strict'
require("dotenv").load()
var assert = require("assert")
var fs = require("fs")
var util = require("util")
var Registry = require("../lib/registry")

describe("Registry", function() {
  var registry

  before(function(done) {
    registry = Registry.init()
    registry.on("ready", function() {
      done()
    })
  })

  it("readDoc", function(done) {
    registry.readDoc(function(err) {
      assert(!err)
      assert(util.isArray(registry.entries))
      assert(registry.entries.length)
      done()
    })
  })

  it("writeDoc", function(done) {
    registry.entries = ["a", "b", "c"]
    registry.writeDoc(function(err, cb) {
      assert(!err)
      var fileContent = fs.readFileSync(registry.dir + "/Registry.md").toString()
      assert.equal(fileContent, "- a\n- b\n- c")
      done()
    })
  })

  it("publish", function(done) {
    this.timeout(3000)
    registry.entries = [
      "https://github.com/zeke/sample0",
      "https://github.com/zeke/sample1",
      "https://github.com/zeke/sample3"
    ]
    var app = "https://github.com/zeke/sample2"
    registry.publish(app, function(err) {
      console.error(err)
      console.error(err.error)
      assert(!err)
      assert.equal(registry.entries.length, 4)
      console.log("almost done")
      // assert.equal(registry.entries.indexOf(app), 2)
      done()
    })
  })

})
