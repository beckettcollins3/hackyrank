/**
 * Tiny micro-haptic helper. Uses navigator.vibrate where supported (most
 * Android Chrome; iOS Safari ignores it gracefully). Patterns are short
 * enough that they read as a tactile "tick" rather than a long buzz.
 *
 * On Capacitor iOS builds, you can swap this for @capacitor/haptics later
 * without changing call sites.
 */
const can = () => typeof navigator !== "undefined" && typeof navigator.vibrate === "function";

export function tap() {
  if (can()) navigator.vibrate(8);
}

export function light() {
  if (can()) navigator.vibrate(12);
}

export function pop() {
  if (can()) navigator.vibrate([10, 30, 10]);
}

export function success() {
  if (can()) navigator.vibrate([6, 40, 12, 40, 18]);
}
