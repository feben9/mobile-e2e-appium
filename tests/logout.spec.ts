import { expect } from '@wdio/globals';
import { users } from '../src/data/users';
import { alertDialog } from '../src/screens/AlertDialog';
import { catalog } from '../src/screens/CatalogScreen';
import { header } from '../src/screens/HeaderBar';
import { login } from '../src/screens/LoginScreen';
import { menu } from '../src/screens/MenuDrawer';
import { startFresh } from '../src/workflows/app';
import { logInFromMenu, logOut, startLogOut } from '../src/workflows/auth';

describe('Logout', () => {
  beforeEach(async () => {
    await startFresh();
    await logInFromMenu(users.standard);
  });

  it('asks for confirmation, then signs out and shows the login screen', async () => {
    await startLogOut();
    await expect(alertDialog.message).toHaveText('Are you sure you want to logout');

    await alertDialog.confirm();
    await login.waitForIsShown();
    await header.openMenu();
    await menu.waitForIsShown();
    await expect(menu.logInItem).toBeDisplayed();
  });

  it('keeps the session when the confirmation is cancelled', async () => {
    await startLogOut();
    await alertDialog.cancel();

    await catalog.waitForIsShown();
    await header.openMenu();
    await menu.waitForIsShown();
    await expect(menu.logOutItem).toBeDisplayed();
  });

  it('can sign straight back in after logging out', async () => {
    await logOut();
    await login.logIn(users.standard);

    await catalog.waitForIsShown();
    await header.openMenu();
    await menu.waitForIsShown();
    await expect(menu.logOutItem).toBeDisplayed();
  });
});
