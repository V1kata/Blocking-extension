console.log("background.js working");
importScripts('timeUtils.js')
let regex = /^http[s]?:\/\/[\w.,]+\//gi;
let arrOfBlockedSites = [];
let blockedUrl;
let endTimeOfBlock;
let blocker = true;
let lastVisitedTab;
const backgroundChannel = new BroadcastChannel('testChannel');

backgroundChannel.onmessage = (event) => {
    let data = event.data;

    blocker = data.blocker;

    if (!data.tabs) {
        return
    }
    endTimeOfBlock = data.endHour;

    chrome.storage.session.set({ parContent: "broadcast channel is working", urls: data.tabs, endTimeOfBlock })

    arrOfBlockedSites = data.tabs;
    backgroundChannel.postMessage({ reason: 'parContent' });
};

chrome.tabs.onActivated.addListener(async function (activeInfo) {
    const tabId = activeInfo.tabId;
    const windowId = activeInfo.windowId;

    getLastTab();
    getUrlAndTitle(tabId);
});

chrome.webNavigation.onCompleted.addListener(function (details) {
    const tabId = details.tabId;

    getLastTab();
    getUrlAndTitle(tabId);
});

function getLastTab() {
    chrome.tabs.query({ active: false, lastFocusedWindow: true, status: "complete" }, (tab) => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            return;
        }
        let fileterdArr = tab.filter((x) => x.lastAccessed);
        let resArr = fileterdArr.slice().sort((a, b) => {
            return b.lastAccessed - a.lastAccessed
        });

        if (!resArr.length || resArr[0].url.startsWith('chrome:/')) {
            return;
        }

        lastVisitedTab = { tabId: resArr[0].id, url: resArr[0].url };
    });
}

async function getUrlAndTitle(tabId) {
    if (!blocker) {
        return;
    }
    
    if (hourToMinutes(endTimeOfBlock)) {
        return;
    }

    chrome.tabs.get(tabId, async function (tab) {
        if (!arrOfBlockedSites.length) {
            return;
        }

        for (let blockTab of arrOfBlockedSites) {
            let ifCondition = tab.url ? tab.url.startsWith(blockTab) : tab?.pendingUrl.startsWith(blockTab);

            if (ifCondition) {
                chrome.tabs.remove(tabId);

                if (!lastVisitedTab) {
                    return
                }

                chrome.tabs.update(lastVisitedTab.tabId, { active: true });
                // chrome.tabs.reload(lastVisitedTab.tabId);

                // chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                //     sendResponse({ display: true, lastUrl: lastVisitedTab.url })
                // });
            }
        }

    });
}



