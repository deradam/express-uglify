

/**
 * Middleware
 *
 **/

module.exports = function(options) {

  var uglify = require("uglify-js"),
      fsys = require("../lib/filesystem.js"),
      url = require("url"),
      src;

  if(options.hasOwnProperty("src")) {
    src = options.src;
  } else {
    throw new Error("ExpressUglify middleware requires a 'src' directory");
  }

  return function(req, res, next) {
    var path = url.parse(req.url).pathname;
    if(path.match(/[^(min)]\.js/)) {
      fsys.getFile(src+path,
        function(data, isCached) {
          if(!isCached) {
            var ast = uglify.parser.parse(data);

            ast = uglify.uglify.ast_mangle(ast);
            ast = uglify.uglify.ast_squeeze(ast);
            ast = uglify.uglify.gen_code(ast);

            // Cache the file so we don't have to do it again.
            fsys.writeFile(src+path, ast,
              function() {
                console.log("Cached uglified: "+path);
              });

            res.send(ast, {"Content-Type": "application/javascript"}, 200);
          } else {
            res.send(data, {"Content-Type": "application/javascript"}, 200);
          }

        });
    } else {
      next();
    }

  };

};