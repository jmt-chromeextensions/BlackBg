// Manage interaction with the popup and the selected pages list.

const TRANSLATIONS = new Map([["title_enable_never", getLocalizedText("title_enable_never")],
                             ["title_enable_everywhere", getLocalizedText("title_enable_everywhere")],
                             ["title_enable_custom", getLocalizedText("title_enable_custom")],
                             ["title_delete_site", getLocalizedText("title_delete_site")],
                             ["lbl_select_copy_to", getLocalizedText("lbl_select_copy_to")],
                             ["lbl_popup_color_selector_all_sites", getLocalizedText("lbl_popup_color_selector_all_sites")],
                             ["lbl_popup_color_selector_choose", getLocalizedText("lbl_popup_color_selector_choose")],
                             ["lbl_popup_color_selector_all_sites", getLocalizedText("lbl_popup_color_selector_all_sites")],
                             ["lbl_popup_color_selector_background", getLocalizedText("lbl_popup_color_selector_background")],
                             ["lbl_popup_color_selector_text", getLocalizedText("lbl_popup_color_selector_text")],
                             ["lbl_popup_color_selector_ulink", getLocalizedText("lbl_popup_color_selector_ulink")],
                             ["lbl_popup_color_selector_vlink", getLocalizedText("lbl_popup_color_selector_vlink")],
                             ["title_input_random", getLocalizedText("title_input_random")],
                             ["title_input_cycle", getLocalizedText("title_input_cycle")],
                             ["title_input_nocolor", getLocalizedText("title_input_nocolor")],
                             ["lbl_popup_color_selector_optimal_cycle_speed", getLocalizedText("lbl_popup_color_selector_optimal_cycle_speed")]]);

const HAPPY_FACE_SEPARATOR = " (\u273F\u25E0\u203F\u25E0\) "; // (✿◠‿◠)

const ENABLED = "enabled";
const BACKGROUND = "background";
const TEXT = "text";
const ULINK = "ulink"; // Unvisited link
const VLINK = "vlink"; // Visited link

const COLOR_MODE = "color";
const RANDOM_MODE = "random";
const CYCLE_MODE = "cycle";
const NOCOLOR_MODE = "nocolor";

const ENABLE_NEVER = "never";
const ENABLE_ONLY_EVERYWHERE = "everywhere";
const ENABLE_CUSTOM = "custom";

const COLOR_MSG = "setSiteColorForPreview";
const CYCLE_MSG = "startCycleForPreview";
const CYCLE_SPEED_MSG = "setCycleSpeedForPreview";
const NO_COLOR_MSG = "noColorForPreview";
const ACTIVATE_MSG = "activateBlackBgMode";
const DEACTIVATE_MSG = "deactivateBlackBgMode";
const CHANGE_STATE_MSG = "changeState";
const SAVE_PREVIEW_MSG = "savePreview";
const STOP_PREVIEW_MSG = "stopPreview";
const APPLY_ALL_MSG = "applyOnAllPages";
const NOT_APPLY_ALL_MSG = "notApplyOnAllPages";

const MODE_MESSAGES = new Map([[COLOR_MODE, COLOR_MSG], [RANDOM_MODE, COLOR_MSG], [CYCLE_MODE, CYCLE_MSG], [NOCOLOR_MODE, NO_COLOR_MSG]]);

const PIN_ICON = `<input style="display: none; position: relative; bottom: 29px; left: 4px;" id="save_randomColor" type="image" src="../icons/pin_2.png" title="Delete settings"></input>`;

// Not used
const SAVED_PAGE_DIV_TEMPLATE = 
`<div class="saved_page" id="page_DOMAIN_WITH_FORMAT">
    <a href="http://DOMAIN_NO_WWW" class="site_domain">DOMAIN_NO_WWW</a>
    <div class="right">
        <label class="switch" id="lbl_DOMAIN_WITH_FORMAT"><input type="checkbox" id="switch_DOMAIN_WITH_FORMAT" data-domain="DOMAIN_NO_WWW">
        <span class="slider round"></span></label>

        <input id="color_DOMAIN_WITH_FORMAT" type="color" data-domain="DOMAIN_WITH_FORMAT" data-selection=${BACKGROUND}>
        <input id="color_text_DOMAIN_WITH_FORMAT" type="color" data-domain="DOMAIN_WITH_FORMAT" data-selection=${TEXT}>
        <input id="color_ulink_DOMAIN_WITH_FORMAT" type="color" data-domain="DOMAIN_WITH_FORMAT" data-selection=${ULINK}>
        <input id="color_vlink_DOMAIN_WITH_FORMAT" type="color" data-domain="DOMAIN_WITH_FORMAT" data-selection=${VLINK}>

        <input id="remove_DOMAIN_WITH_FORMAT" type="image" src="../icons/delete.png">
    </div>
</div>`
//

