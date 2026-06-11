import { Bookmark, BookmarkFolder, BookmarkNode } from '@/types/bookmark.type';
import { FirefoxBookmarkNode, FirefoxBookmarkRoot } from '@/types/firefox-bookmark.type';

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

    const bookmark: Bookmark = {
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

export const jsonBookmarkParser = (text: string): BookmarkFolder => {
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

  const data = parsed as Partial<FirefoxBookmarkRoot>;

  if (data.typeCode !== 2 || !Array.isArray(data.children)) {
    throw new Error('Missing Firefox bookmarks root node');
  }

  return parseBookmarkNode(data as FirefoxBookmarkRoot) as BookmarkFolder;
};
