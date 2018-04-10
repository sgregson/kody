"use strict";

/**
 * DotFiles - set up symlinks for dotfiles suffixed with .link
 * @license MIT
 * @author jh3y
 */

var shell = require("shelljs"),
  winston = require("winston");

var PROPS = {
    HOME_CMD: "echo $HOME",
    EMPTY_MSG: "no .files for linking.",
    FILE_REGEXP: /\.link$/,
    FILE_SUFFIX: ".link"
  },
  options = {
    name: " DotFiles",
    default: true,
    description: "sets up symlinks for global dotfiles",
    exec: function exec(resolve) {
      var $HOME = shell
          .exec(PROPS.HOME_CMD, {
            silent: true
          })
          .stdout.trim(),
        dotFiles = shell
          .find(".")
          .filter(file => !file.match("node_modules"))
          .filter(function(file) {
            return file.match(PROPS.FILE_REGEXP);
          });

      if (dotFiles.length > 0) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (
            var _iterator = dotFiles[Symbol.iterator](), _step;
            !(_iteratorNormalCompletion = (_step = _iterator.next()).done);
            _iteratorNormalCompletion = true
          ) {
            var _dotFile = _step.value;

            var source = process.cwd() + "/" + _dotFile;
            var basename = _dotFile;
            if (basename.indexOf("/") !== -1)
              basename = basename.substr(basename.lastIndexOf("/") + 1);
            basename = basename.replace(PROPS.FILE_SUFFIX, "");
            var destination = $HOME + "/." + basename;

            var truncated = {
              source: source.replace(/\/$/, ""),
              destination: destination.replace(/\/$/, "")
            };

            if (shell.test("-L", destination)) {
              winston.log("found symlink at " + destination);

              if (shell.test("-f", destination)) {
                // F I L E    L I N K
                // .cat() and .to() breaks symlink and creates simple backup
                shell.cat(destination).to(destination + ".bak");

                if (!shell.error())
                  winston.info(
                    "FILE successfully backed up to " + destination + ".bak"
                  );

                shell.rm(destination);
              } else if (shell.test("-d", destination)) {
                // D I R    L I N K
                // remove old backup, mkdir backup dir, copy contents to backup, rm
                var errs = false;
                shell.rm("-rf", destination + ".bak");
                if (shell.error()) {
                  errs = true || errs;
                  winston.error("failed to remove .bak");
                }

                shell.mkdir(destination + ".bak");
                if (shell.error()) {
                  errs = true || errs;
                  winston.error("failed to make .bak");
                }

                shell.cp("-RfL", destination + "/**/*", destination + ".bak");
                if (shell.error()) {
                  errs = true || errs;
                  winston.error("failed to cp into .bak");
                }

                if (!errs) {
                  winston.info(
                    "DIR successfully backed-up to " + destination + ".bak/"
                  );
                }

                shell.rm("-rf", destination);
                if (shell.error()) {
                  winston.error("Failed to delete " + destination);
                }
              } else {
                // Safety failed, kill the offending file
                shell.rm("-rf", destination);
              }
            } else {
              if (shell.test("-d", destination)) {
                winston.info("non-symbolic directory at " + destination);
                winston.info(
                  "cp -r " +
                    truncated.destination +
                    "/* into " +
                    truncated.source
                );
                shell.cp("-r", truncated.destination + "/*", truncated.source);
                if (!shell.error()) {
                  winston.success(
                    "copied existing files from " +
                      destination +
                      " into " +
                      source
                  );
                  shell.rm("-rf", truncated.destination);
                  winston.success("symlink ready!!");
                } else {
                  winston.error("couldn't copy existing files");
                  winston.info("manually move it yourself");
                }
              }
            }

            shell.ln("-sf", source, destination);
            if (!shell.error()) {
              winston.success("linked " + source + " to " + destination);
            } else {
              winston.error(
                "unable to link " + basename + " to " + destination
              );
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      } else winston.info(PROPS.EMPTY_MSG);
      resolve();
    }
  };

exports.options = options;
