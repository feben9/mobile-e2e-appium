import { driver } from '@wdio/globals';
import { APP } from '../config/app';

/**
 * Kills and relaunches the app process.
 *
 * The app keeps the cart, the signed-in user and the sort order in memory, so a
 * cold start gives every test the same clean state. That is much faster than a
 * reinstall and leaves the product database in place.
 */
export async function restartApp(): Promise<void> {
  await driver.execute('mobile: terminateApp', { appId: APP.packageId });
  await driver.execute('mobile: activateApp', { appId: APP.packageId });
}
