module.exports = function(directory, recursive, regExp) {
  var dir = require('node-dir')
  var path = require('path')

  // Assume absolute path by default
  var basepath = directory

  if (directory[0] === '.') {
    // Relative path
    basepath = path.join(__dirname, directory)
  } else if (!path.isAbsolute(directory)) {
    // Module path
    basepath = require.resolve(directory)
  }

  var keys = dir
    .files(basepath, {
      sync: true,
      recursive: recursive || false
    })
    .filter(function(file) {
      return file.match(regExp || /\.(json|js)$/)
    })
    .map(function(file) {
      let newBasePath = path.join(basepath, "..")
      return "./" + path.join('.', file.slice(newBasePath.length + 1))
    })

  var context = function(key) {
    return require(context.resolve(key))
  }

  context.resolve = function(key) {
    let fileName = path.basename(key)
    return path.join(directory, fileName)
  }

  context.keys = function() {
    return keys
  }

  return context
}
