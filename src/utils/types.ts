export interface PinnedTab {
  id?: number;
  url: string;
  title: string;
  favIconUrl?: string;
  matchType: MatchType;
  createdAt: number;
  regexPattern?: string; // Optional regex pattern when matchType is REGEX
  order?: number; // Position in the sorted list
}

export enum MatchType {
  EXACT_URL = "exact_url",
  DOMAIN = "domain",
  REGEX = "regex",
}

export interface PinnedTabsState {
  tabs: PinnedTab[];
}

export enum ActionType {
  SYNC_TABS = "syncTabs",
  OPEN_ALL_TABS = "openAllTabs",
  CLOSE_ALL_TABS = "closeAllTabs",
}
