import { BookmarkEntry, BookmarkFolder, BookmarkNode } from '@/types/bookmark.type';
import { ParserOptions } from '@/types/parser-options';

type FlattenedBookmarkOptions = Omit<ParserOptions, 'flatten'>;

const copyFolderMetadata = (
  folder: BookmarkFolder,
  folderCache: WeakMap<BookmarkFolder, BookmarkFolder>,
  options?: FlattenedBookmarkOptions,
): BookmarkFolder => {
  const cachedFolder = folderCache.get(folder);

  if (cachedFolder) {
    return cachedFolder;
  }

  const previousFolder = folder.prevNode ? copyFolderMetadata(folder.prevNode, folderCache, options) : undefined;
  const flattenedFolder: BookmarkFolder = {
    type: 'folder',
    id: folder.id,
    name: folder.name,
    children: [],
  };
  folder.addDate = folder.addDate ?? folder.addDate;
  folder.lastModified = folder.lastModified ?? folder.lastModified;
  folder.description = folder.description ?? folder.description;

  if (previousFolder) {
    flattenedFolder.prevNode = options?.setPrevNode ? options.setPrevNode(previousFolder) : previousFolder;
  }

  folderCache.set(folder, flattenedFolder);

  return flattenedFolder;
};

const copyBookmark = (
  bookmark: BookmarkEntry,
  folderCache: WeakMap<BookmarkFolder, BookmarkFolder>,
  options?: FlattenedBookmarkOptions,
): BookmarkEntry => {
  const flattenedBookmark: BookmarkEntry = {
    type: 'bookmark',
    id: bookmark.id,
    name: bookmark.name,
    url: bookmark.url,
  };
  flattenedBookmark.addDate = bookmark.addDate ?? bookmark.addDate;
  flattenedBookmark.lastModified = bookmark.lastModified ?? bookmark.lastModified;
  flattenedBookmark.description = bookmark.description ?? bookmark.description;
  flattenedBookmark.iconUri = bookmark.iconUri ?? bookmark.iconUri;
  flattenedBookmark.icon = bookmark.icon ?? bookmark.icon;

  if (bookmark.prevNode) {
    flattenedBookmark.prevNode = copyFolderMetadata(bookmark.prevNode, folderCache, options);
  }

  return flattenedBookmark;
};

const flattenNode = (
  node: BookmarkNode,
  folderCache: WeakMap<BookmarkFolder, BookmarkFolder>,
  flattenedNodes: BookmarkNode[],
  options?: FlattenedBookmarkOptions,
): void => {
  if (node.type === 'folder') {
    flattenedNodes.push(copyFolderMetadata(node, folderCache, options));
    node.children.forEach((child) => flattenNode(child, folderCache, flattenedNodes, options));
    return;
  }

  flattenedNodes.push(copyBookmark(node, folderCache, options));
};

const flattenNodes = (
  nodes: BookmarkNode[],
  folderCache: WeakMap<BookmarkFolder, BookmarkFolder>,
  flattenedNodes: BookmarkNode[],
  options?: FlattenedBookmarkOptions,
): void => {
  nodes.forEach((node) => flattenNode(node, folderCache, flattenedNodes, options));
};

export const flattenBookmark = (nodes: BookmarkNode[], options?: FlattenedBookmarkOptions): BookmarkNode[] => {
  const flattenedNodes: BookmarkNode[] = [];
  const folderCache = new WeakMap<BookmarkFolder, BookmarkFolder>();

  flattenNodes(nodes, folderCache, flattenedNodes, options);

  return flattenedNodes;
};
