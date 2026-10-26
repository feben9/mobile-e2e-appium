import { driver } from '@wdio/globals';
import { APP } from '../config/app';

/**
 * The only file that builds platform-specific locators.
 *
 * Screens say what they are looking for (a resource id, an accessibility id,
 * a visible text) and these helpers decide how that is found on the current
 * platform. Android is implemented. iOS has no resource ids, so an iOS port
 * would give screens accessibility ids where they differ and fill in the iOS
 * branches here; the screens and tests would not change shape.
 */

/** A single element described by one property, for helpers that scroll to it. */
export type Target = { id: string } | { accessibilityId: string } | { text: string };

/** A list element identified by its own id and visible text, e.g. a product title. */
export interface Anchor {
  id: string;
  text: string;
}

function isIOS(): boolean {
  return driver.isIOS;
}

function androidOnly(helper: string): void {
  if (isIOS()) {
    throw new Error(`${helper}() is not implemented for iOS yet`);
  }
}

/** Short ids ("loginBtn") belong to the app; fully qualified ones ("android:id/button1") pass through. */
function fullResourceId(id: string): string {
  return id.includes(':id/') ? id : `${APP.packageId}:id/${id}`;
}

/** Quotes a value as a Java string literal for UiSelector arguments. */
function javaString(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

/** Quotes a value as an XPath 1.0 literal, including values that contain both quote types. */
function xpathString(value: string): string {
  if (!value.includes('"')) return `"${value}"`;
  if (!value.includes("'")) return `'${value}'`;
  return `concat("${value.split('"').join(`", '"', "`)}")`;
}

function anchorXPath(anchor: Anchor): string {
  return `//*[@resource-id=${xpathString(fullResourceId(anchor.id))} and @text=${xpathString(anchor.text)}]`;
}

/** Content description on Android, accessibility identifier on iOS. */
export function byAccessibilityId(id: string): string {
  return `~${id}`;
}

export function byResourceId(id: string): string {
  if (isIOS()) {
    throw new Error(`iOS has no resource ids; give "${id}" an accessibility id instead`);
  }
  return `id=${fullResourceId(id)}`;
}

/** Exact visible text. */
export function byText(text: string): string {
  if (isIOS()) {
    return `-ios predicate string:label == ${javaString(text)}`;
  }
  return `android=new UiSelector().text(${javaString(text)})`;
}

export function locate(target: Target): string {
  if ('id' in target) return byResourceId(target.id);
  if ('accessibilityId' in target) return byAccessibilityId(target.accessibilityId);
  return byText(target.text);
}

/** Scrolls the screen's scrollable container until the target is on screen, then returns it. */
export function scrollIntoView(target: Target): string {
  androidOnly('scrollIntoView');
  let inner: string;
  if ('id' in target) {
    inner = `new UiSelector().resourceId(${javaString(fullResourceId(target.id))})`;
  } else if ('accessibilityId' in target) {
    inner = `new UiSelector().description(${javaString(target.accessibilityId)})`;
  } else {
    inner = `new UiSelector().text(${javaString(target.text)})`;
  }
  return `android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(${inner})`;
}

/**
 * An element that shares a parent with the anchor, e.g. the image of the
 * product tile whose title is "Sauce Labs Backpack".
 */
export function siblingOf(anchor: Anchor, siblingId: string): string {
  androidOnly('siblingOf');
  return `${anchorXPath(anchor)}/../*[@resource-id=${xpathString(fullResourceId(siblingId))}]`;
}

/**
 * The list row around the anchor, e.g. the cart row of a product: the
 * outermost ancestor that holds exactly one `rowKeyId` element. Look up the
 * row's other fields from there.
 *
 * Searching instead for the nearest ancestor that holds some row field (say a
 * "+" button) goes wrong when that field of this row is still below the fold:
 * the nearest match is then the whole list, and the lookups return the first
 * row's values.
 */
export function rowOf(anchor: Anchor, rowKeyId: string): string {
  androidOnly('rowOf');
  const key = xpathString(fullResourceId(rowKeyId));
  return `${anchorXPath(anchor)}/ancestor::*[count(.//*[@resource-id=${key}]) = 1][last()]`;
}

/** The screen's scrollable container, e.g. a list. */
export function byScrollable(): string {
  androidOnly('byScrollable');
  return 'android=new UiSelector().scrollable(true)';
}
