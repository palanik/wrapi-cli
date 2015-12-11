'use strict';

var program = require('commander');
var pattern = require('urlpattern').express;

function wrapiCli(endpoints, wrapi) {

  program
    .version('0.0.1')
    .option('-d --debug', 'output debug ')
    .on('--help', function() {
      console.log( 'Custom help')
    });

  program.parse(process.argv);

  for (var e in endpoints) {
    defineEndpoint(e, endpoints[e]);
  }

  program.parse(process.argv);

  function getFunc(obj, e) {
    if (obj[e]) {
      return obj[e];
    }
    if (e.length <= 1) {
      return obj[e];
    }

    var name = e.shift();
    return getFunc(obj[name], e);
  }

  function defineEndpoint(e, endPoint) {
    var command = e;
    var placeholders = [];
    var regexp = pattern.parse(endPoint.path, placeholders);
    command = placeholders.reduce(function(acc, ph) {
      return acc + ' <' + ph.name + '>';
    }, command);

    var func = getFunc(wrapi, e.split('.'));

    program
      .command(command)
      .action(function() {
        var args = [];
        var qs = {};
        for (var i = 0; i < arguments.length - 1; i++) {
          var kv = arguments[i].split('=');
          if (kv.length == 1) {
            args[i] = kv[0];
          }
          else {
            qs[kv[0]] = kv[1];
          }
        }

        args.push(qs);
        args.push(function(err, data) {
          if (err) {
            console.error(err);
          }
          else {
            console.log(JSON.stringify(data));
          }
        });

        func.apply(wrapi, args);
      });
  }
}

module.exports = wrapiCli;
module.exports.version = '1.0.0';
