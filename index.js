const { readdirSync } = require('fs');
const path = require('path')
const callsite = require('callsite')

module.exports = function(directory, recursive, regExp) {
  // Assume absolute path by default
  var basepath = directory

  if (directory[0] === '.') {
    // Relative path
    let stack = callsite()
    let requester = stack[1].getFileName()
    basepath = path.join(path.dirname(requester), directory)
  } else if (!path.isAbsolute(directory)) {
    // Module path
    basepath = require.resolve(directory)
  }

  var keys = getFiles(basepath)
    .filter(function(file) {
      return file.match(regExp || /\.(json|js)$/)
    })
    .map(function(file) {
      return "./" + path.join('.', file.slice(basepath.length + 1))
    })

  var context = function(key) {
    return require(context.resolve(key))
  }

  context.resolve = function(key) {
    return path.join(basepath, key)
  }

  context.keys = function() {
    return keys
  }

  return context
}


function getFiles(dir) {
  const dirents = readdirSync(dir, { withFileTypes: true });
  const files = dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  });
  return Array.prototype.concat(...files);
}