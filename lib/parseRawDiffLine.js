"use strict";

function parseRawDiffLine(text) {
  var res = {};
  var matched = null;

  if (matched = text.match(/^:([0-7]{6}) ([0-7]{6}) ([0-9a-fA-F]{40}) ([0-9a-fA-F]{40}) (.)([0-9]{0,3})\t(.*)$/)) {
    res.fromMode = matched[1];
    res.toMode = matched[2];
    res.fromId = matched[3];
    res.toId = matched[4];
    res.status = matched[5];
    if (matched[6].trim() !== '') {
      res.similarity = parseInt(matched[6], 10);
    }

    // renamed or copied
    if (res.status === 'R' || res.status === 'C') {
      var tmp = matched[7].split('\t');
      res.fromFile = tmp[0];
      res.toFile = tmp[1];
    } else {
      res.fromFile = res.toFile = matched[7];
    }

  // combined diff (for merge commit)
  } else if (matched = text.match(/^(::+)((?:[0-7]{6} )+)((?:[0-9a-fA-F]{40} )+)([a-zA-Z]+)\t(.*)$/)) {
    res.nparents = matched[1].length;
    res.fromMode = matched[2].split(' ');
    res.toMode = res.fromMode.pop();
    res.fromId = matched[3].split(' ');
    res.toId = res.fromId.pop();
    res.status = matched[4].split(' ');
    res.toFile = matched[5];

  } else if (matched = text.match(/^([0-9a-fA-F]{40})$/)) {
    res.commit = matched[1];
  }

  return res;
}

module.exports = parseRawDiffLine;
