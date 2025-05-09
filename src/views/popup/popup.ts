import { addPinnedTab } from "../../utils/storage";
import { ActionType, MatchType } from "../../utils/types";
import { createWildcardPattern, escapeRegExp } from "../../utils/url";
import { showButtonFeedback } from "../../utils/ui";

document.addEventListener("DOMContentLoaded", () => {
  // Get DOM elements
  const pinTabBtn = document.getElementById("pinTabBtn") as HTMLButtonElement;
  const openAllBtn = document.getElementById("openAllBtn") as HTMLButtonElement;
  const closeAllBtn = document.getElementById(
    "closeAllBtn",
  ) as HTMLButtonElement;
  const syncTabsBtn = document.getElementById(
    "syncTabsBtn",
  ) as HTMLButtonElement;
  const manageTabsBtn = document.getElementById(
    "manageTabsBtn",
  ) as HTMLButtonElement;
  const matchTypeRadios = document.querySelectorAll('input[name="matchType"]');
  const regexInputContainer = document.getElementById(
    "regexInputContainer",
  ) as HTMLDivElement;
  const regexInput = document.getElementById("regexInput") as HTMLInputElement;
  const wildcardBtn = document.getElementById(
    "wildcardBtn",
  ) as HTMLButtonElement;

  // Get the current tab to pre-populate the regex input
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0 && tabs[0].url) {
      // Pre-populate with escaped version of the URL
      regexInput.value = escapeRegExp(tabs[0].url);
    }
  });

  // Wildcard button click handler
  wildcardBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0 && tabs[0].url) {
        regexInput.value = createWildcardPattern(tabs[0].url);

        // Visual feedback using our utility function
        showButtonFeedback(
          wildcardBtn,
          "Pattern Set!",
          "Make Path Wildcard",
          1000,
          false,
        );
      }
    });
  });

  // Show/hide regex input field based on selected match type
  matchTypeRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      const inputElement = radio as HTMLInputElement;
      if (inputElement.value === "regex" && inputElement.checked) {
        regexInputContainer.style.display = "block";

        // Pre-populate with current tab URL if empty
        if (!regexInput.value.trim()) {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0 && tabs[0].url) {
              regexInput.value = escapeRegExp(tabs[0].url);
            }
          });
        }
      } else {
        regexInputContainer.style.display = "none";
      }
    });
  });

  // Pin current tab
  pinTabBtn.addEventListener("click", async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) {
      return;
    }

    const currentTab = tabs[0];

    // Get selected match type
    let selectedMatchTypeValue = "";
    matchTypeRadios.forEach((radio) => {
      const inputElement = radio as HTMLInputElement;
      if (inputElement.checked) {
        selectedMatchTypeValue = inputElement.value;
      }
    });

    // Convert the string value to the enum
    let selectedMatchType: MatchType;

    switch (selectedMatchTypeValue) {
      case MatchType.DOMAIN:
        selectedMatchType = MatchType.DOMAIN;
        break;
      case MatchType.REGEX:
        selectedMatchType = MatchType.REGEX;
        break;
      case MatchType.EXACT_URL:
      default:
        // Default to EXACT_URL
        selectedMatchType = MatchType.EXACT_URL;
    }

    // If regex is selected, use the custom pattern instead of the URL
    if (selectedMatchType === MatchType.REGEX && regexInput.value.trim()) {
      // Pass the regex pattern as a separate parameter
      await addPinnedTab(
        currentTab,
        selectedMatchType,
        regexInput.value.trim(),
      );
    } else {
      await addPinnedTab(currentTab, selectedMatchType);
    }

    // Flash success message using our utility function
    showButtonFeedback(pinTabBtn, "Tab Pinned!", "Pin Current Tab");
  });

  // Open all tabs
  openAllBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: ActionType.OPEN_ALL_TABS }, () => {
      window.close();
    });
  });

  // Close all pinned tabs
  closeAllBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: ActionType.CLOSE_ALL_TABS }, () => {
      window.close();
    });
  });

  // Sync tabs
  syncTabsBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: ActionType.SYNC_TABS }, () => {
      window.close();
    });
  });

  // Navigate to options page
  manageTabsBtn.addEventListener("click", async () => {
    chrome.runtime.openOptionsPage().then(
      () => {},
      () => {
        console.error("Failed to open options page");
      },
    );
  });
});
