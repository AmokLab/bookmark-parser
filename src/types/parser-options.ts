import { BookmarkNode } from './bookmark.type';

export interface ParserOptions {
  flatten?: boolean;
  setPrevNode?: (node: BookmarkNode) => any;
}
