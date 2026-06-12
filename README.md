# bookmark-parser

Zero dependency bookmark parser exports into a shared bookmark node array.

## Install

```bash
pnpm add @amoklab/bookmark-parser
```

## API

The package exports:

- `htmlBookmarkParser(text, options?)`
- `jsonBookmarkParser(text, options?)`
- `flattenBookmark(root, options?)`
- `BookmarkEntry`
- `BookmarkFolder`
- `BookmarkNode`
- `ParserOptions`

## Data model

All parsers return the same node shape:

- `BookmarkFolder` for folders
- `BookmarkEntry` for links
- `BookmarkNode` for either one

Folders keep their nested `children`. Both folders and bookmarks can keep a `prevNode` chain for tree navigation.
The parsers return only the export's bookmark children, not a synthetic root node.

## `jsonBookmarkParser`

Parses the Firefox JSON export format.

```ts
import { jsonBookmarkParser } from '@amoklab/bookmark-parser';

const bookmarks = jsonBookmarkParser(firefoxJsonText);
const flattened = jsonBookmarkParser(firefoxJsonText, {
  flatten: true,
});
```

The parser expects a Firefox bookmarks JSON export and returns the top-level bookmark nodes.

## `htmlBookmarkParser`

Parses Netscape bookmark HTML exports produced by both Chrome and Firefox.

```ts
import { htmlBookmarkParser } from '@amoklab/bookmark-parser';

const bookmarks = htmlBookmarkParser(bookmarksHtmlText);
const flattened = htmlBookmarkParser(bookmarksHtmlText, {
  flatten: true,
});
```

### Options

`ParserOptions` is accepted by the parsers:

```ts
export interface ParserOptions {
  flatten: boolean;
  setPrevNode: (node: BookmarkNode) => any;
}
```

- `flatten`: when `true`, parsers return a flattened bookmark array
- `setPrevNode`: optional hook that transforms the `prevNode` object used during parsing flattening

`flattenBookmark(root, options?)` accepts the `setPrevNode` hook only and still returns a flat preorder list.
