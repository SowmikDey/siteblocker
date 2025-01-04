/*global chrome*/
const { hostname } = new URL(window.location.href);

// Function to replace webpage content with a blocked message
function replaceContent() {
  document.body.innerHTML = `
    <div style="display: flex; align-items: center; background-color:#36454f; justify-content: center; height: 100vh;">
      <h1>You're Not Allowed To Visit This Website!<br/> Change the extension settings to visit this website</h1>
    </div>
  `;
}

// Send a message to the background script to check if the site is blocked
chrome.runtime.sendMessage({ type: 'isSiteBlocked', hostname }, (isBlocked) => {
  if (isBlocked) {
    replaceContent();
  }
});
