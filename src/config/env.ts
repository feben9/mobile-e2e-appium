import path from 'node:path';
import { APP } from './app';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');

function readString(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function readPort(name: string): number | undefined {
  const raw = readString(name);
  if (raw === undefined) return undefined;
  const port = Number(raw);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`${name} must be a port number, got "${raw}"`);
  }
  return port;
}

/**
 * Everything a run can be pointed at, read once from environment variables.
 * Defaults suit one local emulator and an Appium server on the usual port.
 */
export const env = {
  /** APK to install. Relative paths are resolved from the repository root. */
  appPath: path.resolve(repoRoot, readString('APP_PATH') ?? path.join('apps', APP.apkFileName)),
  /** Pin a specific device or emulator (`adb devices` serial). Optional with one device attached. */
  udid: readString('ANDROID_UDID'),
  appiumHost: readString('APPIUM_HOST') ?? '127.0.0.1',
  appiumPort: readPort('APPIUM_PORT') ?? 4723,
  /** UiAutomator2 server port. Set a distinct one per device when running devices side by side. */
  systemPort: readPort('ANDROID_SYSTEM_PORT'),
  /** Run only the specs that document open app defects (see tests/known-defects). */
  knownDefects: process.env.KNOWN_DEFECTS === '1',
} as const;
