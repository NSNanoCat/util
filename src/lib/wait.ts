/**
 * wait
 */
export function wait(delay = 1000) {
  return new Promise<void>((resolve) => setTimeout(resolve, delay));
}
