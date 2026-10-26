import { expect } from '@wdio/globals';
import { users } from '../src/data/users';
import { catalog } from '../src/screens/CatalogScreen';
import { header } from '../src/screens/HeaderBar';
import { login } from '../src/screens/LoginScreen';
import { menu } from '../src/screens/MenuDrawer';
import { startFresh } from '../src/workflows/app';
import { openLoginFromMenu } from '../src/workflows/auth';

describe('Login', () => {
  beforeEach(async () => {
    await startFresh();
    await openLoginFromMenu();
  });

  it('signs in the standard user and offers Log Out in the menu', async () => {
    await login.logIn(users.standard);

    await catalog.waitForIsShown();
    await header.openMenu();
    await menu.waitForIsShown();
    await expect(menu.logOutItem).toBeDisplayed();
    await expect(menu.logInItem).not.toBeDisplayed();
  });

  // Each row is one way the form can be wrong, and the message the user should see.
  const rejected = [
    {
      title: 'asks for a username when it is missing',
      user: { username: '', password: users.standard.password },
      field: 'username',
      message: 'Username is required',
    },
    {
      title: 'asks for a password when it is missing',
      user: { username: users.standard.username, password: '' },
      field: 'password',
      message: 'Enter Password',
    },
    {
      title: 'refuses the locked-out user',
      user: users.lockedOut,
      field: 'password',
      message: 'Sorry this user has been locked out.',
    },
  ] as const;

  for (const { title, user, field, message } of rejected) {
    it(title, async () => {
      await login.logIn(user);

      const error = field === 'username' ? login.usernameError : login.passwordError;
      await expect(error).toHaveText(message);

      // The form stays put and the session stays signed out.
      await login.waitForIsShown();
      await header.openMenu();
      await menu.waitForIsShown();
      await expect(menu.logInItem).toBeDisplayed();
    });
  }
});
