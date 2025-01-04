/*global chrome*/
let activeTabId = null;
let restrictedSites = new Set();

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(["blockedSites", "isBlockerEnabled"], (data) => {
    const blockedSites = data.blockedSites || [];
    chrome.storage.sync.set({ blockedSites });
    restrictedSites = new Set(blockedSites.map(normalizeURL));

    if (data.isBlockerEnabled === undefined) {
      chrome.storage.sync.set({ isBlockerEnabled: true });
    }
  });
});




/*==== It'll fetch the blocked websites ====*/
chrome.storage.sync.get("blockedSites", (data) => {
  const blockedSites = data.blockedSites || [];
  blockedSites.forEach((site) => {
    restrictedSites.add(normalizeURL(site));
  });
});


/*=== It'll do the work of removing www. from the link to make it more generalized ===*/
function normalizeURL(url) {
  return url.replace(/^www\./i, "");
}

/*==== It'll get the domain of the URL ====*/
function getDomain(url) {
  try {
    const { hostname } = new URL(url);
    return normalizeURL(hostname);
  } catch (e)
   {
    console.log(e);
    return null;
  }
}

/*==== It'll check whether the domain is in the saved blocked sites then blocks it ====*/
function checkAndBlock(tab) {
  if (!tab.url) return; // Skip if no URL is available
  const domain = getDomain(tab.url);
  if (domain && restrictedSites.has(domain)) {
    const blockPageUrl = chrome.runtime.getURL("./BlockedPage.html");
    chrome.tabs.update(tab.id, { url: blockPageUrl });
  }
}


/*==== It'll keep a track of which tab is open ====*/
chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId, (tab) => {
    activeTabId = tabId;
    checkAndBlock(tab);
  });
});

// Listener for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tabId === activeTabId) {
    checkAndBlock(tab);
  }
});

/*==== It'll send message to the content.js whether website is blocked or not ====*/
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'isSiteBlocked') {
    chrome.storage.sync.get("blockedSites", ({ blockedSites = [] }) => {
      const isBlocked = blockedSites.includes(normalizeURL(message.hostname));
      sendResponse(isBlocked);
    });
    return true;
  }
});


chrome.storage.onChanged.addListener((changes) => {
  if (changes.blockedSites) {
    const updatedSites = changes.blockedSites.newValue || [];
    restrictedSites = new Set(updatedSites.map(normalizeURL));
  }
});

