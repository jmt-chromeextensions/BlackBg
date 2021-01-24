// Manage interaction with the popup and the selected pages list.

const ENABLED = "enabled";
const BACKGROUND = "background";
const TEXT = "text";
const ULINK = "ulink"; // Unvisited link
const VLINK = "vlink"; // Visited link

const COLOR_MODE = "color";
const RANDOM_MODE = "random";
const CYCLE_MODE = "cycle";
const NOCOLOR_MODE = "nocolor";

const SAVED_PAGE_DIV_TEMPLATE =
`<div class="saved_page" id="page_SITE_WITH_FORMAT">
    <a href="http://SITE_NO_WWW" class="page_name">SITE_NO_WWW</a>
    <div class="right">
        <label class="switch" id="lbl_SITE_WITH_FORMAT"><input type="checkbox" id="switch_SITE_WITH_FORMAT" data-domain="SITE_NO_WWW">
        <span class="slider round"></span></label>

        <input id="color_SITE_WITH_FORMAT" type="color" data-domain="SITE_WITH_FORMAT" data-selection=${BACKGROUND}>
        <input id="color_text_SITE_WITH_FORMAT" type="color" data-domain="SITE_WITH_FORMAT" data-selection=${TEXT}>
        <input id="color_ulink_SITE_WITH_FORMAT" type="color" data-domain="SITE_WITH_FORMAT" data-selection=${ULINK}>
        <input id="color_vlink_SITE_WITH_FORMAT" type="color" data-domain="SITE_WITH_FORMAT" data-selection=${VLINK}>

        <input type="image" src="../icons/delete.png" id="remove_SITE_WITH_FORMAT">
    </div>
</div>`

const SAVED_PAGE_TR_TEMPLATE = 
`<tr class="saved_page" id="page_SITE_WITH_FORMAT">
    <td><a href="http://SITE_NO_WWW" class="page_name">SITE_NO_WWW</a></td>
    <td>Domain</td>
    <td><label class="switch" id="lbl_SITE_WITH_FORMAT"><input type="checkbox" id="switch_SITE_WITH_FORMAT" data-domain="SITE_NO_WWW"><span class="slider round"></span></label></td>
    <td><input id="color_SITE_WITH_FORMAT" type="color" data-domain="SITE_WITH_FORMAT" data-selection=${BACKGROUND}></td>
    <td><input id="color_text_SITE_WITH_FORMAT" type="color" data-domain="SITE_WITH_FORMAT" data-selection=${TEXT}></td>
    <td><input id="color_ulink_SITE_WITH_FORMAT" type="color" data-domain="SITE_WITH_FORMAT" data-selection=${ULINK}></td>
    <td><input id="color_vlink_SITE_WITH_FORMAT" type="color" data-domain="SITE_WITH_FORMAT" data-selection=${VLINK}></td>
    <td><input type="image" src="../icons/delete.png" id="remove_SITE_WITH_FORMAT"></td>
</tr>`

const DEFAULT_BACKGROUND = { mode: COLOR_MODE, value: "000000" }
const DEFAULT_TEXT = { mode: COLOR_MODE, value: "FFFFFF" }
const DEFAULT_ULINK = { mode: NOCOLOR_MODE, value: "" }
const DEFAULT_VLINK = { mode: NOCOLOR_MODE, value: "" }

var sitesEnabled = [];
var sitesBackground = [];
var sitesText = [];
var sitesULinks = [];
var sitesVLinks = [];

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
            if (color) siteColorPreview(color.toHexString());
            setTimeout(() => {
                preview_color_just_set = false;
            }, 100);
        }
    });

    $(".sp-input").css("color", "white");

    // Hide this thing
    $(".sp-colorize-container.sp-add-on").css("visibility", "hidden");

    // Change clear icon
    $(".sp-clear-display").css("background-image", NO_COLOR_ICON);

    // Remove accept/cancel buttons
    $(".sp-button-container.sp-cf").remove();

    $(".popup_title h2").click(openSiteInNewTab);
    $("#color_selector #acceptBtn").click(getSelectionAndSetIt);
    $("#color_selector #cancelBtn").click(function () {
        closePaletteModal(false);
    });

    // Load buttons' SVGs
    // $("#color_selector .random_div").html(`<span> ${RANDOM_SVG} <\/span>`);

    // Make random icon change its color on mouse events
    $("#color_selector .random_div").click(function () {
        randomColorSelected = true;
        randomColorPreview(paintRandomIcon());
    }).mouseout(function () {
        if (!randomColorSelected)
            paintRandomIcon();
    });

    // RGB cycle icon
    initializeCycleIcon();
    $("#cycle_speed").change(cycleSpeedPreview);

    // Activate different modes
    $("#color_selector .cycle_div").click(rgbCyclePreview);
    $(".sp-clear-display").click(noColorPreview).attr("data-mode", NOCOLOR_MODE);



