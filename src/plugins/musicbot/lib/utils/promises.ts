export function waitForMS(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function raceWithTimeout(promise: Promise<unknown>, timeout: number) {
  return Promise.race([promise, waitForMS(timeout)]);
}
