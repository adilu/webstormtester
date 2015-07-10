var args = process.argv.slice(2);

console.log(args[0]);
var fs = require('fs');
//Falls Minifierung erwünscht (eher nicht nötig, zudem mühsam zur Fehlersuche)
//var UglifyJS = require('uglify-js');
//var result = UglifyJS.minify(out, {fromString: true, outSourceMap: "build/js/yes.js.map"});
//fs.writeFileSync(output, result.code);
//fs.writeFileSync(output + ".map", result.map);

fs.createReadStream('src/index.html').pipe(fs.createWriteStream('build/index.html'));

function concat(arrayOfPaths, output) {
  var out = arrayOfPaths.map(function(path) {return fs.readFileSync(path).toString();}).join("\n");
  fs.writeFileSync(output, out);

}

concat(["build/js/f1.js", "build/js/f2.js"], "build/js/all.js");