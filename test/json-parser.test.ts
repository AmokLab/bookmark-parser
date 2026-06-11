import { describe, expect, it, test } from 'vitest';

import firefoxSample from '../sample/firefox-sample.json?raw';
import { BookmarkFolder, jsonBookmarkParser } from '../src/index';

describe('jsonBookmarkParser', () => {
  const parsed = jsonBookmarkParser(firefoxSample);
  it('parses a Firefox bookmarks export', () => {
    expect(parsed).toMatchObject({
      type: 'folder',
      name: '',
      children: [
        { type: 'folder', name: 'menu' },
        { type: 'folder', name: 'toolbar' },
        { type: 'folder', name: 'unfiled' },
        { type: 'folder', name: 'mobile' },
      ],
    });

    const toolbar = parsed.children[1] as BookmarkFolder;
    expect(toolbar.children[0]).toMatchObject({
      type: 'bookmark',
      name: 'Google',
      url: 'https://www.google.com/?zx=1781208870868',
    });

    expect(toolbar.children[1]).toMatchObject({
      type: 'folder',
      name: 'dev',
    });

    const devFolder = toolbar.children[1] as BookmarkFolder;
    expect(devFolder.children[0]).toMatchObject({
      type: 'bookmark',
      name: 'GitHub · Change is constant. GitHub keeps you ahead. · GitHub',
      url: 'https://github.com/',
    });
    expect(devFolder.children[1]).toMatchObject({
      type: 'folder',
      name: 'product',
    });

    const productFolder = devFolder.children[1] as BookmarkFolder;
    expect(productFolder.children[0]).toMatchObject({
      type: 'bookmark',
      name: 'Product Hunt – The best new products in tech.',
      url: 'https://www.producthunt.com/',
    });
    const emptyFolder = productFolder.children[1] as BookmarkFolder;
    expect(emptyFolder).toMatchObject({
      type: 'folder',
      name: 'empty-folder',
    });

    expect(emptyFolder.children).toHaveLength(0);
  });

  test('snapshots', () => {
    expect(parsed).toMatchSnapshot();
  });
});
