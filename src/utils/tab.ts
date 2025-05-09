/**
 * Utility functions for Chrome tab operations
 */
import { MatchType, PinnedTab } from "./types";
import { getDomain } from "./url";
import { getPinnedTabs } from "./storage";

/**
 * Opens all tabs in the pinned tabs list
 */
export async function openAllTabs(tabs: PinnedTab[]): Promise<void> {
  for (const tab of tabs) {
    // Check if the tab is already open
    const existingTabs = await chrome.tabs.query({
      url: tab.url,
      pinned: true,
    });

    // If the tab is already open, skip it
    if (existingTabs.length > 0) {
      continue;
    }

    // Open the tab and pin it
    await chrome.tabs.create({ url: tab.url, pinned: true });
  }
}

/**
 * Closes all pinned tabs in the current browser
 */
export async function closeAllPinnedTabs(): Promise<void> {
  const pinnedTabs = await chrome.tabs.query({ pinned: true });
  const userPinnedTabs = await getPinnedTabs();
  for (const tab of pinnedTabs) {
    if (tab.id && userPinnedTabs.some((userTab) => tabMatches(tab, userTab))) {
      await chrome.tabs.remove(tab.id);
    }
  }
}

/**
 * Checks if a tab matches another tab based on match type and pattern
 */
export function tabMatches(
  tab: chrome.tabs.Tab,
  pinnedTab: PinnedTab,
): boolean {
  const tabUrl = tab.url ?? "";

  if (pinnedTab.matchType === MatchType.EXACT_URL) {
    return tabUrl === pinnedTab.url;
  } else if (pinnedTab.matchType === MatchType.DOMAIN) {
    return getDomain(tabUrl) === getDomain(pinnedTab.url);
  } else if (pinnedTab.matchType === MatchType.REGEX) {
    try {
      // Use the custom regex pattern if available, otherwise use the URL
      const pattern = pinnedTab.regexPattern ?? pinnedTab.url;
      const regex = new RegExp(pattern);
      return regex.test(tabUrl);
    } catch (error) {
      console.error(
        `Invalid regex pattern: ${pinnedTab.regexPattern ?? pinnedTab.url}`,
        error,
      );
      return false;
    }
  }
  return false;
}

/**
 * Synchronizes pinned tabs based on the saved list
 */
export async function syncPinnedTabs(savedTabs: PinnedTab[]): Promise<void> {
  if (!savedTabs.length) {
    return;
  }

  // Get current tabs
  const currentTabs = await chrome.tabs.query({ pinned: true });

  for (const pinnedTab of savedTabs) {
    // Check if tab already exists based on match type
    const tabExists = currentTabs.some((tab) => tabMatches(tab, pinnedTab));

    // If tab doesn't exist, create it and pin it
    if (!tabExists) {
      try {
        await chrome.tabs.create({ url: pinnedTab.url, pinned: true });
      } catch (error) {
        console.error(`Error opening tab ${pinnedTab.url}:`, error);
      }
    }
  }
}
