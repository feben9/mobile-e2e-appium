import { $ } from '@wdio/globals';
import { byAccessibilityId, byResourceId } from '../support/selectors';
import { Screen } from './Screen';

export type SortOrder = 'nameAscending' | 'nameDescending' | 'priceAscending' | 'priceDescending';

const OPTION_LABELS: Record<SortOrder, string> = {
  nameAscending: 'Ascending order by name',
  nameDescending: 'Descending order by name',
  priceAscending: 'Ascending order by price',
  priceDescending: 'Descending order by price',
};

/** The "Sort by" dialog opened from the catalog header. */
class SortDialog extends Screen {
  protected get anchor() {
    return $(byResourceId('sortTV'));
  }

  async choose(order: SortOrder): Promise<void> {
    await $(byAccessibilityId(OPTION_LABELS[order])).click();
    await this.waitForIsShown(false);
  }
}

export const sortDialog = new SortDialog();
