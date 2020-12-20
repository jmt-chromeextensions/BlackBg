// Manage interaction with the popup and the selected pages list.

const SAVED_PAGE_ELEM_TEMPLATE = 
`<div class="saved_page" id="page_XXX">
    <a href="http://YYY" class="page_name">YYY</a>
    <div class="right">
        <label class="switch" id="lbl_XXX"><input type="checkbox" id="switch_XXX" data-domain="ZZZ">
        <span class="slider round"></span></label>

        <input id="color_XXX" type="color" class="input_color">
        <input id="color_text_XXX" type="color">
        <input id="color_ulink_XXX" type="color">
        <input id="color_vlink_XXX" type="color">

        <input type="image" src="../icons/delete.png" id="remove_XXX">
    </div>
</div>`

var selected_pages = [];

var not_hide_palette = false;
var preview_color_just_set = false;

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

    //#region Initialize color palette

    $("#showInput").spectrum({
        preferredFormat: "hex", // Avoid color names
        showInput: true,
        showPalette: false,
        containerClassName: 'palette_bgColor'
    });

    $("#showInput").on('hide.spectrum', function(e, tinycolor) { 
        if (not_hide_palette)
            $("#showInput").spectrum("show"); 
    }).on('move.spectrum', function(e, color) {
        if (!preview_color_just_set) {
            preview_color_just_set = true;
            siteColorPreview(color.toHexString());
            setTimeout(() => {
                preview_color_just_set = false;
            }, 100);
        }
    });
    
    $(".sp-input").css("color", "white");

    // Remove accept/cancel buttons 
    $(".sp-button-container.sp-cf").remove();

    $(".popup_title h2").click(openSiteInNewTab);
    $("#color_selector #acceptBtn").click(getChosenColorAndSetIt);
    $("#color_selector #cancelBtn").click(closePaletteModal);

    // Load buttons' SVGs
    // $("#color_selector .random_div").html(`<span> ${RANDOM_SVG} <\/span>`);

    // Make random icon change its color on mouse events
    $("#color_selector .random_div").mouseover(paintRandomIconPaths).mouseout(paintRandomIconPaths);

    $("#color_selector .cycle_div").click(rgbCyclePreview);

    // RGB cycle icon
    initializeCycleIcon();
    $("#cycle_speed").change(cycleColorPreview);

    // #endregion

    // Hide palette when the user clicks out of it
    $("body").click(function(event) {
        if ($("#color_selector").is(":visible"))
            if ($("#color_selector, .sp_container").find(event.target).length == 0 && !$(event.target).is($("#color_selector, .sp_container, .input_color"))) {
                closePaletteModal();
        }
    });

    // Show the pages that are currently selected

    setTimeout(() => {
        chrome.storage.sync.get('selectedPages', function (result) {

            if (result.selectedPages) {
    
                selected_pages = result.selectedPages;
    
                // Display every page name with their own toggle switch and color input
                for (let i = 0; i < selected_pages.length; i++) {
                    let value = selected_pages[i];
                    let siteValues = value.split('/blv_ck_bg/');
                    if (siteValues.length == 2) {
                        selected_pages[i] = selected_pages[i] + "/blv_ck_bg/000000/blv_ck_bg/FFFFFF"; // Assign default values
                        addSelectedPageToPopup(siteValues[0], siteValues[1] === "enabled");
                    }
                    if (siteValues.length == 3) {
                        selected_pages[i] = selected_pages[i] + "/blv_ck_bg/FFFFFF"; // Assign default values
                        addSelectedPageToPopup(siteValues[0], siteValues[1] === "enabled", siteValues[2]);  
                    } 
                    if (siteValues.length == 4) addSelectedPageToPopup(siteValues[0], siteValues[1] === "enabled", siteValues[2], siteValues[3]);
                }
            }
        });
    }, 1);
    
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

function openPaletteModal(event) {
    
    // $("*").addClass("semi_transparent");
    // $("#color_modal").find("*").removeClass("semi_transparent");
    event.preventDefault();

    // Increase body's height so the modal can fit in
    let current_body_height = parseFloat($("body").css("height").replace("px", ""));
    if (current_body_height < 580) {
        $("body").attr("data-height", current_body_height);
        $("body").css("height", 580);
    }

    // Indicate which color is being selected
    $(this).attr("data-palette", "open");

    // Show what selection is being made in pop-up
    let domain = event.data.domain.replaceAll("-", ".");
    $(".popup_title h2").text(domain).attr("href", `http://${domain}`);
    $(".popup_title h3").text(`Choose a color for ${event.data.selection}.`);
    
    // Set palette to site's custom color
    $("#showInput").spectrum("set", event.data.color);

    $("#color_selector").show();
    not_hide_palette = true;

    setTimeout(() => {
        $("#showInput").click();

        // Adjust palette's position
        let topDiff = parseInt($(".sp-container").css("top").replace("px", "")) - $("body")[0].scrollTop;
        $(".sp-container").css("position", "fixed").css("top", topDiff);
    }, 1); 

}

