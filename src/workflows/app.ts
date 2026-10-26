import { catalog } from '../screens/CatalogScreen';
import { restartApp } from '../support/app';

/** Cold-starts the app and waits for the catalog: empty cart, signed out, default sort. */
export async function startFresh(): Promise<void> {
  await restartApp();
  await catalog.waitForIsShown();
}
