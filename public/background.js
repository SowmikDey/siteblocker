/* global chrome */
let activeTabId = null;
let restrictedSites = new Set();
let isBlockerEnabled = true; // Default state

// On extension installation or update
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(["blockedSites", "isBlockerEnabled"], (data) => {
    const blockedSites = data.blockedSites || [];
    chrome.storage.sync.set({ blockedSites });
    restrictedSites = new Set(blockedSites.map(normalizeURL));

    if (data.isBlockerEnabled === undefined) {
      chrome.storage.sync.set({ isBlockerEnabled: true });
    } else {
      isBlockerEnabled = data.isBlockerEnabled;
    }
  });
});

// Fetch blocked websites and blocker state on load
chrome.storage.sync.get(["blockedSites", "isBlockerEnabled"], (data) => {
  const blockedSites = data.blockedSites || [];
  restrictedSites = new Set(blockedSites.map(normalizeURL));
  isBlockerEnabled = data.isBlockerEnabled ?? true;
});

// Normalize URL to remove "www."
function normalizeURL(url) {
  return url.replace(/^www\./i, "");
}

// Extract domain from a URL
function getDomain(url) {
  try {
    const { hostname } = new URL(url);
    return normalizeURL(hostname);
  } catch (e) {
    console.log(e);
    return null;
  }
}

// Check and block sites if blocker is enabled
function checkAndBlock(tab) {
  if (!isBlockerEnabled || !tab.url) return; // Skip if blocker is disabled
  const domain = getDomain(tab.url);
  if (domain && restrictedSites.has(domain)) {
    const blockPageUrl = chrome.runtime.getURL("./BlockedPage.html");
    chrome.tabs.update(tab.id, { url: blockPageUrl });
  }
}

// Track active tab changes
chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId, (tab) => {
    activeTabId = tabId;
    checkAndBlock(tab);
  });
});

// Track tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tabId === activeTabId) {
    checkAndBlock(tab);
  }
});

// Listen for changes to settings
chrome.storage.onChanged.addListener((changes) => {
  if (changes.blockedSites) {
    const updatedSites = changes.blockedSites.newValue || [];
    restrictedSites = new Set(updatedSites.map(normalizeURL));
  }

  if (changes.isBlockerEnabled) {
    isBlockerEnabled = changes.isBlockerEnabled.newValue;
  }
});
