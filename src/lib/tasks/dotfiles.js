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

          const truncated = {
            'source': source.replace(/\/$/,''),
            'destination': destination.replace(/\/$/,'')
          };

          if (shell.test('-L', destination)) {
            winston.log(`found symlink at ${destination}`);

            if (shell.test('-f', destination)) {
              // F I L E    L I N K
              // .cat() and .to() breaks symlink and creates simple backup
              shell.cat(destination)
                .to(`${destination}.bak`);

              if (!shell.error())
                winston.info(`FILE successfully backed up to ${destination}.bak`)

              shell.rm(destination);
            } else if (shell.test('-d', destination)) {
              // D I R    L I N K
              // remove old backup, mkdir backup dir, copy contents to backup, rm
              let errs = false;
              shell.rm('-rf', `${destination}.bak`);
              if (shell.error()) {
                errs = true || errs;
                winston.error('failed to remove .bak');
              }

              shell.mkdir(`${destination}.bak`);
              if (shell.error()) {
                errs = true || errs;
                winston.error('failed to make .bak')
              }

              shell.cp('-RfL', `${destination}/**/*`, `${destination}.bak`);
              if (shell.error()) {
                errs = true || errs;
                winston.error('failed to cp into .bak');
              }

              if (!errs) {
                winston.info(`DIR successfully backed-up to ${destination}.bak/`)
              }

              shell.rm('-rf', destination);
              if (shell.error()) {
                winston.error(`Failed to delete ${destination}`)
              }
            } else {
              // Safety failed, kill the offending file
              shell.rm('-rf', destination);
            }
          } else {
            if (shell.test('-d', destination)) {
              winston.info(`non-symbolic directory at ${destination}`);
              winston.info(`cp -r ${truncated.destination}/* into ${truncated.source}`)
              shell.cp('-r', `${truncated.destination}/*`, truncated.source);
              if (!shell.error()) {
                winston.success(`copied existing files from ${destination} into ${source}`);
                shell.rm('-rf', truncated.destination);
                winston.success('symlink ready!!');
              } else {
                winston.error(`couldn't copy existing files`);
                winston.info(`manually move it yourself`);
              }
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
