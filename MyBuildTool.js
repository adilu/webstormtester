var args = process.argv.slice(2);

console.log(args[0]);
var fs = require('fs');

fs.createReadStream('src/index.html').pipe(fs.createWriteStream('build/index.html'));