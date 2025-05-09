import { getPinnedTabs } from "./utils/storage";
import { closeAllPinnedTabs, openAllTabs, syncPinnedTabs } from "./utils/tab";
import { ActionType } from "./utils/types";

// Handle browser startup or window creation
chrome.runtime.onStartup.addListener(() => {
  getPinnedTabs().then((savedTabs) => syncPinnedTabs(savedTabs));
  return true;
});

chrome.windows.onCreated.addListener(() => {
  getPinnedTabs().then((savedTabs) => syncPinnedTabs(savedTabs));
  return true;
});

// Listen for messages from popup/options
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.action === ActionType.SYNC_TABS) {
    getPinnedTabs().then((tabs) =>
      syncPinnedTabs(tabs).then(() => sendResponse({ success: true })),
    );

    return true; // Indicates async response
  }

  if (message.action === ActionType.OPEN_ALL_TABS) {
    getPinnedTabs().then((tabs) =>
      openAllTabs(tabs).then(() => sendResponse({ success: true })),
    );

    return true;
  }

  if (message.action === ActionType.CLOSE_ALL_TABS) {
    closeAllPinnedTabs().then(() => sendResponse({ success: true }));

    return true;
  }
});
