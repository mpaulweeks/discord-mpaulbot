import * as childProcess from 'child_process';
import * as util from 'util';

export class Rebuilder {
  constructor(gitter) {
    this.gitter = gitter;
  }

  async run() {
    // git pull
    console.log('Updater: git pull');
    await this.gitter.pull();

    // install and build new version
    console.log('Updater: npm install');
    await util.promisify(childProcess.exec)('npm install');

    // stop, forcing forever to reboot
    console.log(`Updater: stopping`);
    process.exit();
  }
}
