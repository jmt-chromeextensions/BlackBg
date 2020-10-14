// Manage interaction with the popup and the selected pages list.
const SAVED_PAGE_ELEM_TEMPLATE = `<div class="saved_page" id="page_XXX"><span class="page_name">YYY</span><div class="right"><label class="switch" id="lbl_XXX"><input type="checkbox" id="switch_XXX" data-domain="ZZZ"><span class="slider round"></span></label><input type="image" src="../icons/delete.png" id="remove_XXX"></div></div>`

var selected_pages = [];

$(document).ready(function () {

    localizeAllTexts();
    chrome.storage.sync.get('itEverywhere', function (resultItEverywhere) {
        if (resultItEverywhere.itEverywhere === true) {
            $("#btn_all")[0].checked = true;
            $("label[for='btn_all'").removeClass("opacity_25");
        }
    });

    // Add current page button
    $('#btn_add').click(addNewSelectedPage);

    // Apply on all pages button
    $('#btn_all').change(applyOnAllPages);

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

function addNewSelectedPage() {
    // Get current tab domain, register it with chrome.storage and send message to all tabs to notify the addition
    chrome.tabs.query({ active: true, currentWindow: true, 'windowId': chrome.windows.WINDOW_ID_CURRENT }, function (tabs) {
        let domain = new URL(tabs[0].url).hostname;
        let currentPage = domain + '/blv_ck_bg/enabled';

        // Avoid adding the same domain twice
        if (!selected_pages.find(page_info => page_info.startsWith (domain))) {
            selected_pages.push(currentPage);
            
            // Domains alphabetically ordered
            selected_pages.sort(function (c1, c2) {
				return c1.replace("www.", "").localeCompare(c2.replace("www.", ""));
			}); 
          
            chrome.storage.sync.set({ 'selectedPages': selected_pages }, function () {
                addSelectedPageToPopup(domain, true);
            })

        } else {
            $(`#switch_${domain.replace("www.", "").replaceAll('.','-')}`).prop('checked', true);
        }

        sendMessageToContentScripts(domain, "activateBlackBgMode");
    });
}

function openSettingsTab() {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL('options.html'));
    }
}

function applyOnAllPages() {
    $("label[for='btn_all'").toggleClass("opacity_25");
    chrome.storage.sync.set({'itEverywhere': this.checked}, function() { });

    if (this.checked) 
        sendMessageToContentScripts("", "applyOnAllPages");
    else 
        sendMessageToContentScripts("", "notApplyOnAllPages");
    
}

function addSelectedPageToPopup(domain, enabled) {

    let new_saved_page_elem_html = SAVED_PAGE_ELEM_TEMPLATE
    .replaceAll("XXX", domain.replace("www.", "").replaceAll('.', '-'))
    .replace("YYY", domain.replace("www.", ""))
    .replace("ZZZ", domain);

    let position_in_list = selected_pages.indexOf(selected_pages.find(page_info => page_info.includes (domain.replace("www.", ""))));
    domain = domain.replace("www.", "").replaceAll('.', '-');

    if (position_in_list == 0)
        $("#saved_pages").prepend(new_saved_page_elem_html);
    else
        $(".saved_page").eq(position_in_list - 1).after(new_saved_page_elem_html);

    if (enabled)
        $(`#switch_${domain}`)[0].checked = true;

    // Save enabled/disabled option for selected pages on switch interaction
    $(`#switch_${domain}`).bind('change', (delayFunction(enableDisablePage, 1)));

    // Delete selected page from list (popup and storage; asks for confirmation)
    $(`#remove_${domain}`).bind('click', { enabled: enabled }, deleteConfirmOptions);
}

function enableDisablePage() {

    let enabled = this.checked;
    let domain = $(this).data("domain");
    let index = getPageIndexInArrayByDomain(domain);

    selected_pages[index] = selected_pages[index].split('/blv_ck_bg/')[0] + '/blv_ck_bg/' + ((enabled) ? 'enabled' : 'disabled');

    saveSelectedPages();
    sendMessageToContentScripts(domain, enabled ? "activateBlackBgMode" : "deactivateBlackBgMode");

}

function deleteConfirmOptions(event) {

    $("[id^='cancelBtn']").click();

    let domain = this.id.split('_')[1];

    let selectedPageDiv = $(`.saved_page:contains(${domain.replaceAll('-','.')})`);
    let pageDivContent = $(selectedPageDiv).html();

    $(selectedPageDiv).find('.page_name:first').html(getLocalizedText("msg_confimation"));

    let optionsDiv = $(selectedPageDiv).find('.right:first')
    optionsDiv.html(`<input id="acceptBtn_${domain}" type="image" src="../icons/accept.png" title="Accept" style="margin-right:15px"/>`);
    optionsDiv.html(optionsDiv.html() + `<input id="cancelBtn_${domain}" type="image" src="../icons/cancel.png" title="Cancel"/>`);

    $(`#acceptBtn_${domain}`).click(deleteSelectedPage);
    $(`#cancelBtn_${domain}`).bind('click', { divContent: pageDivContent, enabled: event.data.enabled }, restoreSelectedPageDiv);

}

function deleteSelectedPage() {
    let domain = this.id.split('_')[1].replaceAll('-', '.');

    domain = selected_pages[getPageIndexInArrayByDomain(domain)].split('/blv_ck_bg/')[0];
    selected_pages = selected_pages.filter(page_info => !page_info.includes(domain));

    chrome.storage.sync.set({ 'selectedPages': selected_pages }, function () { location.reload(); })
    sendMessageToContentScripts(domain, "deactivateBlackBgMode");
}

function restoreSelectedPageDiv(event) {

    let domain = this.id.split('_')[1];

    $(`#page_${domain}`).html(event.data.divContent);

    $(`#switch_${domain}`).prop('checked', event.data.enabled);
    $(`#switch_${domain}`).change(enableDisablePage);
    $(`#remove_${domain}`).bind('click', { enabled: event.data.enabled }, deleteConfirmOptions);
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

function getPageIndexInArrayByDomain(domain) {
    return selected_pages.indexOf(selected_pages.find(page_info => page_info.includes(domain)));
}











