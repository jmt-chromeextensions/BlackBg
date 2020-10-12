// Manage interaction with the popup and the selected pages list.
const SAVED_PAGE_ELEM_TEMPLATE = `<div class="saved_page" id="pageXXX"><span class="page_name">URL</span><div class="right"><label class="switch" id="lblXXX"><input type="checkbox" id="switch_XXX" data-domain="URL"><span class="slider round"></span></label><input type="image" src="../icons/delete.png" id="removeXXX"></div></div>`

var selected_pages = [];
var pageNumber = 0;

$(document).ready(function () {

    localizeAllTexts();

    // Settings button
    $('#btn_settings').click(openSettingsTab);

    // Add current page button
    $('#btn_add').click(addNewSelectedPage);

    // Show the pages that are currently selected
    chrome.storage.sync.get('selectedPages', function (result) {

        if (result.selectedPages) {

            selected_pages = result.selectedPages;

            // Display every page name with its own toggle switch
            selected_pages.forEach(function (value) {
                addSelectedPageToPopup(value.split('/blv_ck_bg/')[0], value.split('/blv_ck_bg/')[1] === "enabled");
            });

        }

    });

});

function openSettingsTab() {

    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL('options.html'));
    }

}

function addNewSelectedPage() {
    // Get current tab domain, register it with chrome.storage and send message to all tabs to notify the addition
    chrome.tabs.query({ active: true, currentWindow: true, 'windowId': chrome.windows.WINDOW_ID_CURRENT }, function (tabs) {
        let domain = new URL(tabs[0].url).hostname;
        let currentPage = domain + '/blv_ck_bg/enabled';

        selected_pages.push(currentPage);
        chrome.storage.sync.set({ 'selectedPages': selected_pages }, function () { 
            addSelectedPageToPopup(domain, true); 
        })

        sendMessageToContentScripts(domain, "activateBlackBgMode");
    });
}

function addSelectedPageToPopup(domain, enabled) {

    let new_saved_page_elem_html = SAVED_PAGE_ELEM_TEMPLATE.replaceAll("XXX", pageNumber).replaceAll("URL", domain);
    $("#saved_pages").append(new_saved_page_elem_html);

    if (enabled)
        $(`#switch_${pageNumber}`)[0].checked = true;

    // Save enabled/disabled option for selected pages on switch interaction
    $(`#switch_${pageNumber}`).bind('change', (delayFunction(enableDisablePage, 1)));

    // Delete selected page from list (popup and storage; asks for confirmation)
    // $('#remove' + pageNumber).click(deleteConfirmOptions);

    $('#remove' + pageNumber).bind('click', { index: pageNumber, enabled: enabled }, deleteConfirmOptions);

    pageNumber++;

}

function enableDisablePage() {

    let index = this.id.split('_')[1];
    let enabled = this.checked;
    let domain = $(this).data("domain");

    selected_pages[index] = selected_pages[index].split('/blv_ck_bg/')[0] + '/blv_ck_bg/' + ((enabled) ? 'enabled' : 'disabled');

    saveSelectedPages();
    sendMessageToContentScripts(domain, enabled ? "activateBlackBgMode" : "deactivateBlackBgMode");

}

function deleteConfirmOptions(event) {

    var index = event.data.index;
    var selectedPageDiv = $('#page' + index);
    var pageDivContent = $(selectedPageDiv).html();

    $(selectedPageDiv).find('.pageName:first').html('Are you sure?');

    var optionsDiv = $(selectedPageDiv).find('.right:first')
    optionsDiv.html('<input id="acceptBtn' + index + '" type="image" src="../icons/accept.png" title="Accept" style="margin-right:15px"/>');
    optionsDiv.html(optionsDiv.html() + '<input id="cancelBtn' + index + '" type="image" src="../icons/cancel.png" title="Cancel"/>');

    $('#acceptBtn' + index).bind('click', { index: index }, deleteSelectedPage);
    $('#cancelBtn' + index).bind('click', { index: index, divContent: pageDivContent, enabled: event.data.enabled }, restoreSelectedPageDiv);

}

function deleteSelectedPage(event) {
    selected_pages.splice(event.data.index, 1);
    chrome.storage.sync.set({ 'selectedPages': selected_pages }, function () { location.reload(true); })
}

function restoreSelectedPageDiv(event) {

    var index = event.data.index;

    $('#page' + index).html(event.data.divContent);

    $('#switch' + index).prop('checked', event.data.enabled);
    $('#switch' + index).bind('change', { index: index }, enableDisablePage);
    $('#remove' + index).bind('click', { index: index, enabled: event.data.enabled }, deleteConfirmOptions);
}

function saveSelectedPages() {
    chrome.storage.sync.set({ 'selectedPages': selected_pages }, function () { console.log(); })
}

function sendMessageToContentScripts(domain, action) {
    debugger;
    chrome.tabs.query({}, function (tabs) {
        for (var i = 0, length = tabs.length; i < length; i++) {
            chrome.tabs.sendMessage(tabs[i].id, { domain: domain, action: action  }, function () { });
        }
    });
}











