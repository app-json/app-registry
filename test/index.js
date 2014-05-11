'use strict'
require("dotenv").load()
var assert = require("assert")
var fs = require("fs")
var util = require("util")
var Registry = require("..")

describe("Registry", function() {
  this.timeout(3000)
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


})
