/**
 * Money is compared in whole cents.
 *
 * The app renders prices from Java doubles ("$ 29.99", "$5.99"). Parsing the
 * text with parseFloat and adding the results would bring binary rounding into
 * the expected totals, so amounts are read digit by digit into integers. The
 * pattern is strict on purpose: an unformatted double such as
 * "$ 45.970000000000006" is a defect and should fail the test, not be rounded
 * away.
 */
const AMOUNT = /^\$\s?(\d+)(?:\.(\d{1,2}))?$/;

export function toCents(label: string): number {
  const match = AMOUNT.exec(label.trim());
  if (!match) {
    throw new Error(`"${label}" is not a dollar amount with at most two decimals`);
  }
  const [, dollars, fraction = ''] = match;
  return Number(dollars) * 100 + Number(fraction.padEnd(2, '0'));
}

/** For readable assertion messages: 4597 -> "$45.97". */
export function formatCents(cents: number): string {
  return `$${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`;
}

export interface PricedLine {
  unitPriceCents: number;
  quantity: number;
}

export function lineTotal(line: PricedLine): number {
  return line.unitPriceCents * line.quantity;
}

export function sumLines(lines: PricedLine[]): number {
  return lines.reduce((total, line) => total + lineTotal(line), 0);
}
