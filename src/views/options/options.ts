import {
  getPinnedTabs,
  removePinnedTab,
  updatePinnedTab,
  updateTabsOrder,
} from "../../utils/storage";
import { ActionType, MatchType, PinnedTab } from "../../utils/types";
import { createWildcardPattern, escapeRegExp } from "../../utils/url";
import { createElement, showButtonFeedback } from "../../utils/ui";

document.addEventListener("DOMContentLoaded", async () => {
  // Set version information in the footer
  const versionElement = document.getElementById("version");
  if (versionElement) {
    // Get version from manifest
    fetch(chrome.runtime.getURL("manifest.json"))
      .then((response) => response.json())
      .then((manifest) => {
        versionElement.textContent = manifest.version ?? "1.0.0";
      })
      .catch((error) => {
        console.error("Error loading manifest:", error);
      });
  }

  // Set current year in the footer
  const yearElement = document.getElementById("current-year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear().toString();
  }

  // Get DOM elements
  const tabList = document.getElementById("tabList") as HTMLUListElement;
  const noTabsMessage = document.getElementById(
    "noTabsMessage",
  ) as HTMLDivElement;
  const openAllBtn = document.getElementById("openAllBtn") as HTMLButtonElement;
  const closeAllBtn = document.getElementById(
    "closeAllBtn",
  ) as HTMLButtonElement;
  const syncTabsBtn = document.getElementById(
    "syncTabsBtn",
  ) as HTMLButtonElement;

  // Track drag state
  let draggedItem: HTMLElement | null = null;

  // Load tabs
  await loadPinnedTabs();

  // Add event listeners for action buttons
  openAllBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: ActionType.OPEN_ALL_TABS });
  });

  closeAllBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: ActionType.CLOSE_ALL_TABS });
  });

  syncTabsBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: ActionType.SYNC_TABS });
  });

  // Load pinned tabs
  async function loadPinnedTabs() {
    const tabs = await getPinnedTabs();

    // Clear current list
    tabList.innerHTML = "";

    if (tabs.length === 0) {
      noTabsMessage.style.display = "block";
      return;
    }

    noTabsMessage.style.display = "none";

    // Add each tab to the list
    tabs.forEach((tab) => {
      const listItem = createTabListItem(tab);
      tabList.appendChild(listItem);
    });

    // Set up drag and drop after tabs are loaded
    setupDragAndDrop();
  }

  function setupItemDragAndDrop(item: HTMLElement) {
    item.setAttribute("draggable", "true");

    // Add drag handle for better UX
    const dragHandle = document.createElement("div");
    dragHandle.className = "drag-handle";
    dragHandle.innerHTML = "⋮"; // Vertical dots as drag indicator
    dragHandle.style.cursor = "grab";
    dragHandle.style.paddingRight = "10px";
    dragHandle.style.fontSize = "16px";
    dragHandle.style.color = "#999";
    dragHandle.style.display = "flex";
    dragHandle.style.alignItems = "center";

    item.insertBefore(dragHandle, item.firstChild);

    // Add event listeners for drag operations
    item.addEventListener("dragstart", (e) => {
      draggedItem = item;
      setTimeout(() => {
        item.style.opacity = "0.5";
      }, 0);

      // Set data transfer for Firefox compatibility
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/html", item.innerHTML);
      }
    });

    item.addEventListener("dragend", () => {
      if (draggedItem) {
        draggedItem.style.opacity = "1";
        draggedItem = null;
      }

      // Save the new order
      saveNewOrder();
    });

    item.addEventListener("dragover", (e) => {
      e.preventDefault();
      return false;
    });

    item.addEventListener("dragenter", (e) => {
      e.preventDefault();
      item.classList.add("drag-over");
    });

    item.addEventListener("dragleave", () => {
      item.classList.remove("drag-over");
    });

    item.addEventListener("drop", (e) => {
      e.preventDefault();
      item.classList.remove("drag-over");

      if (draggedItem && draggedItem !== item) {
        // Check if we're dropping before or after the target
        const rect = item.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        const isAfter = e.clientY > midpoint;

        if (isAfter) {
          item.parentNode?.insertBefore(draggedItem, item.nextSibling);
        } else {
          item.parentNode?.insertBefore(draggedItem, item);
        }
      }

      return false;
    });
  }

  // Set up drag and drop functionality
  function setupDragAndDrop() {
    const items = tabList.querySelectorAll(".tab-item");

    items.forEach((item) => setupItemDragAndDrop(item as HTMLElement));
  }

  // Save the new order to storage
  async function saveNewOrder() {
    const items = tabList.querySelectorAll(".tab-item");
    const orderedUrls: string[] = [];

    // Collect the URLs in their current order
    items.forEach((item) => {
      const url = item.getAttribute("data-url");
      if (url) {
        orderedUrls.push(url);
      }
    });

    // Update the storage with the new order
    await updateTabsOrder(orderedUrls);
  }

  // Create a list item for a pinned tab
  function createTabListItem(tab: PinnedTab): HTMLLIElement {
    // Create the main list item
    const listItem = createElement("li", {
      className: "tab-item",
      attributes: { "data-url": tab.url },
    });

    // Create favicon element
    const favicon = createElement("img", {
      className: "tab-favicon",
      attributes: { src: tab.favIconUrl ?? "icons/icon16.png" },
      eventListeners: [
        {
          type: "error",
          listener: () => {
            favicon.src = "icons/icon16.png";
          },
        },
      ],
    });

    // Create tab info container
    const tabInfo = createElement("div", {
      className: "tab-info",
      styles: {
        width: "400px",
        minWidth: "400px",
        maxWidth: "400px",
      },
    });

    const title = createElement("div", {
      className: "tab-title",
      textContent: tab.title,
    });

    const url = createElement("div", {
      className: "tab-url",
      textContent: tab.url,
      attributes: { title: tab.url },
      styles: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },
    });

    tabInfo.appendChild(title);
    tabInfo.appendChild(url);

    // Create tab options container
    const tabOptions = document.createElement("div");
    tabOptions.className = "tab-options";
    tabOptions.style.display = "flex";
    tabOptions.style.alignItems = "center";
    tabOptions.style.gap = "10px";

    // Options controls container
    const optionsControls = document.createElement("div");
    optionsControls.style.display = "flex";
    optionsControls.style.flexDirection = "column";
    optionsControls.style.gap = "5px";
    optionsControls.style.flex = "1";
    optionsControls.style.width = "250px";
    optionsControls.style.minWidth = "250px";
    optionsControls.style.maxWidth = "250px";

    // Match type selector container
    const matchTypeContainer = document.createElement("div");
    matchTypeContainer.style.width = "100%";

    // Match type selector
    const matchTypeSelect = document.createElement("select");
    matchTypeSelect.style.width = "100%";
    matchTypeSelect.style.padding = "5px";
    matchTypeSelect.style.marginBottom = "5px";

    const exactOption = document.createElement("option");
    exactOption.value = MatchType.EXACT_URL;
    exactOption.textContent = "Exact URL";
    exactOption.selected = tab.matchType === MatchType.EXACT_URL;

    const domainOption = document.createElement("option");
    domainOption.value = MatchType.DOMAIN;
    domainOption.textContent = "Domain Only";
    domainOption.selected = tab.matchType === MatchType.DOMAIN;

    const regexOption = document.createElement("option");
    regexOption.value = MatchType.REGEX;
    regexOption.textContent = "RegEx Pattern";
    regexOption.selected = tab.matchType === MatchType.REGEX;

    matchTypeSelect.appendChild(exactOption);
    matchTypeSelect.appendChild(domainOption);
    matchTypeSelect.appendChild(regexOption);

    matchTypeContainer.appendChild(matchTypeSelect);
    optionsControls.appendChild(matchTypeContainer);

    // Create regex input field and container
    const regexContainer = document.createElement("div");
    regexContainer.style.display =
      tab.matchType === MatchType.REGEX ? "flex" : "none";
    regexContainer.style.flexDirection = "column";
    regexContainer.style.gap = "8px";
    regexContainer.style.width = "100%";
    regexContainer.style.marginTop = "5px";
    regexContainer.style.marginBottom = "5px";

    const regexInput = document.createElement("input");
    regexInput.type = "text";
    regexInput.placeholder = "Modify this pattern - use .* for any characters";
    regexInput.value = tab.regexPattern ?? escapeRegExp(tab.url);
    regexInput.style.width = "100%";
    regexInput.style.padding = "5px";
    regexInput.style.boxSizing = "border-box";
    regexInput.style.backgroundColor = "#3a3a3c";
    regexInput.style.color = "#e4e4e4";
    regexInput.style.border = "1px solid #4a4a4c";
    regexInput.style.borderRadius = "4px";

    regexContainer.appendChild(regexInput);

    // Add helper text
    const helperText = document.createElement("small");
    helperText.style.display = "block";
    helperText.style.color = "#b4b4b4";
    helperText.textContent =
      "Example: https://example\\.com/path/?.* matches with or without trailing slash";
    regexContainer.appendChild(helperText);

    // Create button container
    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.gap = "5px";

    // Add save button
    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save Pattern";
    saveBtn.style.padding = "6px 10px";
    saveBtn.style.backgroundColor = "#4285f4";
    saveBtn.style.color = "white";
    saveBtn.style.border = "none";
    saveBtn.style.borderRadius = "4px";
    saveBtn.style.cursor = "pointer";
    saveBtn.style.flexGrow = "1";
    saveBtn.style.fontSize = "14px";
    saveBtn.disabled = true; // Initially disabled
    saveBtn.style.opacity = "0.6"; // Initially dim

    // Function to check if pattern has changed
    const checkPatternChanged = () => {
      const currentPattern = regexInput.value.trim();
      const originalPattern = tab.regexPattern ?? escapeRegExp(tab.url);
      const hasChanged = currentPattern !== originalPattern;

      // Enable/disable save button based on changes
      saveBtn.disabled = !hasChanged;
      saveBtn.style.opacity = hasChanged ? "1" : "0.6";
      saveBtn.style.cursor = hasChanged ? "pointer" : "not-allowed";
    };

    // Initial check
    checkPatternChanged();

    // Check when input changes
    regexInput.addEventListener("input", checkPatternChanged);

    saveBtn.addEventListener("click", async () => {
      // Get the new pattern
      const newPattern = regexInput.value.trim();

      // Update the tab with the new regex pattern
      const updatedTab: PinnedTab = {
        ...tab,
        regexPattern: newPattern,
        matchType: MatchType.REGEX, // Ensure matchType is set to REGEX when saving a pattern
      };

      // Save to storage
      await updatePinnedTab(updatedTab);

      // Option 2: Just update the local reference (faster but relies on accurate local state)
      tab.regexPattern = newPattern;
      tab.matchType = MatchType.REGEX;

      // Update the select element to reflect the change
      matchTypeSelect.value = MatchType.REGEX;

      // Update the button state
      checkPatternChanged();

      // Use our utility function for visual feedback
      showButtonFeedback(saveBtn, "Pattern Saved!", "Save Pattern", 1500, true);
    });

    // Add wildcard button
    const wildcardBtn = document.createElement("button");
    wildcardBtn.textContent = "Make Path Wildcard";
    wildcardBtn.style.padding = "6px 10px";
    wildcardBtn.style.backgroundColor = "#3a3a3c";
    wildcardBtn.style.color = "#e4e4e4";
    wildcardBtn.style.border = "1px solid #5a5a5c";
    wildcardBtn.style.borderRadius = "4px";
    wildcardBtn.style.cursor = "pointer";
    wildcardBtn.style.fontSize = "14px";

    wildcardBtn.addEventListener("click", () => {
      // Generate new wildcard pattern
      const wildcardPattern = createWildcardPattern(tab.url);
      regexInput.value = wildcardPattern;

      // Check if the pattern has changed and update save button state
      checkPatternChanged();

      // Visual feedback with our utility
      showButtonFeedback(
        wildcardBtn,
        "Pattern Set!",
        "Make Path Wildcard",
        1000,
        false,
      );
    });

    buttonContainer.appendChild(saveBtn);
    buttonContainer.appendChild(wildcardBtn);
    regexContainer.appendChild(buttonContainer);

    optionsControls.appendChild(regexContainer);

    // Update regex pattern when changed - now just checks for changes instead of autosaving
    regexInput.addEventListener("change", () => {
      checkPatternChanged();
    });

    // Show/hide regex input when match type changes
    matchTypeSelect.addEventListener("change", async () => {
      const newMatchType = matchTypeSelect.value as MatchType;
      regexContainer.style.display =
        newMatchType === MatchType.REGEX ? "flex" : "none";

      // If switching to regex and no regex pattern exists, create one from the URL
      if (newMatchType === MatchType.REGEX) {
        // If no regex pattern, create one from URL
        if (!tab.regexPattern) {
          regexInput.value = escapeRegExp(tab.url);
        }

        const patternToUse = regexInput.value.trim();

        // Update the tab with the match type and pattern
        const updatedTab: PinnedTab = {
          ...tab,
          matchType: newMatchType,
          regexPattern: patternToUse,
        };
        await updatePinnedTab(updatedTab);

        // Update local reference
        tab.matchType = newMatchType;
        tab.regexPattern = patternToUse;
      } else {
        // For non-regex types, just update the match type
        const updatedTab: PinnedTab = {
          ...tab,
          matchType: newMatchType,
        };
        await updatePinnedTab(updatedTab);

        // Update local reference
        tab.matchType = newMatchType;
      }

      // Update the UI after changes
      checkPatternChanged();
    });

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "button danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.style.alignSelf = "flex-start";
    deleteBtn.style.marginLeft = "15px";
    deleteBtn.style.padding = "6px 12px";
    deleteBtn.addEventListener("click", async () => {
      await removePinnedTab(tab.url);
      await loadPinnedTabs();
    });

    tabOptions.appendChild(optionsControls);
    tabOptions.appendChild(deleteBtn);

    // Add all elements to list item
    listItem.appendChild(favicon);
    listItem.appendChild(tabInfo);
    listItem.appendChild(tabOptions);

    return listItem;
  }
});