const ENABLE_RADIO_BUTTONS =
`<div class="cc-selector">
    <input id="enable-never_DOMAIN_WITH_FORMAT||url||__URL__" type="radio" name="enable_DOMAIN_WITH_FORMAT||url||__URL__" data-state=${ENABLE_NEVER}>
    <label class="drinkcard-cc enable_never" for="enable-never_DOMAIN_WITH_FORMAT||url||__URL__" title="${TRANSLATIONS.get("title_enable_never")}"></label>

    <input id="enable-everywhere_DOMAIN_WITH_FORMAT||url||__URL__" type="radio" name="enable_DOMAIN_WITH_FORMAT||url||__URL__" data-state=${ENABLE_ONLY_EVERYWHERE}>
    <label class="drinkcard-cc enable_only_everywhere" for="enable-everywhere_DOMAIN_WITH_FORMAT||url||__URL__" title="${TRANSLATIONS.get("title_enable_everywhere")}"></label>

    <input id="enable-custom_DOMAIN_WITH_FORMAT||url||__URL__" type="radio" name="enable_DOMAIN_WITH_FORMAT||url||__URL__" data-state=${ENABLE_CUSTOM}>
    <label class="drinkcard-cc enable_custom" for="enable-custom_DOMAIN_WITH_FORMAT||url||__URL__" title="${TRANSLATIONS.get("title_enable_custom")}"></label>
</div>`

