import { BookmarkEntry, BookmarkFolder, BookmarkNode } from '@/types/bookmark.type';
import { ParserOptions } from '@/types/parser-options';
import { flattenBookmark } from '@/utils/flatten-bookmark';

type HtmlNodeKind = 'bookmark' | 'folder' | 'description';

interface HtmlActiveNode {
  kind: HtmlNodeKind;
  attrs: Record<string, string>;
  text: string;
  parentFolder: BookmarkFolder;
}

const decodeHtmlEntities = (text: string): string =>
  text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 10)));

const normalizeText = (text: string): string => decodeHtmlEntities(text).replace(/\s+/g, ' ').trim();

const createAttributes = (source: string): Record<string, string> => {
  const attributes: Record<string, string> = {};

  const attributePattern = /([A-Za-z_:][A-Za-z0-9_:\-\.]*)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

  let match: RegExpExecArray | null;

  while ((match = attributePattern.exec(source))) {
    const value = match[3] ?? match[4] ?? match[5] ?? '';
    const key = match[1].toLowerCase();

    attributes[key] = decodeHtmlEntities(value);
  }

  return attributes;
};

const createFolder = (
  id: string,
  name: string,
  attrs: Record<string, string>,
  parent?: BookmarkFolder,
): BookmarkFolder => {
  const folder: BookmarkFolder = {
    type: 'folder',
    id,
    name,
    children: [],
    prevNode: parent,
  };

  if (attrs.add_date) folder.addDate = attrs.add_date;
  if (attrs.last_modified) folder.lastModified = attrs.last_modified;
  if (attrs.description) folder.description = attrs.description;

  return folder;
};

const createBookmark = (
  id: string,
  name: string,
  attrs: Record<string, string>,
  parent?: BookmarkFolder,
): BookmarkEntry => {
  const bookmark: BookmarkEntry = {
    type: 'bookmark',
    id,
    name,
    url: attrs.href ?? '',
    prevNode: parent,
  };

  if (attrs.add_date) bookmark.addDate = attrs.add_date;
  if (attrs.last_modified) bookmark.lastModified = attrs.last_modified;
  if (attrs.description) bookmark.description = attrs.description;

  const iconUri = attrs.icon_uri ?? attrs.icon;
  if (iconUri) bookmark.iconUri = iconUri;

  return bookmark;
};

const parseTag = (token: string): { name: string; attrs: Record<string, string> } | null => {
  const match = token.match(/^<\s*([A-Za-z0-9:-]+)([\s\S]*?)\/?>$/);

  if (!match) return null;

  return {
    name: match[1].toLowerCase(),
    attrs: createAttributes(match[2] ?? ''),
  };
};

export const htmlBookmarkParser = (text: string, options?: ParserOptions): BookmarkNode[] => {
  if (typeof text !== 'string') {
    throw new Error('Input must be a string');
  }

  const root: BookmarkFolder = {
    type: 'folder',
    id: 'root',
    name: '',
    children: [],
  };

  const folderStack: BookmarkFolder[] = [root];

  const tokens = text.match(/<!--[\s\S]*?-->|<!doctype[\s\S]*?>|<\/?[A-Za-z][^>]*>|[^<]+/gi) ?? [];

  let activeNode: HtmlActiveNode | null = null;

  let pendingFolder: BookmarkFolder | null = null;

  let nextId = 0;

  const createNodeId = (): string => String(++nextId);

  const finishActiveNode = (): void => {
    if (!activeNode) return;

    const parent = activeNode.parentFolder;
    const textValue = normalizeText(activeNode.text);

    if (!textValue) {
      activeNode = null;
      return;
    }

    switch (activeNode.kind) {
      case 'bookmark': {
        const bookmark = createBookmark(createNodeId(), textValue, activeNode.attrs, parent);
        parent.children.push(bookmark);
        break;
      }

      case 'folder': {
        const folder = createFolder(createNodeId(), textValue, activeNode.attrs, parent);

        parent.children.push(folder);

        // Wait for the following <DL>
        pendingFolder = folder;

        break;
      }

      case 'description': {
        const last = parent.children[parent.children.length - 1];

        if (last) {
          last.description = textValue;
        }

        break;
      }
    }

    activeNode = null;
  };

  for (const token of tokens) {
    if (/^<!doctype/i.test(token) || /^<!--/.test(token)) {
      continue;
    }

    if (token.startsWith('</')) {
      const tagName = token.slice(2, token.indexOf('>')).trim().toLowerCase();

      if (tagName === 'a' || tagName === 'h3' || tagName === 'dd') {
        finishActiveNode();
      }

      if (tagName === 'dl' && folderStack.length > 1) {
        folderStack.pop();
      }

      continue;
    }

    if (token.startsWith('<')) {
      const parsed = parseTag(token);

      if (!parsed) continue;

      if (parsed.name === 'dl') {
        if (pendingFolder) {
          folderStack.push(pendingFolder);
          pendingFolder = null;
        }

        continue;
      }

      if (parsed.name === 'a' || parsed.name === 'h3' || parsed.name === 'dd') {
        finishActiveNode();

        activeNode = {
          kind: parsed.name === 'a' ? 'bookmark' : parsed.name === 'h3' ? 'folder' : 'description',
          attrs: parsed.attrs,
          text: '',
          parentFolder: folderStack[folderStack.length - 1],
        };
      }

      continue;
    }

    if (activeNode) {
      activeNode.text += token;
    }
  }

  finishActiveNode();

  if (options?.flatten) {
    return flattenBookmark(root.children, {
      setPrevNode: options.setPrevNode,
    });
  }

  return root.children;
};
