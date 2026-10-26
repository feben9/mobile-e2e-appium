import { $, driver } from '@wdio/globals';
import type { ChainablePromiseElement } from 'webdriverio';
import { locate, scrollIntoView, type Target } from '../support/selectors';

/**
 * Base for screen objects. Each screen object works only the surface it is
 * named after; journeys across screens belong in src/workflows.
 */
export abstract class Screen {
  /** An element that is on screen only while this screen is in front. */
  protected abstract get anchor(): ChainablePromiseElement;

  async waitForIsShown(isShown = true): Promise<void> {
    await this.anchor.waitForDisplayed({ reverse: !isShown });
  }

  /**
   * Returns the element, scrolling it into view first when it is below the
   * fold. Call it once the screen is shown (see waitForIsShown).
   */
  protected async reveal(target: Target): Promise<WebdriverIO.Element> {
    const element = await $(locate(target)).getElement();
    if (await element.isDisplayed()) {
      return element;
    }
    return $(scrollIntoView(target)).getElement();
  }

  /** Replaces a field's text. An empty value clears the field. */
  protected async fill(id: string, value: string): Promise<void> {
    const field = await this.reveal({ id });
    if (value === '') {
      await field.clearValue();
    } else {
      await field.setValue(value);
    }
  }

  /** The keyboard can cover buttons near the bottom of a form. */
  protected async hideKeyboard(): Promise<void> {
    if (await driver.isKeyboardShown()) {
      await driver.hideKeyboard();
    }
  }
}
