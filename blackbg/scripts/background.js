// chrome.tabs.onCreated.addListener(do_something2);
// chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
    // if (info.status == 'complete') do_something2(tab);
// });

function do_something2(tab) {
   chrome.tabs.insertCSS(tab.id, {
            file: "styles/black.css"
        });
}