const SAVED_PAGE_TR_TEMPLATE = 
`<tr class="saved_page" id="page_DOMAIN_WITH_FORMAT||url||__URL__" data-domain="DOMAIN_WITH_FORMAT" data-url="__URL__" style="display:none">
    <td><a href="http://DOMAIN_NO_WWW" class="site_domain" title="http://DOMAIN_NO_WWW">DOMAIN_NO_WWW</a></td>
    <td><a href="http://DOMAIN_NO_WWW/__URL__" class="site_url" title="http://DOMAIN_NO_WWW/__URL__">__URL__</a></td>
    <td>${ENABLE_RADIO_BUTTONS}</td>
    <td><input id="color_DOMAIN_WITH_FORMAT||url||__URL__" type="color" data-site="DOMAIN_NO_WWW||url||__URL__" data-selection=${BACKGROUND}></td>
    <td><input id="color_text_DOMAIN_WITH_FORMAT||url||__URL__" type="color" data-site="DOMAIN_NO_WWW||url||__URL__" data-selection=${TEXT}></td>
    <td><input id="color_ulink_DOMAIN_WITH_FORMAT||url||__URL__" type="color" data-site="DOMAIN_NO_WWW||url||__URL__" data-selection=${ULINK}></td>
    <td><input id="color_vlink_DOMAIN_WITH_FORMAT||url||__URL__" type="color" data-site="DOMAIN_NO_WWW||url||__URL__" data-selection=${VLINK}></td>
    <td><input id="remove_DOMAIN_WITH_FORMAT||url||__URL__" type="image" src="../icons/delete.png" title="${TRANSLATIONS.get("title_delete_site")}"></td>
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
var allSites;

var differentSavedDomains = new Set();

var notHidePalette = false;
var previewColorJustSet = false;
var copyStep = 0;
var funCounter = 0;

$(document).ready(function () {

    localizeAllTexts();
    chrome.storage.sync.get('itEverywhere', function (resultItEverywhere) {
        if (resultItEverywhere.itEverywhere === true) {
            $("#btn_all")[0].checked = true;
            $("label[for='btn_all'").removeClass("opacity_25");
        }
    });

    // Add current domain or URL buttons
    $('#btn_add_domain').click(function () { addNewSelectedPage() } );
    $('#btn_add_url').click(function () { addNewSelectedPage(true) } );

    // Apply on all pages button
    $('#btn_all').change(applyOnAllPages);
    
    // Copy buttons
    $('#btn_copy_settings').click(initSettingsCopy);
    $('#acceptBtn_copy').click(exeCopy);
    $('#cancelBtn_copy').click(hideCopyGuidelines);

    // Display all sites' row info when hovering on its first 3 cells (domain, path and enabling)
    var hoverTimeout;
    
    $(".all_row td:eq(0), .all_row td:eq(1), .all_row td:eq(2)").hover(
        (e) => {
            $(e.target).addClass("td_hover");

            hoverTimeout = setTimeout(() => {
                if ($(".td_hover").length > 0) {
                    $(".all_row td").animate({"padding-bottom":"40px"}, 200);
                    setTimeout(() => {
                        if ($(".tr_hover").length > 0 || $(".td_hover").length > 0)
                        $(".tooltiptext").css("visibility", "visible");
                    }, 100); 
                }
            }, 500);
        }, () => {
            clearTimeout(hoverTimeout);
            $(".td_hover").removeClass("td_hover");
            
            if (!$(".all_row").hasClass("tr_hover"))  {
                $(".all_row td").animate({"padding-bottom":"10px"}, 100);
                $(".tooltiptext").css("visibility", "hidden");
            }

        }
    );

    // Keep showing the info message if it's visible and the user doesn't leave this row
    $(".all_row").hover(
        () => {
            $(".all_row").addClass("tr_hover");
        }, () => {
            $(".all_row").removeClass("tr_hover");
            $(".all_row td").animate({"padding-bottom":"10px"}, 100);
            $(".tooltiptext").css("visibility", "hidden");
        }
    );


//#region Initialize color palette

    $("#showInput").spectrum({
        preferredFormat: "hex", // Avoid color names
        showInput: true,
        showPalette: false,
        containerClassName: 'palette_bgColor'
    });

    $("#showInput").on('hide.spectrum', function(e, tinycolor) {
        if (notHidePalette)
            $("#showInput").spectrum("show");
    }).on('move.spectrum', function(e, color) {
        if (!previewColorJustSet) {
            previewColorJustSet = true;
            if (color) 
                if (color._a != 1) // RGBA color (transparency)
                    siteColorPreview(RGBAToHexA(color.toRgbString()).replace("#", ""));
                else
                    siteColorPreview(color.toHexString());
            setTimeout(() => {
                previewColorJustSet = false;
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

    // Add button to save random color as selected
    $(".sp-input-container").append(PIN_ICON);
    $("#save_randomColor").click(setRandomColorAsSelected_Preview);

// #endregion

    // Delete pop-up buttons
    $("#acceptBtn_delete").click(deleteSelectedPage);
    $("#cancelBtn_delete").click(()=> {
        let id = $("[data-delete]").attr("id").replace("page_", "");
        $(`[id='remove_${id}']`).focus();
        $("#delete_modal").hide();
    })

    setNextFocusElement($("#cancelBtn_delete"), $("#acceptBtn_delete"));

    // Hide palette when the user clicks out of it
    $("#color_selector_modal").mousedown(function(event) {
        if ($("#color_selector").is(":visible"))
            if ($("#color_selector, .sp-container").find(event.target).length == 0 && !$(event.target).is($("#color_selector, .sp-container, input[data-selection]"))) {
                closePaletteModal();
        }
    });

    // Hide deletion's pop-up
    $("#delete_modal").mousedown(function(event) {
        if ($("#delete_confirm").is(":visible"))
            if ($("#delete_confirm").find(event.target).length == 0 && !$(event.target).is($("#delete_confirm"))) {
                $("#delete_modal").hide();
        }
    });

    // Show the pages that are currently selected
    setTimeout(() => {
        chrome.storage.sync.get(["allSites", "sitesEnabled", "sitesBackground", "sitesText", "sitesULinks", "sitesVLinks"], function (result) {

            if (result.allSites) {

                allSites = result.allSites;
                let allSitesSettings = result.allSites.split(HAPPY_FACE_SEPARATOR);

                let site = "all";

                let siteEnabled = allSitesSettings[0] === "enabled";
                let siteBackground = allSitesSettings[1].split("/blv_ck_bg/");
                let siteText = allSitesSettings[2].split("/blv_ck_bg/");
                let siteULinks = allSitesSettings[3].split("/blv_ck_bg/");
                let siteVLinks = allSitesSettings[4].split("/blv_ck_bg/");

                let background = { mode: siteBackground[0], value: siteBackground.length == 2 ? siteBackground[1] : ''}
                let text = { mode: siteText[0], value: siteText.length == 2 ? siteText[1] : ''}
                let ulink = { mode: siteULinks[0], value: siteULinks.length == 2 ? siteULinks[1] : ''}
                let vlink = { mode: siteVLinks[0], value: siteVLinks.length == 2 ? siteVLinks[1] : ''}

                initializeInputs(site, "", siteEnabled, background, text, ulink, vlink)

            }


            if (result.sitesEnabled) {

                [sitesEnabled, sitesBackground, sitesText, sitesULinks, sitesVLinks] = [result.sitesEnabled, result.sitesBackground, result.sitesText, result.sitesULinks, result.sitesVLinks];

                // Display every page name with their own toggle switch and color inputs
                for (let i = 0; i < sitesEnabled.length; i++) {

                    let site = sitesEnabled[i].split("/blv_ck_bg/")[0]
                    let isUrl = site.includes("||url||");
                    site = { domain: isUrl ? site.split("||url||")[0] : site, url: isUrl ? site.split("||url||")[1] : "" };

                    let siteEnabled = sitesEnabled[i].split("/blv_ck_bg/")[1];
                    let siteBackground = sitesBackground[i].split("/blv_ck_bg/");
                    let siteText = sitesText[i].split("/blv_ck_bg/");
                    let siteULinks = sitesULinks[i].split("/blv_ck_bg/");
                    let siteVLinks = sitesVLinks[i].split("/blv_ck_bg/");

                    let background = { mode: siteBackground[1], value: siteBackground.length == 3 ? siteBackground[2] : ''}
                    let text = { mode: siteText[1], value: siteText.length == 3 ? siteText[2] : ''}
                    let ulink = { mode: siteULinks[1], value: siteULinks.length == 3 ? siteULinks[2] : ''}
                    let vlink = { mode: siteVLinks[1], value: siteVLinks.length == 3 ? siteVLinks[2] : ''}

                    addSelectedPageToPopup(site, siteEnabled, background, text, ulink, vlink);
                }
            }

            // If there are saved settings for the tab's site where the pop-up has been opened, and these contain some random mode, the currently displayed colors are requested.
            

        });

    }, 1);

    // window.onblur(function () {
    //     closePaletteModal();
    // });

});

function addNewSelectedPage(isUrl) {
    // Get current tab's URL, register it with chrome.storage and send message to all tabs to notify the addition
    chrome.tabs.query({ active: true, currentWindow: true, 'windowId': chrome.windows.WINDOW_ID_CURRENT }, function (tabs) {
        let url = new URL(tabs[0].url);
        let hrefNoOrigin = url.href.replace(url.origin, "").substring(1);
        let site = url.hostname + (isUrl && hrefNoOrigin ? `||url||${hrefNoOrigin}` : "");
        site = site.replace("www.", "");

        // Avoid adding the same site twice
        if (!sitesEnabled.find(page_info => page_info.split("/blv_ck_bg/")[0] === site)) {

            // Default new values
            sitesEnabled.push([site, "enabled"].join("/blv_ck_bg/"));
            sitesBackground.push([site, DEFAULT_BACKGROUND.mode, DEFAULT_BACKGROUND.value].join("/blv_ck_bg/"));
            sitesText.push([site, DEFAULT_TEXT.mode, DEFAULT_TEXT.value].join("/blv_ck_bg/"));
            sitesULinks.push([site, DEFAULT_ULINK.mode].join("/blv_ck_bg/"));
            sitesVLinks.push([site, DEFAULT_VLINK.mode].join("/blv_ck_bg/"));

            // Sites alphabetically ordered (host > URL)
            [sitesEnabled, sitesBackground, sitesText, sitesULinks, sitesVLinks].map(function (siteList) {
                siteList.sort(function (c1, c2) {
                    return c1.replace("www.", "").localeCompare(c2.replace("www.", ""));
                });
            });

            site = { domain: site.includes("||url||") ? site.split("||url||")[0] : site, url: site.includes("||url||") ? site.split("||url||")[1] : "" };

            chrome.storage.sync.set({
                "sitesEnabled": sitesEnabled, "sitesBackground": sitesBackground, "sitesText": sitesText, "sitesULinks": sitesULinks, "sitesVLinks": sitesVLinks },
                function () {addSelectedPageToPopup(site, true, DEFAULT_BACKGROUND, DEFAULT_TEXT, DEFAULT_ULINK, DEFAULT_VLINK);
            })

        } else {
            if (!$(`[id='switch_${site}']`).prop("checked"))
                $(`[id='switch_${site}']`).prop("checked", true);

            $(`[id='page_${site}'] .site_domain, [id='page_${site}'] .site_url`).removeClass("highlight_3s_blue");
            setTimeout(() => {
                $(`[id='page_${site}'] .site_domain, [id='page_${site}'] .site_url`).addClass("highlight_3s_blue");
            });
        }

        sendMessageToContentScripts(ACTIVATE_MSG, site);
    });
}

function openSettingsTab() {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL('options.html'));
    }
}

function onColorInputClick (event, input) {

    event.preventDefault();

    switch (copyStep) {
        case 1:
            $(".selected_from_copy").removeClass("selected_from_copy");
            $(input).addClass("selected_from_copy");
            $(".copy_guide_text").text(TRANSLATIONS.get("lbl_select_copy_to"));

            copyStep = 2;
            funCounter = 0;
            break;

        case 2:

            if (!$(input).hasClass("selected_from_copy")) {
                $(input).toggleClass("selected_to_copy");
                if ($(".selected_to_copy").length > 0) {
                    $(".copy_guide_text").html(`The copy will be executed when you press on the &#10004; button.`); // ✔
                    $("#acceptBtn_copy").show();
                } else {
                    $(".copy_guide_text").text(funCounter >= 50 ? "Are you having fun?" : "Select the colors/modes where you want to apply the copy.");
                    $("#acceptBtn_copy").hide();
                }
            }
            funCounter++;
            break;
    
        default:
            openPaletteModal(input);
            break;
    }

}

