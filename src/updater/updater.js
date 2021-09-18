import { Gitter } from './gitter.js';
import { Rebuilder } from './rebuilder.js';
import { RealClock } from './timer.js';

export class Updater {
  static defaultCronTimeout = 30 * 1000; // 30 seconds
  static defaultProcessTimeout = 7 * 24 * 60 * 60 * 1000; // 7 days

  rebuilding = false;
  interval = undefined;

  constructor(options) {
    this.timeKeeper = options?.timeKeeper ?? RealClock;
    this.gitter = options?.gitter ?? new Gitter();
    this.rebuilder = options?.rebuilder ?? new Rebuilder(this.gitter);
    this.startedAt = this.timeKeeper.now();
    this.cronTimeout = options?.cronTimeout ?? Updater.defaultCronTimeout;
    this.processTimeout = options?.processTimeout ?? Updater.defaultProcessTimeout;
  }

  async run() {
    if (this.rebuilding) {
      return;
    }

    let shouldRestart = this.age() >= this.processTimeout;

    if (!shouldRestart) {
      try {
        shouldRestart = await this.gitter.hasChanged();
      } catch (err) {
        // git/network unavailable, swallow error
        shouldRestart = false;
      }

      if (this.rebuilding) {
        return;
      }
    }

    if (shouldRestart) {
      this.clear();
      this.rebuilding = true;
      await this.rebuilder.run();
    }
  }

  clear() {
    if (this.interval !== undefined) {
      this.timeKeeper.clearCron(this.interval);
    }
    this.interval = undefined;
  }
  isRunning() {
    return this.interval !== undefined;
  }
  cron() {
    this.clear();
    this.interval = this.timeKeeper.setCron(() => this.run(), this.cronTimeout);
  }
  age() {
    return this.timeKeeper.now() - this.startedAt;
  }
}
