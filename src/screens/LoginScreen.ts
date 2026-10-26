import { $ } from '@wdio/globals';
import type { User } from '../data/users';
import { byAccessibilityId, byResourceId } from '../support/selectors';
import { Screen } from './Screen';

class LoginScreen extends Screen {
  protected get anchor() {
    return $(byAccessibilityId('Tap to login with given credentials'));
  }

  get usernameError() {
    return $(byResourceId('nameErrorTV'));
  }

  /** Shows "Enter Password" for a missing password and the lock-out message for a locked user. */
  get passwordError() {
    return $(byResourceId('passwordErrorTV'));
  }

  /** Types the credentials as given (empty values stay empty) and taps Login. */
  async logIn(user: User): Promise<void> {
    await this.fill('nameET', user.username);
    await this.fill('passwordET', user.password);
    await this.hideKeyboard();
    await this.anchor.click();
  }
}

export const login = new LoginScreen();