function closePaletteModal(saveChanges) {
    not_hide_palette = false;

    if ($("body").attr("data-height")) {
        $("body").css("height", $("body").attr("data-height"));
        $("body").removeAttr("data-height");
    }

    // Send message to stop preview
    let domain = $("input[data-palette='open']").attr("id").replace("color_", "").replace("text_", "").replaceAll("-", ".");

    if ($("input[data-palette='open']").attr("id").startsWith("color_text_"))
        sendMessageToContentScripts(domain, "stopPreviewText");
    else
        sendMessageToContentScripts(domain, "stopPreviewBackground");


    $("input[data-palette='open']").removeAttr("data-palette");

    // Hide palette and modal
    $("#showInput").click();
    $("#color_selector").hide();
}

function applyOnAllPages() {
    $("label[for='btn_all'").toggleClass("opacity_25");
    chrome.storage.sync.set({'itEverywhere': this.checked}, function() { });

    if (this.checked) 
        sendMessageToContentScripts("", "applyOnAllPages");
    else 
        sendMessageToContentScripts("", "notApplyOnAllPages");
    
}

function addSelectedPageToPopup(domain, enabled, color, textColor) {

    let new_saved_page_elem_html = SAVED_PAGE_ELEM_TEMPLATE
    .replaceAll("XXX", domain.replace("www.", "").replaceAll('.', '-'))
    .replaceAll("YYY", domain.replace("www.", ""))
    .replaceAll("ZZZ", domain);

    let position_in_list = selected_pages.indexOf(selected_pages.find(page_info => page_info.includes (domain.replace("www.", ""))));
    domain = domain.replace("www.", "").replaceAll('.', '-');

    if (position_in_list == 0)
        $("#saved_pages").prepend(new_saved_page_elem_html);
    else
        $(".saved_page").eq(position_in_list - 1).after(new_saved_page_elem_html);

    if (enabled)
        $(`#switch_${domain}`)[0].checked = true;

    if (color)
        $(`#color_${domain}`).val(`#${color}`);
    else
        $(`#color_${domain}`).val('#000000'); // Black by default

    if (textColor)
        $(`#color_text_${domain}`).val(`#${textColor}`);
    else
        $(`#color_text_${domain}`).val('#FFFFFF'); // White by default

    // Open site in new tab when URL is clicked
    $(`#page_${domain} .page_name`).click(openSiteInNewTab);

    // Save enabled/disabled option for selected pages on switch interaction
    $(`#switch_${domain}`).bind('change', (delayFunction(enableDisablePage, 1)));

    // Set site's custom background color
    $(`#color_${domain}`).bind('change', { domain: domain }, setSiteColor);
    $(`#color_${domain}`).bind('click', { domain: domain, color: color, selection:"background" }, openPaletteModal);

    // Same for text's color
    $(`#color_text_${domain}`).bind('change', { domain: domain }, setSiteTextColor);
    $(`#color_text_${domain}`).bind('click', { domain: domain, color: color }, openPaletteModal);

    // Delete selected page from list (popup and storage; asks for confirmation)
    $(`#remove_${domain}`).bind('click', { enabled: enabled }, deleteConfirmOptions);
}

function openSiteInNewTab() {
    let url = $(this).attr('href');
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        // Open new tab with the video to the right of the current one
        chrome.tabs.create({ url: url, active: false, index: (tabs[0].index + 1) }); 
    });
    return false;
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

    $("#saved_pages").find("[id^='cancelBtn']").click();

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
    chrome.storage.sync.set({ 'sites_enabled': selected_pages }, function () { console.log(); })
}

function sendMessageToContentScripts(domain, action, color) {
    debugger;
    chrome.tabs.query({}, function (tabs) {
        for (var i = 0, length = tabs.length; i < length; i++) {
            chrome.tabs.sendMessage(tabs[i].id, { domain: domain, action: action, color: color  }, function () { });
        }
    });
}

function getPageIndexInArrayByDomain(domain) {
    return selected_pages.indexOf(selected_pages.find(page_info => page_info.includes(domain)));
}











