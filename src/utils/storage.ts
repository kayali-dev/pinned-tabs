import { MatchType, PinnedTab, PinnedTabsState } from "./types";
import { tabMatches } from "./tab";

const STORAGE_KEY = "pinnedTabs";

export async function getPinnedTabs(): Promise<PinnedTab[]> {
  try {
    const data = await chrome.storage.local.get(STORAGE_KEY);
    const state: PinnedTabsState = data[STORAGE_KEY] ?? { tabs: [] };

    // Sort tabs by order if exists, otherwise by creation time
    return state.tabs.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      return a.createdAt - b.createdAt;
    });
  } catch (error) {
    console.error("Error retrieving pinned tabs", error);
    return [];
  }
}

export async function savePinnedTabs(tabs: PinnedTab[]): Promise<void> {
  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: { tabs } });
  } catch (error) {
    console.error("Error saving pinned tabs", error);
  }
}

export async function addPinnedTab(
  tab: chrome.tabs.Tab,
  matchType: MatchType,
  regexPattern?: string,
): Promise<void> {
  const tabs = await getPinnedTabs();

  // Create a new pinned tab object
  const pinnedTab: PinnedTab = {
    url: tab.url ?? "",
    title: tab.title ?? "Untitled Tab",
    favIconUrl: tab.favIconUrl,
    matchType,
    createdAt: Date.now(),
    order: tabs.length, // Set new tab to end of list
  };

  // If a regex pattern is provided, store it
  if (matchType === MatchType.REGEX && regexPattern) {
    pinnedTab.regexPattern = regexPattern;
  }

  // Check if tab already exists
  const existingTabIndex = tabs.findIndex(
    (existingTab) => existingTab.url === pinnedTab.url,
  );

  if (existingTabIndex >= 0) {
    // Update existing tab
    tabs[existingTabIndex] = {
      ...tabs[existingTabIndex],
      ...pinnedTab,
    };
    await savePinnedTabs(tabs);
  } else if (!tabExistsInList(tabs, pinnedTab)) {
    // Add new tab
    await savePinnedTabs([...tabs, pinnedTab]);
  }
}

// Helper function to check if a tab exists based on match type
function tabExistsInList(tabs: PinnedTab[], newTab: PinnedTab): boolean {
  return tabs.some((existingTab) => {
    // Create a chrome.tabs.Tab-like object from the PinnedTab for comparison
    const mockChromeTab = { url: newTab.url } as chrome.tabs.Tab;
    return tabMatches(mockChromeTab, existingTab);
  });
}

export async function removePinnedTab(url: string): Promise<void> {
  const tabs = await getPinnedTabs();
  const filteredTabs = tabs.filter((tab) => tab.url !== url);
  await savePinnedTabs(filteredTabs);
}

export async function updatePinnedTab(updatedTab: PinnedTab): Promise<void> {
  const tabs = await getPinnedTabs();
  const updatedTabs = tabs.map((tab) => {
    if (tab.url === updatedTab.url) {
      return { ...tab, ...updatedTab };
    }
    return tab;
  });

  await savePinnedTabs(updatedTabs);
}

// Update the order of tabs
export async function updateTabsOrder(orderedUrls: string[]): Promise<void> {
  const tabs = await getPinnedTabs();

  // Create a map to quickly look up tabs by URL
  const tabMap = new Map(tabs.map((tab) => [tab.url, tab]));

  // Create new array with updated order
  const orderedTabs: PinnedTab[] = [];

  // Process the ordered URLs and create tabs with explicit order
  orderedUrls.forEach((url, index) => {
    const tab = tabMap.get(url);
    if (tab) {
      orderedTabs.push({
        ...tab,
        order: index,
      });
    }
  });

  // Add any tabs that weren't in the ordered list (shouldn't happen, but just in case)
  const orderedUrlsSet = new Set(orderedUrls);
  const remainingTabs = tabs
    .filter((tab) => !orderedUrlsSet.has(tab.url))
    .map((tab, i) => ({
      ...tab,
      order: orderedTabs.length + i,
    }));

  await savePinnedTabs([...orderedTabs, ...remainingTabs]);
}
