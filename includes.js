(function() {
  var args = process.argv.slice(2);

  console.log("args", args);
  var fs = require('fs');

  //fs.createReadStream('src/index.html').pipe(fs.createWriteStream('build/index11.html'));

  var files = getFiles("src", true);

  console.log(args[0]);

  replaceIncludesInFile(args[0]);
  replaceIncludesOfFile(args[0]);

  function replaceIncludesInFile(path) {
    if(path.indexOf(".inc.") == -1) {
      var string = fs.readFileSync(path).toString();
      var output = replaceIncludes(string);
      if(output.hasIncludes > 0 && path.indexOf(".inc.") == -1) {
        fs.writeFileSync(path.replace("src", "build"), output.string);
      }
    }
  }

  function replaceIncludesOfFile(findpath) {
    files.forEach(function(path) {
      var incRegex = new RegExp(".*add ([\\w\\\\\\/\\.]*" + escapeRegExp(getFilenameFromPath(findpath)) + ").*", "gi");
      var string = fs.readFileSync(path).toString();
      if(string.search(incRegex) !== -1) {
        if(path.indexOf(".inc.") == -1) {
          var output = replaceIncludes(string);
          fs.writeFileSync(path.replace("src", "build"), output.string);
        }
        replaceIncludesOfFile(getFilenameFromPath(path));
      }
    })
  }

  //function concat(arrayOfPaths, output) {
  //  var out = arrayOfPaths.map(function(path) {return fs.readFileSync(path).toString();}).join("\n");
  //  fs.writeFileSync(output, out);
  //
  //}
  //
  //concat(["build/js/f1.js", "build/js/f2.js"], "build/js/all.js");


  function replaceIncludes(string) {
    var incRegex = /.*add ([\w\\\/\.]*\.[^-\s]*).*/gi;
    var output = {hasIncludes: false, string: string};
    output.string = string.replace(incRegex, function repl(line, path, pos) {
      output.hasIncludes = true;
      var indent = line.match(/(^[\s]*)/) ? line.match(/(^[\s]*)/)[0] : "";
      var file = "src/" + path;
      try{
        var fd = fs.openSync(file);
        fd.close();
      } catch(e) {
        file = getFullPath(path);
      }
      return indent + line.replace("add", "included").replace(/(^[\s]*)/, "") + "\n" +
          indent + "  " + fs.readFileSync(file).toString().replace(/\n/g, "\n" + indent + "  ") + "\n";
          // indent + line.replace("add", "end").replace(".inc.", ".included.").replace(/(^[\s]*)/, "") + "\n\n";
    });
    if(output.hasIncludes) {
      output.string = replaceIncludes(output.string).string;
    }
    return output;
  }

  /**
   *
   * @param folder
   * @param nested
   * @returns {Array}
   */
  function getFiles(folder, nested) {
    var files = [];
    var items = fs.readdirSync(folder);
    items.forEach(function(item) {
      if(item.indexOf(".") > -1) {
        files.push(folder + "/" + item)
      }
      else if(nested) {
        files = files.concat(getFiles(folder + "/" + item, true));
      }
    })
    return files;
  }

  function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  }

  function getFilenameFromPath(path) {
    return path.slice(path.lastIndexOf("/") + 1).slice(path.lastIndexOf("\\") + 1);
  }

  function getFullPath(pathfragment) {//or filename
    var found = files.filter(function(f) {
      return f.replace("\\", "/").indexOf(pathfragment.replace("\\", "/")) > -1;
    })
    if(found.length > 1) {
      console.log("Ambigious filename:", found.join(", "));
    }
    if(found.length == 0) {
      console.log("File not found: ", filename);
    }
    return found[0];
  }
})();


