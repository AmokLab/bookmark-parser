import { BookmarkBase } from './bookmark.type';

interface FirefoxBookmarkBase extends Omit<BookmarkBase, 'addDate'> {
  title: string;
  dateAdded: number;
}

interface FirefoxBookmarkEntry extends FirefoxBookmarkBase {
  typeCode: 1;
  // type: 'text/x-moz-place';
  uri: string;
  iconUri?: string;
}
interface FirefoxBookmarkFolder extends FirefoxBookmarkBase {
  typeCode: 2;
  // type: 'text/x-moz-place-container';
  children?: FirefoxBookmarkNode[];
}

export type FirefoxBookmarkNode = FirefoxBookmarkEntry | FirefoxBookmarkFolder;
