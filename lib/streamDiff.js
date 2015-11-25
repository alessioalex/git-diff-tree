'use strict';

var bubbleError = require('bubble-stream-error').bubble;
var through = require('through2');

function streamDiff(inputStream, blackList) {
  var diff = null;

  var blacklist = blackList || [];

  function prepareDiff(diffData) {
    if (diffData.lines.length) {
      var tmp = diffData.lines.pop();

      if (tmp !== '') {
        diffData.lines.push(tmp);
      }
    }

    return diffData;
  }

  function isBlacklisted(file) {
    return (blacklist.indexOf(file) !== -1);
  }

  function write(line, enc, cb) {
    var tmp = line.match(/^diff --git a\/(.+?) b\/(.+)$/);

    // new diff, must emit previous diff
    if (tmp) {
      if (diff && !diff.isBlacklisted) {
        this.push(prepareDiff(diff));
      }

      diff = {
        aPath: tmp[1],
        bPath: tmp[2],
        lines: [],
        isBlacklisted: isBlacklisted(tmp[2] || tmp[1])
      };
    } else if (diff && !diff.isBlacklisted) {
      // for speed improvement reasons
      if (diff.lines.length) {
        diff.lines.push(line);
      } else if (/^(old mode|new file mode|deleted file mode|similarity index|rename|index) /.test(line)) {
        // ignore
      } else if (line) {
        if (line.match(/^Binary files (.+) differ/)) {
          diff.isBinary = true;
        } else if (!line.match(/^(---|\+\+\+) (.*)/)) {
          diff.lines.push(line);
        }
      }
    }

    cb();
  }

  function end(cb) {
    if (diff && !diff.isBlacklisted) {
      this.push(prepareDiff(diff));
    }

    cb();
  }

  var outStream = through({
    objectMode: true
  }, write, end);

  bubbleError(outStream, [inputStream]);
  inputStream.pipe(outStream);

  return outStream;
}

module.exports = streamDiff;
