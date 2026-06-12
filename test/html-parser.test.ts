import { describe, expect, it, test } from 'vitest';
import chromeSample from '../sample/chrome-sample.html?raw';
import firefoxSample from '../sample/firefox-sample.html?raw';
import { BookmarkFolder, BookmarkNode, htmlBookmarkParser } from '../src/index';

/* This method is used to keep only the structure of the parsed node */
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

const normalizeNodes = (nodes: BookmarkNode[]): BookmarkNode[] => {
  return nodes.map(normalize);
};

describe('htmlBookmarkParser', () => {
  const chromeParsed = htmlBookmarkParser(chromeSample);
  const firefoxParsed = htmlBookmarkParser(firefoxSample);

  const testParsedStructure = (parsed: BookmarkFolder[]) => {
    expect(parsed).toHaveLength(1);
    const toolbar = parsed[0] as BookmarkFolder;
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
    const normalizedChrome = normalizeNodes(chromeParsed);
    expect(normalizedChrome).toMatchSnapshot();
    expect(normalizeNodes(firefoxParsed)).toEqual(normalizedChrome);
  });

  it('parse chrome export correctly', () => {
    testParsedStructure(chromeParsed);
  });

  it('parse firefox export correctly', () => {
    testParsedStructure(firefoxParsed);
  });

  test('flatten snapshots', () => {
    const chromeParsed = htmlBookmarkParser(chromeSample, {
      flatten: true,
      setPrevNode: (node: BookmarkFolder) => node.name ?? '',
    });
    expect(chromeParsed).toHaveLength(7);
    expect(JSON.stringify(chromeParsed, null, 2)).toMatchSnapshot();
  });
});
