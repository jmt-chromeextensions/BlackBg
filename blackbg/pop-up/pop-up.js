// Manage interaction with the popup and the selected pages list.

var selectedPages = '';
var pageNumber = 0;

$(document).ready(function () {

    // Settings button
    $('#settingsBtn').click(function () {
        openSettingsTab();
    });

    // Add current page button
    $('#addBtn').click(function () {
        addNewSelectedPage();
    });

    // Show the pages that are currently selected
    chrome.storage.sync.get('selectedPages', function (result) {

        if (result.selectedPages) {

            selectedPages = result.selectedPages;

            // Display every page name with its own toggle switch
            selectedPages.forEach(function (value) {

                addSelectedPageToPopup(value.split('/blv_ck_bg/')[0], value.split('/blv_ck_bg/')[1].localeCompare('enabled') == 0);

            });

        } else {
            selectedPages = [];
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

    var currentTabQuery = { active: true, currentWindow: true, 'windowId': chrome.windows.WINDOW_ID_CURRENT };
    chrome.tabs.query(currentTabQuery, getCurrentDomain);

}

function getCurrentDomain(tabs) {

    var domain = new URL(tabs[0].url).hostname;
    var currentPage = domain + '/blv_ck_bg/enabled';

    selectedPages.push(currentPage);
    chrome.storage.sync.set({ 'selectedPages': selectedPages }, function () { addSelectedPageToPopup(domain, true); })

}

function addSelectedPageToPopup(domain, enabled) {

    var div = document.createElement("div");
    div.className = 'pageList';
    div.id = 'page' + pageNumber;

    var rightDiv = document.createElement("div");
    rightDiv.className = 'right';

    var label = document.createElement("label");
    label.className = 'switch';
    label.id = 'lbl' + pageNumber;

    var input = document.createElement("input");
    input.type = 'checkbox';
    input.id = 'switch' + pageNumber;
    if (enabled)
        input.checked = true;

    var span = document.createElement("span");
    span.className = 'slider round';

    var pageSpan = document.createElement("span");
    pageSpan.className = 'pageName';
    pageSpan.innerHTML = domain;

    var removeImg = document.createElement("input");
    removeImg.type = 'image';
    removeImg.src = "../icons/delete.png"
    removeImg.id = 'remove' + pageNumber;
    //removeImg.onclick = deleteSelectedPage();

    label.appendChild(input);
    label.appendChild(span);

    rightDiv.appendChild(label);
    rightDiv.appendChild(removeImg);

    div.appendChild(pageSpan);
    div.appendChild(rightDiv);

    document.getElementById("saveListSelection").appendChild(div);

    // Save enabled/disabled option for selected pages on switch interaction
    $('#switch' + pageNumber).bind('change', { index: pageNumber }, enableDisablePage);

    // Delete selected page from list (popup and storage; asks for confirmation)
    $('#remove' + pageNumber).bind('click', { index: pageNumber, enabled: enabled }, deleteConfirmOptions);

    pageNumber++;

}

function enableDisablePage(event) {

    var index = event.data.index;
    selectedPages[index] = selectedPages[index].split('/blv_ck_bg/')[0] + '/blv_ck_bg/' + (($('#switch' + index).prop('checked') === true) ? 'enabled' : 'disabled');
    saveSelectedPages();

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
    selectedPages.splice(event.data.index, 1);
    chrome.storage.sync.set({ 'selectedPages': selectedPages }, function () { location.reload(true); })
}

function restoreSelectedPageDiv(event) {

    var index = event.data.index;

    $('#page' + index).html(event.data.divContent);

    $('#switch' + index).prop('checked', event.data.enabled);
    $('#switch' + index).bind('change', { index: index }, enableDisablePage);
    $('#remove' + index).bind('click', { index: index, enabled: event.data.enabled }, deleteConfirmOptions);
}

function saveSelectedPages() {
    chrome.storage.sync.set({ 'selectedPages': selectedPages }, function () { console.log(); })
}