function openPaletteModal(input) {

    let site = $(input).attr("data-site").replaceAll("-", ".").replace("||url||", "/");
    let selection = $(input).attr("data-selection");
    let mode = $(input).attr("data-mode");

    if (mode === RANDOM_MODE) getCurrentRandomColor(site, selection);

    // Increase body's height so the modal can fit in
    let current_body_height = parseFloat($("body").css("height").replace("px", ""));
    if (current_body_height < 580) {
        $("body").attr("data-height", current_body_height);
        $("body").css("height", 580);
    }

    // Indicate which color is being selected
    $(input).attr("data-palette", "open");

    // Show what selection is being made in pop-up
    if (site === "all")
        $(".popup_title h2").text(TRANSLATIONS.get("lbl_popup_color_selector_all_sites")).removeAttr("href").attr("style", "cursor:default; text-decoration:none;");
    else
        $(".popup_title h2").text(site).attr("href", `http://${site}`).removeAttr("style");

    $(".popup_title h3").text(`${TRANSLATIONS.get("lbl_popup_color_selector_choose")} ${TRANSLATIONS.get(`lbl_popup_color_selector_${selection}`)}.`);

    // Set palette to site's custom color
    if ($(input).val() && mode === COLOR_MODE)
        $("#showInput").spectrum("set", $(input).attr("data-color").length == 8 ? `${hexAToRGBA('#' + $(input).attr("data-color"))}` : `#${$(input).attr("data-color")}`);
    else if (mode === NOCOLOR_MODE)
        $(".sp-input").val("No selected color.")
    else if (mode === CYCLE_MODE)
        $("#cycle_speed").val($(input).attr("data-cycle_speed"));

    $("#color_selector_modal").show();
    notHidePalette = true;

    visualizeSelectedMode(mode);

    calculateOptimalCycleRateAndSetInputTitle();

    setTimeout(() => {
        // Adjust palette's position
        $("#showInput").click();
        
        // Set focus on pop-up
        $(".text_ellipsis").focus();

        // let topDiff = parseInt($(".sp-container").css("top").replace("px", "")) - $("body")[0].scrollTop;
        // $(".sp-container").css("position", "fixed").css("top", topDiff);

    }, 1);

}

