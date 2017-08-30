"use strict";

let serve = require("serve");
let path = require("path");

let dir = path.join(__dirname, "build");

const server = serve(dir, {
  port: 4011,
  ignore: ['node_modules']
})
