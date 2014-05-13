# csv-to-protobuf

Encode csv to protobuf

	npm install csv-to-protobuf

## Usage

``` js
var csvProtobuf = require('csv-to-protobuf');
var split = require('binary-split');
var encoder = csvProtobuf();

fs.createReadStream('data.csv').pipe(split()).pipe(encoder).on('data', function(data) {
	console.log('protobuf row:', data);
	console.log('protobuf schema:', encoder.schema);
})
```