function closePaletteModal(saveChanges) {
    notHidePalette = false;

    // Adjust pop-up size
    if ($("body").attr("data-height")) {
        $("body").css("height", $("body").attr("data-height"));
        $("body").removeAttr("data-height");
    }

    // Send message to stop preview (apply changes in webpage if accept button has been pressed)
    let site = $("input[data-palette='open']").attr("data-site").replaceAll("-", ".");
    let selection = $("input[data-palette='open']").attr("data-selection");

    sendMessageToContentScripts(saveChanges ? SAVE_PREVIEW_MSG : STOP_PREVIEW_MSG, site, selection);

    // Hide palette and modal
    cycleSelected = false;
    $("input[data-palette='open']").focus().removeAttr("data-palette");
    $("#showInput").click();
    $("#color_selector_modal").hide();
}

function applyOnAllPages() {
    chrome.storage.sync.set({'itEverywhere': this.checked}, function() { });

    if (this.checked)
        sendMessageToContentScripts(APPLY_ALL_MSG);
    else
        sendMessageToContentScripts(NOT_APPLY_ALL_MSG);

}

function initSettingsCopy() {
    copyStep = 1;

    $(".left_tools, #btn_copy_settings").stop(true, true).hide();
    $("#cancelBtn_copy").show();
    $(".right_tools > div").show( "fade", '', 500 );

    let cellFromColumnSelector = "table tr td:nth-child(NUM), table tr th:nth-child(NUM)";
    $(`${cellFromColumnSelector.replaceAll("NUM", "1")}, ${cellFromColumnSelector.replaceAll("NUM", "2")}, ${cellFromColumnSelector.replaceAll("NUM", "3")}, ${cellFromColumnSelector.replaceAll("NUM", "8")}`)
    // What is this? 🤣
    .addClass("semi_transparent");
}

function hideCopyGuidelines() {
    copyStep = 0;
    
    $("#cancelBtn_copy, #acceptBtn_copy, .right_tools > div").stop(true, true).hide();
    $(".left_tools, #btn_copy_settings").show( "fade", '', 500 );

    $(".selected_from_copy, .selected_to_copy").removeClass("selected_from_copy").removeClass("selected_to_copy");

    $(".semi_transparent").removeClass("semi_transparent");
} 

function exeCopy() {

    let inputFrom = $(".selected_from_copy");

    let value = inputFrom.val().replace('#', '');
    let cycleInterval = inputFrom.attr("data-cycle_speed");
    let mode = inputFrom.attr("data-mode");

    $(".selected_to_copy").each(function() {

        let inputTo = $(this);

        let site = inputTo.attr("data-site");
        let selection = inputTo.attr("data-selection");
        let index = getSiteIndex(site, selection);

        switch (selection) {

            case BACKGROUND:
    
                switch (mode) {
                    case COLOR_MODE:
                        sitesBackground[index] = [site, COLOR_MODE, value].join("/blv_ck_bg/");
                        break;
                        
                    case RANDOM_MODE:
                        sitesBackground[index] = [site, RANDOM_MODE].join("/blv_ck_bg/");
                        break;
    
                    case CYCLE_MODE:
                        sitesBackground[index] = [site, CYCLE_MODE, value].join("/blv_ck_bg/");
                        break;
    
                    case NOCOLOR_MODE:
                        sitesBackground[index] = [site, NOCOLOR_MODE].join("/blv_ck_bg/");
                        break;
                }
    
                break;
    
            case TEXT:
    
                switch (mode) {
                    case COLOR_MODE:
                        sitesText[index] = [site, COLOR_MODE, value].join("/blv_ck_bg/");
                        break;
                        
                    case RANDOM_MODE:
                        sitesText[index] = [site, RANDOM_MODE].join("/blv_ck_bg/");
                        break;
    
                    case CYCLE_MODE:
                        sitesText[index] = [site, CYCLE_MODE, value].join("/blv_ck_bg/");
                        break;
    
                    case NOCOLOR_MODE:
                        sitesText[index] = [site, NOCOLOR_MODE].join("/blv_ck_bg/");
                        break;
                }
                break;
    
            case ULINK:
    
                switch (mode) {
                    case COLOR_MODE:
                        sitesULinks[index] = [site, COLOR_MODE, value].join("/blv_ck_bg/");
                        break;
                        
                    case RANDOM_MODE:
                        sitesULinks[index] = [site, RANDOM_MODE].join("/blv_ck_bg/");
                        break;
    
                    case CYCLE_MODE:
                        sitesULinks[index] = [site, CYCLE_MODE, value].join("/blv_ck_bg/");
                        break;
    
                    case NOCOLOR_MODE:
                        sitesULinks[index] = [site, NOCOLOR_MODE].join("/blv_ck_bg/");
                        break;
                }
                break;
    
            case VLINK:
    
                switch (mode) {
                    case COLOR_MODE:
                        sitesVLinks[index] = [site, COLOR_MODE, value].join("/blv_ck_bg/");
                        break;
                        
                    case RANDOM_MODE:
                        sitesVLinks[index] = [site, RANDOM_MODE].join("/blv_ck_bg/");
                        break;
    
                    case CYCLE_MODE:
                        sitesVLinks[index] = [site, CYCLE_MODE, value].join("/blv_ck_bg/");
                        break;
        
                    case NOCOLOR_MODE:
                        sitesVLinks[index] = [site, NOCOLOR_MODE].join("/blv_ck_bg/");
                        break;
                }
                break;
    
        }

        // Set input's data or icon
        inputTo.val(`#${value}`);
        inputTo.attr("data-mode", mode);

        if (mode === CYCLE_MODE) 
            inputTo.attr("data-cycle_speed", cycleInterval);

        modifyInputDependingOnMode(inputTo);

        if (mode === RANDOM_MODE)
            value = getPaddedRandomHexColor();
        
        // Could be unified in only one message
        sendMessageToContentScripts(MODE_MESSAGES.get(mode), site, selection, value);
        sendMessageToContentScripts(SAVE_PREVIEW_MSG, site, selection);

    });

    saveSites();
    hideCopyGuidelines();
} 

