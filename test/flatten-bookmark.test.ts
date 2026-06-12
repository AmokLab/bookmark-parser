import { describe, expect, it } from 'vitest';

import { test } from 'vitest';
import firefoxSample from '../sample/firefox-sample.json?raw';
import { BookmarkFolder, flattenBookmark, jsonBookmarkParser } from '../src/index';

describe('flattenBookmark', () => {
  it('flattens the tree while keeping previous nodes shallow', () => {
    const parsed = jsonBookmarkParser(firefoxSample);
    const flattened = flattenBookmark(parsed);

    expect(parsed).toHaveLength(4);
    expect(flattened).toHaveLength(10);

    expect(flattened.every((node) => node.type === 'folder' || node.type === 'bookmark')).toBe(true);

    const toolbar = flattened.find((node): node is BookmarkFolder => node.type === 'folder' && node.name === 'toolbar');

    expect(toolbar).toBeDefined();
    expect(toolbar?.children).toHaveLength(0);

    const devFolder = flattened.find((node): node is BookmarkFolder => node.type === 'folder' && node.name === 'dev');

    expect(devFolder).toBeDefined();
    expect(devFolder?.children).toHaveLength(0);
  });

  it('use custom previous node to return name', () => {
    const parsed = jsonBookmarkParser(firefoxSample);
    const flattened = flattenBookmark(parsed, { setPrevNode: (node: BookmarkFolder) => node.name ?? '' });

    const devFolder = flattened.find((node) => node.id === '13');
    const productFolder = flattened.find((node) => node.id === '15');

    expect(devFolder?.prevNode).toBe('toolbar');
    expect(productFolder?.prevNode).toBe('dev');

    expect(JSON.stringify(flattened, null, 2)).toMatchSnapshot();
  });

  test('snapshots', () => {
    const flattened = flattenBookmark(jsonBookmarkParser(firefoxSample));
    expect(JSON.stringify(flattened, null, 2)).toMatchSnapshot();
  });
});
