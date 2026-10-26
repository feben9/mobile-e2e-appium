import { $ } from '@wdio/globals';
import { byResourceId } from '../support/selectors';
import { Screen } from './Screen';

/** A standard Android alert, e.g. the "Log Out" confirmation. */
class AlertDialog extends Screen {
  protected get anchor() {
    return $(byResourceId('android:id/message'));
  }

  get message() {
    return this.anchor;
  }

  async confirm(): Promise<void> {
    await $(byResourceId('android:id/button1')).click();
    await this.waitForIsShown(false);
  }

  async cancel(): Promise<void> {
    await $(byResourceId('android:id/button2')).click();
    await this.waitForIsShown(false);
  }
}

export const alertDialog = new AlertDialog();
