export interface BookmarkBase {
  id: string;
  name: string;
  addDate?: string;
  lastModified?: string;
  description?: string;
}

export interface BookmarkEntry extends BookmarkBase {
  type: 'bookmark';
  url: string;
  iconUri?: string;
  icon?: string;

  // only needed while building the tree
  prevNode?: BookmarkFolder;
}

export interface BookmarkFolder extends BookmarkBase {
  type: 'folder';
  children: BookmarkNode[];

  // only needed while building the tree
  prevNode?: BookmarkFolder;
}

export type BookmarkNode = BookmarkEntry | BookmarkFolder;
