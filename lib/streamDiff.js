'use strict';
function streamDiff(inputStream, blackList) {
  var blacklist = blackList || [];
  function prepareDiff(diffData) {
    if (diffData.lines.length) {
      var tmp = diffData.lines.pop();

      if (tmp !== '') {
        diffData.lines.push(tmp);
      }
    return diffData;
    var tmp = line.match(/^diff --git a\/(.+?) b\/(.+)$/);
    if (tmp) {
        aPath: tmp[1],
        bPath: tmp[2],
        lines: [],
