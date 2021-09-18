
export class BotUtil {
  static secondsToDisplay(rawSeconds) {
    const seconds = rawSeconds % 60;
    const minutes = Math.floor(rawSeconds / 60) % 60;
    const hours = Math.floor(rawSeconds / 3600);

    const ss = seconds.toString().padStart(2, '0');
    const mm = minutes.toString().padStart(2, '0');
    const hh = hours.toString().padStart(2, '0');

    if (hours) {
      return [hh, mm, ss].join(':');
    }
    return [mm, ss].join(':');
  }
}