// #endregion

    // Hide palette when the user clicks out of it
    $("body").click(function(event) {
        if ($("#color_selector").is(":visible"))
            if ($("#color_selector, .sp_container").find(event.target).length == 0 && !$(event.target).is($("#color_selector, .sp_container, input[data-selection]"))) {
                closePaletteModal();
        }
    });

    // Show the pages that are currently selected

    setTimeout(() => {
        chrome.storage.sync.get(["sitesEnabled", "sitesBackground", "sitesText", "sitesULinks", "sitesVLinks"], function (result) {

            if (result.sitesEnabled) {

                [sitesEnabled, sitesBackground, sitesText, sitesULinks, sitesVLinks] = [result.sitesEnabled, result.sitesBackground, result.sitesText, result.sitesULinks, result.sitesVLinks];

                // Display every page name with their own toggle switch and color inputs
                for (let i = 0; i < sitesEnabled.length; i++) {

                    let siteEnabled = sitesEnabled[i].split("/blv_ck_bg/");
                    let siteBackground = sitesBackground[i].split("/blv_ck_bg/");
                    let siteText = sitesText[i].split("/blv_ck_bg/");
                    let siteULinks = sitesULinks[i].split("/blv_ck_bg/");
                    let siteVLinks = sitesVLinks[i].split("/blv_ck_bg/");

                    let background = { mode: siteBackground[1], value: siteBackground.length == 3 ? siteBackground[2] : ''}
                    let text = { mode: siteText[1], value: siteText.length == 3 ? siteText[2] : ''}
                    let ulink = { mode: siteULinks[1], value: siteULinks.length == 3 ? siteULinks[2] : ''}
                    let vlink = { mode: siteVLinks[1], value: siteVLinks.length == 3 ? siteVLinks[2] : ''}

                    addSelectedPageToPopup(siteEnabled[0], siteEnabled[1] === "enabled", background, text, ulink, vlink);
                }
            }
        });
    }, 1);

    // window.onblur(function () {
    //     closePaletteModal();
    // });

});

function addNewSelectedPage() {
    // Get current tab's domain, register it with chrome.storage and send message to all tabs to notify the addition
    chrome.tabs.query({ active: true, currentWindow: true, 'windowId': chrome.windows.WINDOW_ID_CURRENT }, function (tabs) {
        let domain = new URL(tabs[0].url).hostname;

        // Avoid adding the same domain twice
        if (!sitesEnabled.find(page_info => page_info.startsWith (domain))) {

            // Default new values
            sitesEnabled.push([domain, "enabled"].join("/blv_ck_bg/"));
            sitesBackground.push([domain, DEFAULT_BACKGROUND.mode, DEFAULT_BACKGROUND.value].join("/blv_ck_bg/"));
            sitesText.push([domain, DEFAULT_TEXT.mode, DEFAULT_TEXT.value].join("/blv_ck_bg/"));
            sitesULinks.push([domain, DEFAULT_ULINK.mode].join("/blv_ck_bg/"));
            sitesVLinks.push([domain, DEFAULT_VLINK.mode].join("/blv_ck_bg/"));

            // Domains alphabetically ordered
            [sitesEnabled, sitesBackground, sitesText, sitesULinks, sitesVLinks].map(function (siteList) {
                siteList.sort(function (c1, c2) {
                    return c1.replace("www.", "").localeCompare(c2.replace("www.", ""));
                });
            });

            chrome.storage.sync.set({
                "sitesEnabled": sitesEnabled, "sitesBackground": sitesBackground, "sitesText": sitesText, "sitesULinks": sitesULinks, "sitesVLinks": sitesVLinks },
                function () {addSelectedPageToPopup(domain, true, DEFAULT_BACKGROUND, DEFAULT_TEXT, DEFAULT_ULINK, DEFAULT_VLINK);
            })

        } else {
            $(`#switch_${domain.replace("www.", "").replaceAll('.','-')}`).prop('checked', true);
        }

        sendMessageToContentScripts("activateBlackBgMode", domain);
    });
}

function openSettingsTab() {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL('options.html'));
    }
}