function addSelectedPageToPopup(site, enabled, background, text, ulink, vlink) {

    let domain = site.domain;
    let isUrl = (site.url) ? true : false;

    let new_saved_page_elem_html = SAVED_PAGE_TR_TEMPLATE
    .replaceAll("DOMAIN_WITH_FORMAT", site.domain.replace("www.", ""))
    .replaceAll("DOMAIN_NO_WWW", site.domain.replace("www.", ""))
    .replaceAll("__URL__", site.url);

    if (!isUrl)
        new_saved_page_elem_html = new_saved_page_elem_html.replaceAll("||url||", "");

    site = `${site.domain}${isUrl ? `||url||${site.url}` : ""}`;

    let position_in_list = sitesEnabled.indexOf(sitesEnabled.find(page_info => page_info.includes (site.replace("www.", ""))));
    site = site.replace("www.", "");

    if (position_in_list == 0)
        $("#saved_sites").append(new_saved_page_elem_html);
    else
        $(".saved_page").eq(position_in_list - 1 + 1).after(new_saved_page_elem_html); // Skip all sites' row

        
    initializeInputs(site, domain, enabled, background, text, ulink, vlink)
    
}

function initializeInputs(site, domain, enabled, background, text, ulink, vlink) {

    switch (enabled) {
        case ENABLE_NEVER:
            $(`[id='enable-never_${site}']`)[0].checked = true;
            break;
        
        case ENABLE_ONLY_EVERYWHERE:
            $(`[id='enable-everywhere_${site}']`)[0].checked = true;
            break;

        case ENABLE_CUSTOM:
            $(`[id='enable-custom_${site}']`)[0].checked = true;
            break;
        
        case true:
            $("#switch_all")[0].checked = true;    

        default:
            break;
    }
    
    $(`[id='page_${site}']`).show("fast");

    // Assign values and modes to inputs
    $(`[id='color_${site}']`).attr("data-mode", background.mode);
    $(`[id='color_text_${site}']`).attr("data-mode", text.mode);
    $(`[id='color_ulink_${site}']`).attr("data-mode", ulink.mode);
    $(`[id='color_vlink_${site}']`).attr("data-mode", vlink.mode);

    // Modify input in case of selected extra mode (random, cycle, no color)
    $(`[id='color_${site}'], [id='color_text_${site}'], [id='color_ulink_${site}'], [id='color_vlink_${site}']`).each(function () { 
        modifyInputDependingOnMode($(this)); 
    })

    if (background.value)
        if (background.mode === COLOR_MODE)
            $(`[id='color_${site}']`).val(`#${background.value.substring(0,6)}`).attr("title", `#${background.value}`).attr("data-color", background.value);
        else if (background.mode === CYCLE_MODE)       
            $(`[id='color_${site}']`).val(background.value).attr("data-cycle_speed", background.value);

    if (text.value)
        if (text.mode === COLOR_MODE)
            $(`[id='color_text_${site}']`).val(`#${text.value.substring(0,6)}`).attr("title", `#${text.value}`).attr("data-color", text.value);
        else if (text.mode === CYCLE_MODE)
            $(`[id='color_text_${site}']`).val(text.value).attr("data-cycle_speed", text.value);

    if (ulink.value)
        if (ulink.mode === COLOR_MODE)
            $(`[id='color_ulink_${site}']`).val(`#${ulink.value.substring(0,6)}`)
        else if (ulink.mode === CYCLE_MODE)
            $(`[id='color_ulink_${site}']`).val(ulink.value).attr("data-cycle_speed", ulink.value);

    if (vlink.value)
        if (vlink.mode === COLOR_MODE)
            $(`[id='color_vlink_${site}']`).val(`#${vlink.value.substring(0,6)}`)
        else if (vlink.mode === CYCLE_MODE)
            $(`[id='color_vlink_${site}']`).val(vlink.value).attr("data-cycle_speed", vlink.value);

    // Open palette when any of the inputs is clicked
    
    // $(`#color_${site}, #color_text_${site}, #color_ulink_${site}, #color_vlink_${site}`).click(openPaletteModal);
    $(`[id='color_${site}'], [id='color_text_${site}'], [id='color_ulink_${site}'], [id='color_vlink_${site}']`).click(function (event) {
        onColorInputClick(event, this);
    });

    if (site === "all") {
        
        // Save enabled/disabled option for selected pages on switch interaction
        $("#switch_all").bind('change', (delayFunction(enableDisableEverywhere, 1)))
        // Apply focus style to label when input is focused
        .focus(() => { $("[for='switch_all']").addClass("focus_border"); })
        .blur(() => { $("[for='switch_all']").removeClass("focus_border"); })
        return;
    }

    // Focus style on labels
    $(`[id='enable-never_${site}']`).focus(() => { $(`[for='enable-never_${site}']`).addClass("focus_border"); }).blur(() => { $(`[for='enable-never_${site}']`).removeClass("focus_border"); })
    $(`[id='enable-everywhere_${site}']`).focus(() => { $(`[for='enable-everywhere_${site}']`).addClass("focus_border"); }).blur(() => { $(`[for='enable-everywhere_${site}']`).removeClass("focus_border"); })
    $(`[id='enable-custom_${site}']`).focus(() => { $(`[for='enable-custom_${site}']`).addClass("focus_border"); }).blur(() => { $(`[for='enable-custom_${site}']`).removeClass("focus_border"); })

    // Change enable state
    $(`[name='enable_${site}']`).change((e) => changeEnableState(e.currentTarget, site));

    // Open site in new tab when URL is clicked
    $(`[id='page_${site}'] .site_domain`).click(openSiteInNewTab);
    $(`[id='page_${site}'] .site_url`).click(openSiteInNewTab);

    // Delete selected page from list (pop-up and storage; asks for confirmation)
    $(`[id='remove_${site}']`).click(function () {
        showDeleteConfirmationPopup($(this).closest("tr"));
    });

    // Modify domain cells' appearance if they belong to a site whose domain has saved settings.
    $(`tr[data-domain='${domain}']`).each(function () {
        if (this.id.includes("||url||"))
            // Check if there are saved settings for the domain
            if ($(`[id='page_${domain}']`).length > 0)
                $(this).find("td").eq(0).addClass("url_saved_domain");
            else
                $(this).find("td").eq(0).removeClass("url_saved_domain");
    });

}

