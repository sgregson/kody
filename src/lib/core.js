const fs  = require('fs'),
  winston = require('winston'),
  shell   = require('shelljs'),
  YAML    = require('yamljs');

let rc;
try {
  rc = JSON.parse(fs.readFileSync(`${process.cwd()}/.kodyrc`, 'utf-8'));
} catch (err1) {
  try {
    rc = YAML.parse(fs.readFileSync(`${process.cwd()}/kodyrc.yml`, 'utf-8'));
  } catch (err2) {
    throw Error('Error: could not find .kodyrc or kodyrc.yml file');
  }
}

const defaults    = {
  name: 'Generic task',
  exec: () => winston.info('running')
};

class KodyTask {
  constructor(opts = defaults) {
    this.name = opts.name;
    this.exec = opts.exec;
  }
  run() {
    return new Promise((resolve, reject) => {
      winston.info(`Running ${this.name}`);
      if (this.exec && typeof this.exec === 'function')
        this.exec(resolve, reject, shell, winston, rc);
    });
  }
}

exports.KodyTask = KodyTask;
