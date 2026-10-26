import { catalog } from '../screens/CatalogScreen';
import { dismissNotRespondingDialog, restartApp } from '../support/app';

/** Cold-starts the app and waits for the catalog: empty cart, signed out, default sort. */
export async function startFresh(): Promise<void> {
  await restartApp();
  try {
    await catalog.waitForIsShown();
  } catch (error) {
    // Only a system "isn't responding" dialog earns a second look; anything
    // else is a real failure and is reported as it is.
    if (!(await dismissNotRespondingDialog())) {
      throw error;
    }
    await catalog.waitForIsShown();
  }
}