function openPaletteModal(event, input) {

    event.preventDefault();

    let domain = $(input).attr("data-domain").replaceAll("-", ".");
    let selection = $(input).attr("data-selection");
    let mode = $(input).attr("data-mode");

    // Increase body's height so the modal can fit in
    let current_body_height = parseFloat($("body").css("height").replace("px", ""));
    if (current_body_height < 580) {
        $("body").attr("data-height", current_body_height);
        $("body").css("height", 580);
    }

    // Indicate which color is being selected
    $(input).attr("data-palette", "open");

    // Show what selection is being made in pop-up
    $(".popup_title h2").text(domain).attr("href", `http://${domain}`);
    $(".popup_title h3").text(`Choose a color for ${selection}.`);

    // Set palette to site's custom color
    if ($(input).val() && mode === COLOR_MODE)
        $("#showInput").spectrum("set", $(input).val());
    else if (mode === NOCOLOR_MODE)
        $(".sp-input").val("No selected color.")
    else if (mode === CYCLE_MODE)
        $("#cycle_speed").val($(input).attr("data-cycle_speed"));

    // Add semi-transparency to everything outside the pop-up
     $("#content, header").addClass("semi_transparent");

    $("#color_selector").show();
    not_hide_palette = true;

    visualizeSelectedMode(mode);

    setTimeout(() => {
        // Adjust palette's position
        $("#showInput").click();

        // let topDiff = parseInt($(".sp-container").css("top").replace("px", "")) - $("body")[0].scrollTop;
        // $(".sp-container").css("position", "fixed").css("top", topDiff);

    }, 1);

}

function closePaletteModal(saveChanges) {
    not_hide_palette = false;

    // Adjust pop-up size
    if ($("body").attr("data-height")) {
        $("body").css("height", $("body").attr("data-height"));
        $("body").removeAttr("data-height");
    }

    // Send message to stop preview (apply changes in webpage if accept button has been pressed)
    let domain = $("input[data-palette='open']").attr("data-domain").replaceAll("-", ".");
    let selection = $("input[data-palette='open']").attr("data-selection");

    sendMessageToContentScripts(saveChanges ? "savePreview" : "stopPreview", domain, selection);

    // Hide palette and modal
    cycleSelected = false;
    $("input[data-palette='open']").removeAttr("data-palette");
    $("#showInput").click();
    $(".semi_transparent").removeClass("semi_transparent");
    $("#color_selector").hide();
}

function applyOnAllPages() {
    $("label[for='btn_all'").toggleClass("opacity_25");
    chrome.storage.sync.set({'itEverywhere': this.checked}, function() { });

    if (this.checked)
        sendMessageToContentScripts("applyOnAllPages");
    else
        sendMessageToContentScripts("notApplyOnAllPages");

}

function addSelectedPageToPopup(domain, enabled, background, text, ulink, vlink) {

    let new_saved_page_elem_html = SAVED_PAGE_TR_TEMPLATE
    .replaceAll("SITE_WITH_FORMAT", domain.replace("www.", "").replaceAll('.', '-'))
    .replaceAll("SITE_NO_WWW", domain.replace("www.", ""));
    // .replaceAll("SITE_RAW", domain);

    let position_in_list = sitesEnabled.indexOf(sitesEnabled.find(page_info => page_info.includes (domain.replace("www.", ""))));
    domain = domain.replace("www.", "").replaceAll('.', '-');

    if (position_in_list == 0)
        $("#saved_sites").append(new_saved_page_elem_html);
    else
        $(".saved_page").eq(position_in_list - 1).after(new_saved_page_elem_html);

    if (enabled)
        $(`#switch_${domain}`)[0].checked = true;

    // Assign color values and modes to inputs (values may be null)
    $(`#color_${domain}`).val(`#${background.value}`).attr("data-mode", background.mode);
    $(`#color_text_${domain}`).val(`#${text.value}`).attr("data-mode", text.mode);
    $(`#color_ulink_${domain}`).val(`#${ulink.value}`).attr("data-mode", ulink.mode);
    $(`#color_vlink_${domain}`).val(`#${vlink.value}`).attr("data-mode", vlink.mode);

    // Modify input in case of selected extra mode (random, cycle, no color)
    $(`#color_${domain}, #color_text_${domain}, #color_ulink_${domain}, #color_vlink_${domain}`).each(function () { 
        modifyInputDependingOnMode($(this)); 
    })

    if (background.mode === CYCLE_MODE) $(`#color_${domain}`).attr("data-cycle_speed", background.value);
    if (text.mode === CYCLE_MODE) $(`#color_text_${domain}`).attr("data-cycle_speed", text.value);
    if (ulink.mode === CYCLE_MODE) $(`#color_ulink_${domain}`).attr("data-cycle_speed", ulink.value);
    if (vlink.mode === CYCLE_MODE) $(`#color_vlink_${domain}`).attr("data-cycle_speed", vlink.value);

    // Open site in new tab when URL is clicked
    $(`#page_${domain} .page_name`).click(openSiteInNewTab);

    // Save enabled/disabled option for selected pages on switch interaction
    $(`#switch_${domain}`).bind('change', (delayFunction(enableDisablePage, 1)));

    // Open palette when any of the inputs is clicked
    
    // $(`#color_${domain}, #color_text_${domain}, #color_ulink_${domain}, #color_vlink_${domain}`).click(openPaletteModal);
    $(`#color_${domain}, #color_text_${domain}, #color_ulink_${domain}, #color_vlink_${domain}`).click(function (event) {
        openPaletteModal(event, this);
    });

    // Delete selected page from list (popup and storage; asks for confirmation)
    $(`#remove_${domain}`).bind('click', { enabled: enabled }, deleteConfirmOptions);
}

