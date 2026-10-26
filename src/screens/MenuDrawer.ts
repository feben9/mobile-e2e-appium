import { $ } from '@wdio/globals';
import { byAccessibilityId } from '../support/selectors';
import { Screen } from './Screen';

const LOG_IN = 'Login Menu Item';
const LOG_OUT = 'Logout Menu Item';

/** The side menu. Its last entry is "Log In" or "Log Out" depending on the session. */
class MenuDrawer extends Screen {
  protected get anchor() {
    return $(byAccessibilityId('Recycler view for menu'));
  }

  get logInItem() {
    return $(byAccessibilityId(LOG_IN));
  }

  get logOutItem() {
    return $(byAccessibilityId(LOG_OUT));
  }

  async openCatalog(): Promise<void> {
    await (await this.reveal({ text: 'Catalog' })).click();
  }

  async chooseLogIn(): Promise<void> {
    await (await this.reveal({ accessibilityId: LOG_IN })).click();
  }

  async chooseLogOut(): Promise<void> {
    await (await this.reveal({ accessibilityId: LOG_OUT })).click();
  }
}

export const menu = new MenuDrawer();
