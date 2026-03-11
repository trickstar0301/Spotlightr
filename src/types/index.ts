export interface Workspace {
  id: string;
  name: string;
  path: string;
  isFavorite: boolean;
  icon?: string; // Custom string or emoji
  iconPath?: string; // Original path for image files
}