function modifyInputDependingOnMode (input) {
    switch (input.attr("data-mode")) {
        case COLOR_MODE:
            input.attr("type", "color").removeAttr("src").removeClass("input_extra_mode");
            break;
            
        case RANDOM_MODE:
            input.attr("type", "image").attr("src", "../icons/random_2.png").addClass("input_extra_mode");
            break;
    
        case CYCLE_MODE:
            input.attr("type", "image").attr("src", "../icons/cycle_2.png").addClass("input_extra_mode");
            break;

        case NOCOLOR_MODE:
            input.attr("type", "image").attr("src", "../icons/nocolor_2.png").addClass("input_extra_mode");
            break;
    }
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
    let index = getPageIndexInArrayByDomain(domain, ENABLED);

    sitesEnabled[index] = sitesEnabled[index].split('/blv_ck_bg/')[0] + '/blv_ck_bg/' + ((enabled) ? 'enabled' : 'disabled');

    saveSites(ENABLED);
    sendMessageToContentScripts(enabled ? "activateBlackBgMode" : "deactivateBlackBgMode", domain);

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

    sitesEnabled = sitesEnabled.filter(page_info => !page_info.includes(domain));
    sitesBackground = sitesBackground.filter(page_info => !page_info.includes(domain));
    sitesText = sitesText.filter(page_info => !page_info.includes(domain));
    sitesULinks = sitesULinks.filter(page_info => !page_info.includes(domain));
    sitesVLinks = sitesVLinks.filter(page_info => !page_info.includes(domain));

    chrome.storage.sync.set({
        "sitesEnabled": sitesEnabled, "sitesBackground": sitesBackground, "sitesText": sitesText, "sitesULinks": sitesULinks, "sitesVLinks": sitesVLinks },
        function () { location.reload(); }
    );
    sendMessageToContentScripts("deactivateBlackBgMode", domain);
}

function restoreSelectedPageDiv(event) {

    let domain = this.id.split('_')[1];

    $(`#page_${domain}`).html(event.data.divContent);

    $(`#switch_${domain}`).prop('checked', event.data.enabled);
    $(`#switch_${domain}`).change(enableDisablePage);
    $(`#remove_${domain}`).bind('click', { enabled: event.data.enabled }, deleteConfirmOptions);
}

function saveSites(type) {

    if (type) {

        switch(type) {

            case ENABLED:
                chrome.storage.sync.set({ 'sitesEnabled': sitesEnabled }, function () { console.log(); });
                break;

            case BACKGROUND:
                chrome.storage.sync.set({ 'sitesBackground': sitesBackground }, function () { console.log(); });
                break;

            case TEXT:
                chrome.storage.sync.set({ 'sitesText': sitesText }, function () { console.log(); });
                break;

            case ULINK:
                chrome.storage.sync.set({ 'sitesULinks': sitesULinks }, function () { console.log(); });
                break;

            case VLINK:
                chrome.storage.sync.set({ 'sitesVLinks': sitesVLinks }, function () { console.log(); });
                break;

        }

    } else
        chrome.storage.sync.set({
            "sitesEnabled": sitesEnabled, "sitesBackground": sitesBackground, "sitesText": sitesText, "sitesULinks": sitesULinks, "sitesVLinks": sitesVLinks },
            function () { console.log();
        });

}

function sendMessageToContentScripts(action, domain, selection, value) {
    chrome.tabs.query({}, function (tabs) {
        for (var i = 0, length = tabs.length; i < length; i++) {
            chrome.tabs.sendMessage(tabs[i].id, { domain: domain, action: action, selection:selection, value: value  }, function () { });
        }
    });
}

function getPageIndexInArrayByDomain(domain, selection) {

    switch (selection) {

        case ENABLED:
            return sitesEnabled.indexOf(sitesEnabled.find(page_info => page_info.includes(domain)));

        case BACKGROUND:
            return sitesBackground.indexOf(sitesBackground.find(page_info => page_info.includes(domain)));

        case TEXT:
            return sitesText.indexOf(sitesText.find(page_info => page_info.includes(domain)));

        case ULINK:
            return sitesULinks.indexOf(sitesULinks.find(page_info => page_info.includes(domain)));

        case VLINK:
            return sitesVLinks.indexOf(sitesVLinks.find(page_info => page_info.includes(domain)));

        default:
            return sitesEnabled.indexOf(sitesEnabled.find(page_info => page_info.includes(domain)));


    }

}











