import { BookmarkEntry, BookmarkFolder, BookmarkNode } from '@/types/bookmark.type';
import { FirefoxBookmarkNode } from '@/types/firefox-bookmark.type';
import { ParserOptions } from '@/types/parser-options';
import { flattenBookmark } from '@/utils/flatten-bookmark';

const toBookmarkDate = (value?: number | string): string | undefined => {
  if (typeof value !== 'number') {
    return undefined;
  }

  return String(value);
};

const parseBookmarkNode = (node: FirefoxBookmarkNode, parent?: BookmarkFolder): BookmarkNode => {
  if (node.typeCode === 1) {
    if (typeof node.uri !== 'string') {
      throw new Error('Invalid Firefox bookmark URL');
    }

    const bookmark: BookmarkEntry = {
      type: 'bookmark',
      id: String(node.id),
      name: node.title ?? '',
      url: node.uri,
      addDate: toBookmarkDate(node.dateAdded),
      lastModified: toBookmarkDate(node.lastModified),
    };

    if (typeof node.iconUri === 'string') {
      bookmark.iconUri = node.iconUri;
    }

    return bookmark;
  }

  const folder: BookmarkFolder = {
    type: 'folder',
    id: String(node.id),
    name: node.title ?? '',
    children: [],
    addDate: toBookmarkDate(node.dateAdded),
    lastModified: toBookmarkDate(node.lastModified),
  };
  if (parent) {
    folder.prevNode = parent;
  }
  folder.children = Array.isArray(node.children) ? node.children.map((child) => parseBookmarkNode(child, folder)) : [];
  return folder;
};

const parseBookmarkNodes = (nodes: FirefoxBookmarkNode[], parent?: BookmarkFolder): BookmarkNode[] => {
  return nodes.map((node) => parseBookmarkNode(node, parent));
};

export const jsonBookmarkParser = (text: string, options?: ParserOptions): BookmarkNode[] => {
  if (typeof text !== 'string') {
    throw new Error('Input must be a string');
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON input');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Parsed bookmark data is not an object');
  }

  const data = parsed as {
    children: FirefoxBookmarkNode[];
  };

  if (!Array.isArray(data.children)) {
    throw new Error('Missing Firefox bookmarks root node');
  }

  const result = parseBookmarkNodes(data.children);

  if (options?.flatten) {
    return flattenBookmark(result, {
      setPrevNode: options.setPrevNode,
    });
  }

  return result;
};
