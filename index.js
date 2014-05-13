var through = require('through2')
var protobuf = require('protocol-buffers')
var binaryCSV = require('binary-csv')

var createSchema = function(cells) { // hack for fast array -> protobuf enc
  cells = cells.map(function(cell, i) {
    return {
      tag: i,
      name: i,
      type: cell.type
    }
  })
  return protobuf(cells)
}

module.exports = function(headers, opts) {
  if (headers && !Array.isArray(headers)) return module.exports(null, headers);
  if (!opts) opts = {}

  var csv = binaryCSV(opts) // pass options object directly to binaryCSV

  var cellSchema = (headers || []).map(function(cell, i) {
    return typeof cell === 'string' ? {type:'bytes', name:cell, tag:i} : cell
  })

  var schema = cellSchema.length && protobuf(cellSchema)

  function write(buf, enc, cb) {
    var cells = csv.line(buf)

    for (var i = 0; i < cells.length; i++) {
      cells[i] = csv.cell(cells[i])
    }
    if (!schema) {
      for (var i = 0; i < cells.length; i++) {
        cellSchema.push({type:'bytes', name:cells[i].toString(), tag:i})
      }

      schema = createSchema(cellSchema)
      stream.push(schema.encode(cells))

      return stream.emit('schema', cellSchema, cb) || cb();
    }

    cb(null, schema.encode(cells))
  }

  var stream = through.obj({highWaterMark:16}, write)
  stream.schema = cellSchema
  return stream
}