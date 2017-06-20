/**
  * DotFiles - set up symlinks for dotfiles suffixed with .link
  * @license MIT
  * @author jh3y
*/

const shell = require('shelljs'),
  winston   = require('winston');

const PROPS     = {
    HOME_CMD   : 'echo $HOME',
    EMPTY_MSG  : 'no .files for linking.',
    FILE_REGEXP: /\.link$/,
    FILE_SUFFIX: '.link'
  },
  options = {
    name: ' DotFiles',
    default: true,
    description: 'sets up symlinks for global dotfiles',
    exec: function(resolve) {
      const $HOME  = shell.exec(PROPS.HOME_CMD, {
          silent: true
        }).stdout.trim(),
        dotFiles = shell.find('.')
          .filter(function(file) {
            return file.match(PROPS.FILE_REGEXP);
          });

      if (dotFiles.length > 0)
        for (const dotFile of dotFiles) {
          const source = `${process.cwd()}/${dotFile}`;
          let basename = dotFile;
          if (basename.indexOf('/') !== -1)
            basename = basename.substr(basename.lastIndexOf('/') + 1);
          basename = basename.replace(PROPS.FILE_SUFFIX, '');
          const destination = `${$HOME}/.${basename}`;

          if (shell.test('-L', destination)) {
            if (shell.test('-f', destination)) {
              shell.cat(destination)
                .to(`${destination}.bak`);

              if (!shell.error())
                winston.info(`successfully backed up to ${destination}.bak`)

              shell.rm(destination);
            } else if (shell.test('-d', destination)) {
              shell.rm(`${destination}.bak`);
              shell.mv(`${destination}`, `${destination}.bak`);

              if (!shell.error())
                winston.info(`successfully moved dir to ${destination}.bak/`)
            } else {
              // Safety failed, kill the offending file
              shell.rm('-rf', destination);
            }
          }

          shell.ln('-sf', source, destination);
          if (!shell.error()) {
            winston.success(`linked ${source} to ${destination}`);
          } else {
            winston.error(`unable to link ${basename} to ${destination}`);
          }
        }
      else
        winston.info(PROPS.EMPTY_MSG);
      resolve();
    }
  };

exports.options = options;
