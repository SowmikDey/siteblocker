/* global chrome */
import { useState, useEffect } from "react";
import "../index.css";

const Popup = () => {
  const [isBlockerEnabled, setBlockerEnabled] = useState(true);
  const [blockedSites, setBlockedSites] = useState([]);
  const [newSite, setNewSite] = useState("");

  useEffect(() => {
    chrome.storage.sync.get(["isBlockerEnabled", "blockedSites"], (result) => {
      setBlockerEnabled(result.isBlockerEnabled ?? true);
      setBlockedSites(result.blockedSites ?? []);
    });
  }, []);

  const toggleBlocker = () => {
    const newState = !isBlockerEnabled;
    setBlockerEnabled(newState);
    chrome.storage.sync.set({ isBlockerEnabled: newState });
  };

  const addBlockedSite = () => {
    if (newSite.trim() && !blockedSites.includes(newSite)) {
      const updatedSites = [...blockedSites, newSite];
      setBlockedSites(updatedSites);
      setNewSite("");
      chrome.storage.sync.set({ blockedSites: updatedSites });
    }
  };

  const removeBlockedSite = (site) => {
    const updatedSites = blockedSites.filter((s) => s !== site);
    setBlockedSites(updatedSites);
    chrome.storage.sync.set({ blockedSites: updatedSites });
  };

  return (
    <div className="flex flex-col items-center bg-slate-600 text-white w-[300px] h-screen p-4">
      <h1 className="text-center font-bold text-[20px]">Website Blocker</h1>

      <button
        onClick={toggleBlocker}
        className="bg-blue-500 p-3 mt-3 w-full rounded text-center hover:bg-blue-600"
      >
        {isBlockerEnabled ? "Blocker Enabled" : "Blocker Disabled"}
      </button>

      <div className="w-full mt-4">
        <h2 className="text-[15px] mb-2">Blocked Websites</h2>
        <div className="flex flex-col gap-2">
          {blockedSites.map((site, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-slate-700 text-white w-full p-2 rounded"
            >
              <span className="truncate">{site}</span>
              <button
                onClick={() => removeBlockedSite(site)}
                className="ml-2 bg-red-500 p-2 rounded hover:bg-red-600"
              >
                <i className="fa-solid fa-trash"></i>
              </button>
            </div>
          ))}
        </div>

        <div className="flex mt-4 gap-2">
          <input
            type="text"
            placeholder="Add new site (e.g., example.com)"
            value={newSite}
            onChange={(e) => setNewSite(e.target.value)}
            className="flex-grow p-2 rounded text-black"
          />
          <button
            onClick={addBlockedSite}
            className="bg-blue-500 p-2 rounded hover:bg-blue-600"
          >
            <i className="fa-solid fa-plus"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
