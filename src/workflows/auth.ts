import type { User } from '../data/users';
import { alertDialog } from '../screens/AlertDialog';
import { catalog } from '../screens/CatalogScreen';
import { header } from '../screens/HeaderBar';
import { login } from '../screens/LoginScreen';
import { menu } from '../screens/MenuDrawer';

export async function openLoginFromMenu(): Promise<void> {
  await header.openMenu();
  await menu.waitForIsShown();
  await menu.chooseLogIn();
  await login.waitForIsShown();
}

/** Logs in from the side menu and waits for the catalog the app returns to. */
export async function logInFromMenu(user: User): Promise<void> {
  await openLoginFromMenu();
  await login.logIn(user);
  await catalog.waitForIsShown();
}

/** Starts a logout from the side menu and stops at the confirmation dialog. */
export async function startLogOut(): Promise<void> {
  await header.openMenu();
  await menu.waitForIsShown();
  await menu.chooseLogOut();
  await alertDialog.waitForIsShown();
}

export async function logOut(): Promise<void> {
  await startLogOut();
  await alertDialog.confirm();
  await login.waitForIsShown();
}