function modifyInputDependingOnMode (input) {
    switch (input.attr("data-mode")) {
        case COLOR_MODE:
            input.attr("type", "color").removeAttr("src").removeClass("input_extra_mode");
            input.attr("title", `#${input.attr("data-color")}`);
            break;
            
        case RANDOM_MODE:
            input.attr("type", "image").attr("src", "../icons/random_2.png").addClass("input_extra_mode");
            input.attr("title", TRANSLATIONS.get("title_input_random"));
            break;
            
        case CYCLE_MODE:
            input.attr("type", "image").attr("src", "../icons/cycle_2.png").addClass("input_extra_mode");
            input.attr("title", TRANSLATIONS.get("title_input_cycle"));
        break;

        case NOCOLOR_MODE:
            input.attr("type", "image").attr("src", "../icons/nocolor_2.png").addClass("input_extra_mode");
            input.attr("title", TRANSLATIONS.get("title_input_nocolor"));
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

function getCurrentRandomColor(site, selection) {

    // If the selected input belongs to the site where the pop-up is being visualized, get color from it.
    chrome.tabs.query({ active: true, currentWindow: true }, function (currentTab) {

        if (currentTab[0].url.includes(site)) {
            chrome.tabs.sendMessage(currentTab[0].id, { action: "getCurrentColor", selection: selection }, function (response) { 
                if (response && response.currentColor) {
                    $("#showInput").spectrum("set", `${response.currentColor}`);
                    $(".sp-input").val(response.currentColor);
                    $("#save_randomColor").show();
                }
            });
            return;

        } else {

            // Check if the site is opened in this moment in one or more tabs. If so, get the color from the last one of them.
            let urls = [];

            if (site.domain) 
                site = [site.domain, site.url];
            else
                site = site.split("||url||");
            
            urls.push( site.length > 1 ? `http://*.${site[0]}/${site[1]}` : `http://*.${site[0]}/*` );
            urls.push( site.length > 1 ? `https://*.${site[0]}/${site[1]}` : `https://*.${site[0]}/*` );
        
            chrome.tabs.query({ url: urls }, function (tabs) {

                if (tabs.length == 0) 
                    return;

                let lastTabId = tabs[tabs.length-1].id;
                    chrome.tabs.sendMessage(lastTabId, { action: "getCurrentColor", selection: selection }, function (response) { 
                        if (response && response.currentColor) {
                            $("#showInput").spectrum("set", `${response.currentColor}`);
                            $(".sp-input").val(response.currentColor);
                            $("#save_randomColor").show();
                        }
                    });
            });

            chrome.tabs.query({ active: true, currentWindow: true }, function (currentTab) {
                debugger;
            });

        }

    });

}

function enableDisableEverywhere() {

    let allSitesSettings = allSites.split(HAPPY_FACE_SEPARATOR);
    let enable = $(this)[0].checked;

    allSites = [(enable ? "enabled" : "disabled"), allSitesSettings.slice(1, allSitesSettings.length).join(HAPPY_FACE_SEPARATOR)].join(HAPPY_FACE_SEPARATOR);

    saveSites('', true);
    // sendMessageToContentScripts(enabled ? ACTIVATE_MSG : DEACTIVATE_MSG, site);
}

function changeEnableState(input, site) {

    let state = $(input).attr("data-state");
    let index = getSiteIndex(site, ENABLED);

    sitesEnabled[index] = [site, state].join("/blv_ck_bg/");

    saveSites(ENABLED);
    sendMessageToContentScripts(CHANGE_STATE_MSG, site);

}

function showDeleteConfirmationPopup(site_tr) {

    let domain = $(site_tr).attr("data-domain");
    let url = $(site_tr).attr("data-url");
    
    // Indicate which color is being selected
    $("[data-delete]").removeAttr("data-delete");
    $(site_tr).attr("data-delete", "open");
    
    // Show selected page's info in pop-up
    $("#domain_delete").html(domain);
    
    if (url) {
        $("#delete_confirm").removeClass("modal_delete_onlyDomain").addClass("modal_delete_domainAndUrl");
        
        $("#url_delete").html(url);
        $("#url_delete").closest("p").show();
    }
    else {
        $("#delete_confirm").removeClass("modal_delete_domainAndUrl").addClass("modal_delete_onlyDomain");
        $("#url_delete").closest("p").hide();
    }
    
    $("#delete_modal").show();
    $("#delete_confirm").find(".box_buttons").children().eq(1).focus();

}

function deleteSelectedPage() {
    
    let domain = $("[data-delete]").attr("data-domain").replaceAll("-", ".");
    let url = $("[data-delete]").attr("data-url").replaceAll("-", ".");

    let site = domain + (url ? `||url||${url}` : "");

    sitesEnabled = sitesEnabled.filter(page_info => page_info.split("/blv_ck_bg/")[0] !== site);
    sitesBackground = sitesBackground.filter(page_info => page_info.split("/blv_ck_bg/")[0] !== site);
    sitesText = sitesText.filter(page_info => page_info.split("/blv_ck_bg/")[0] !== site);
    sitesULinks = sitesULinks.filter(page_info => page_info.split("/blv_ck_bg/")[0] !== site);
    sitesVLinks = sitesVLinks.filter(page_info => page_info.split("/blv_ck_bg/")[0] !== site);

    chrome.storage.sync.set({
        "sitesEnabled": sitesEnabled, "sitesBackground": sitesBackground, "sitesText": sitesText, "sitesULinks": sitesULinks, "sitesVLinks": sitesVLinks },
        function () { 
            $(`tr[id='page_${site}']`).remove();

            // Modify domain cells' appearance if they belong to a site whose domain has saved settings.
            $(`tr[data-domain='${domain}']`).each(function () {
                if (this.id.includes("||url||"))
                    // Check if there are saved settings for the domain
                    if ($(`[id='page_${domain}']`).length > 0)
                        $(this).find("td").eq(0).addClass("url_saved_domain");
                    else
                        $(this).find("td").eq(0).removeClass("url_saved_domain");
            });

            $("#delete_confirm").hide();
        }
    );

    sendMessageToContentScripts(DEACTIVATE_MSG, site);
}

function saveSites(type, allSitesSettings) {

    if (allSitesSettings) {
        chrome.storage.sync.set(
            {"allSites": allSites},
            function () { console.log();
        });
        return;
    }

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

function sendMessageToContentScripts(action, site, selection, value) {

    if (site === "all") { // Send to all active tabs (action on general settings)

        chrome.tabs.query({ active: true }, function (tabs) {
            for (var i = 0, length = tabs.length; i < length; i++) {
                chrome.tabs.sendMessage(tabs[i].id, { site: site, action: action + "_ALL", selection:selection, value: value  }, function () { });
            }
        });

    } else { 

        let urls = [];
    
        if (site.domain) 
            site = [site.domain, site.url];
        else
            site = site.split("||url||");
        
        urls.push( site.length > 1 ? `http://*.${site[0]}/${site[1]}` : `http://*.${site[0]}/*` );
        urls.push( site.length > 1 ? `https://*.${site[0]}/${site[1]}` : `https://*.${site[0]}/*` );
    
        chrome.tabs.query({ url: urls }, function (tabs) {
            for (var i = 0, length = tabs.length; i < length; i++) {
                chrome.tabs.sendMessage(tabs[i].id, { site: site, action: action, selection:selection, value: value  }, function () { });
            }
        });

    }

}

function getSiteIndex(site, selection) {

    switch (selection) {

        case ENABLED:
            return sitesEnabled.indexOf(sitesEnabled.find(page_info => page_info.includes(site)));

        case BACKGROUND:
            return sitesBackground.indexOf(sitesBackground.find(page_info => page_info.includes(site)));

        case TEXT:
            return sitesText.indexOf(sitesText.find(page_info => page_info.includes(site)));

        case ULINK:
            return sitesULinks.indexOf(sitesULinks.find(page_info => page_info.includes(site)));

        case VLINK:
            return sitesVLinks.indexOf(sitesVLinks.find(page_info => page_info.includes(site)));

        default:
            return sitesEnabled.indexOf(sitesEnabled.find(page_info => page_info.includes(site)));


    }

}











