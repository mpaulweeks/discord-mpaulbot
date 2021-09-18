import simpleGit from 'simple-git';

export class Gitter {
  sg = simpleGit();

  async hasChanged() {
    await this.sg.fetch();
    const status = await this.sg.status();
    return status.behind > 0;
  }
  async hash() {
    const log = await this.sg.log();
    return log.latest?.hash ?? '???';
  }
  async pull() {
    await this.sg.pull();
  }
}
