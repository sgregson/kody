'use strict';

/**
  * DotFiles - set up symlinks for dotfiles suffixed with .link
  * @license MIT
  * @author jh3y
*/

var shell = require('shelljs'),
    winston = require('winston');

var PROPS = {
  HOME_CMD: 'echo $HOME',
  EMPTY_MSG: 'no .files for linking.',
  FILE_REGEXP: /\.link$/,
  FILE_SUFFIX: '.link'
},
    options = {
  name: ' DotFiles',
  description: 'sets up symlinks for global dotfiles',
  exec: function exec(resolve) {
    var $HOME = shell.exec(PROPS.HOME_CMD, {
      silent: true
    }).stdout.trim(),
        dotFiles = shell.find('.').filter(function (file) {
      return file.match(PROPS.FILE_REGEXP);
    });

    if (dotFiles.length > 0) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = dotFiles[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _dotFile = _step.value;

          var source = process.cwd() + '/' + _dotFile;
          var basename = _dotFile;
          if (basename.indexOf('/') !== -1) basename = basename.substr(basename.lastIndexOf('/') + 1);
          basename = basename.replace(PROPS.FILE_SUFFIX, '');
          var destination = $HOME + '/.' + basename;

          if (shell.test('-L', destination)) {
            if (shell.test('-f', destination)) {
              shell.cat(destination).to(destination + '.bak');

              if (!shell.error()) winston.info('successfully backed up to ' + destination + '.bak');

              shell.rm(destination);
            } else if (shell.test('-d', destination)) {
              shell.rm(destination + '.bak');
              shell.mv('' + destination, destination + '.bak');

              if (!shell.error()) winston.info('successfully moved dir to ' + destination + '.bak/');
            }
          }

          shell.ln('-sf', source, destination);
          if (!shell.error()) {
            winston.success('linked ' + source + ' to ' + destination);
          } else {
            winston.error('unable to link ' + basename + ' to ' + destination);
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