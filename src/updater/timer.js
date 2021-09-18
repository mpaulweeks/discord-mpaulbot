export const RealClock = {
  now: () => new Date().getTime(),
  setCron: (cb, ms) => setInterval(cb, ms),
  clearCron: (id) => clearInterval(id),
};
