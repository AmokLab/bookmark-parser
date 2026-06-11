import { describe, expect, it } from 'vitest';
import chromeSample from '../sample/chrome-sample.html?raw';
import firefoxSample from '../sample/firefox-sample.html?raw';
import { BookmarkFolder, BookmarkNode, htmlBookmarkParser } from '../src/index';

const normalize = (node: BookmarkNode): BookmarkNode => {
  if (node.type === 'folder') {
    return {
      type: 'folder',
      name: node.name,
      children: (node.children || []).map(normalize),
    } as BookmarkFolder;
  }

  if (node.type === 'bookmark') {
    return {
      type: 'bookmark',
      name: node.name,
      description: node.description,
      url: node.url,
    } as BookmarkNode;
  }

  return node as BookmarkNode;
};

describe('htmlBookmarkParser', () => {
  const chromeParsed = htmlBookmarkParser(chromeSample);
  const firefoxParsed = htmlBookmarkParser(firefoxSample);

  const testParsedStructure = (parsed: BookmarkFolder) => {
    expect(parsed.type).toBe('folder');
    expect(parsed.name).toBe('');
    expect(parsed.children.length).toBe(1);
    const toolbar = parsed.children[0] as BookmarkFolder;
    expect(toolbar.type).toBe('folder');
    expect(toolbar.name).toBe('Bookmarks Toolbar');
    expect(toolbar.children.length).toBe(2);
    expect(toolbar.children[0].type).toBe('bookmark');
    expect(toolbar.children[0].name).toBe('Google');
    const devFolder = toolbar.children[1] as BookmarkFolder;
    expect(devFolder.type).toBe('folder');
    expect(devFolder.name).toBe('dev');
    expect(devFolder.children.length).toBe(2);
    expect(devFolder.children[0].type).toBe('bookmark');
    expect(devFolder.children[0].name).toBe('GitHub · Change is constant. GitHub keeps you ahead. · GitHub');

    const productFolder = devFolder.children[1] as BookmarkFolder;
    expect(productFolder.type).toBe('folder');
    expect(productFolder.name).toBe('product');
    expect(productFolder.children.length).toBe(2);
    expect(productFolder.children[0].type).toBe('bookmark');
    expect(productFolder.children[0].name).toBe('Product Hunt – The best new products in tech.');

    const emptyFolder = productFolder.children[1] as BookmarkFolder;
    expect(emptyFolder.type).toBe('folder');
    expect(emptyFolder.name).toBe('empty-folder');
    expect(emptyFolder.children.length).toBe(0);
  };

  it('parses Chrome and Firefox exports into equivalent structure', () => {
    const normalizedChrome = normalize(chromeParsed);
    expect(normalizedChrome).toMatchSnapshot();
    expect(normalize(firefoxParsed)).toEqual(normalize(chromeParsed));
  });

  it('parse chrome export correctly', () => {
    testParsedStructure(chromeParsed);
  });

  it('parse firefox export correctly', () => {
    testParsedStructure(firefoxParsed);
  });
});
