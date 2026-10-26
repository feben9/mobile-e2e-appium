import { $, driver } from '@wdio/globals';
import { APP } from '../config/app';
import { byResourceId } from './selectors';

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

/**
 * On a slow emulator, Android sometimes shows "<app> isn't responding" over
 * everything, usually for the home screen rather than the app under test. The
 * app is running behind it, but no test can see it. Taps "Wait" and reports
 * whether there was such a dialog.
 */
export async function dismissNotRespondingDialog(): Promise<boolean> {
  const wait = $(byResourceId('android:id/aerr_wait'));
  if (!(await wait.isExisting())) {
    return false;
  }
  await wait.click();
  return true;
}
