const RANDOM_SVG =
`<svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="32.000000pt" height="32.000000pt" viewBox="0 0 32.000000 32.000000" preserveAspectRatio="xMidYMid meet" style="height:32px; width:32px">
<g transform="translate(0.000000,32.000000) scale(0.100000,-0.100000)" fill="white" stroke="none">
<path d="M0 160 l0 -160 160 0 160 0 0 160 0 160 -160 0 -160 0 0 -160z m310 0 l0 -150 -150 0 -150 0 0 150 0 150 150 0 150 0 0 -150z"/>
<path d="M109 214 c-10 -13 -10 -17 2 -25 21 -13 32 -11 25 6 -3 9 0 15 9 15 24 0 27 -19 9 -50 -23 -37 -11 -51 15 -19 28 33 35 57 21 74 -16 20 -64 19 -81 -1z"/>
<path d="M130 100 c0 -5 9 -10 20 -10 11 0 20 5 20 10 0 6 -9 10 -20 10 -11 0 -20 -4 -20 -10z"/>
</g>
</svg>`

const CYCLE_SVG =
    `<svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="32.000000pt" height="32.000000pt" viewBox="0 0 240.000000 240.000000" preserveAspectRatio="xMidYMid meet" style="height:32px; width:32px">
<g transform="translate(0.000000,240.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
<path d="M0 1200 l0 -1200 1200 0 1200 0 0 1200 0 1200 -1200 0 -1200 0 0 -1200z m2370 5 l0 -1165 -1170 0 -1170 0 0 1165 0 1165 1170 0 1170 0 0 -1165z" fill="white"/>
<path d="M1082 1909 c-137 -23 -270 -90 -377 -191 l-64 -60 -53 29 c-59 33 -86 33 -92 0 -3 -12 -8 -102 -11 -200 -7 -182 -3 -207 32 -207 7 0 90 41 184 91 158 85 170 94 167 118 -2 17 -17 35 -47 55 l-45 30 49 43 c315 277 802 130 919 -278 8 -30 24 -63 34 -72 25 -23 74 -21 103 2 31 25 30 72 -4 169 -114 326 -454 528 -795 471z"/>
<path d="M519 1131 c-31 -25 -30 -72 4 -169 37 -108 82 -177 172 -267 90 -90 159 -135 264 -171 260 -90 534 -32 736 158 l65 60 44 -26 c52 -30 82 -33 94 -8 13 23 21 376 10 396 -5 9 -17 16 -27 16 -25 0 -333 -165 -348 -187 -19 -26 -17 -30 39 -70 l51 -37 -48 -43 c-315 -277 -803 -129 -919 278 -8 30 -24 63 -34 72 -25 23 -74 21 -103 -2z"/>
</g>
</svg>`

const NO_COLOR_ICON = `url('data:image/png;base64,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')`
const NO_COLOR_ICON_SELECTED = `url('data:image/png;base64,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')`

// #region Functions employed to manipulate colors and their formats

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function addHexColor(c1, c2) {
    var hexStr = (parseInt(c1, 16) + parseInt(c2, 16)).toString(16);
    while (hexStr.length < 6) { hexStr = '0' + hexStr; } // Zero pad.
    return hexStr;
}

function toPaddedHexString(num, len) {
    str = num.toString(16);
    return "0".repeat(len - str.length) + str;
}

// #endregion

// #region Modal's elements effects
var cycle_interval = 1;

function initializeCycleIcon() {
    
    cycleIcon($(".cycle_div > * path").eq(1), 0xff0000, 1);

    setTimeout(() => {
        cycleIcon($(".cycle_div > * path").eq(2), 0xff0000, 1);
    }, 500);
}

function cycleIcon(path, hex, step) {

    [step, hex] = stepOperation(step, hex);

    let paddedHexString = toPaddedHexString(hex.toString(16), 6);
    path.attr("fill", `#${paddedHexString}`);

    setTimeout(() => {
        cycleIcon(path, hex, step)
    }, cycle_interval);

}

function stepOperation (step, hex) {

    switch (step) {

        case 1:
            // From #ff0000 to #ff00ff
            hex += 0x000001;
            if (hex == 0xff00ff) step = 2;
            break;

        case 2:
            // From #ff00ff to #0000ff
            hex -= 0x010000;
            if (hex == 0x0000ff) step = 3;
            break;

        case 3:
            // From #0000ff to #00ffff
            hex += 0x000100;
            if (hex == 0x00ffff) step = 4;
            break;

        case 4:
            // From #00ffff to #00ff00
            hex -= 0x000001;
            if (hex == 0x00ff00) step = 5;
            break;

        case 5:
            // From #00ff00 to #ffff00
            hex += 0x010000;
            if (hex == 0xffff00) step = 6;
            break;

        case 6:
            // From #ffff00 to #ff0000
            hex -= 0x000100;
            if (hex == 0xff0000) step = 1;
            break;

    }

    return [step, hex];

}

function paintRandomIcon(e) {
    // $(this).find("path").eq(0).css("fill", getPaddedRandomHexColor());
    let rndColor = getPaddedRandomHexColor();
    $("#color_selector .random_div").find("path").eq(1).css("fill", rndColor);
    $("#color_selector .random_div").find("path").eq(2).css("fill", rndColor);
    return rndColor;
}

function calculateOptimalCycleRateAndSetInputTitle () {
    let estimatedSeconds = (255 * 6 * parseInt($("#cycle_speed").val())) / 1000;
    let nearestTen = Math.ceil(estimatedSeconds / 10) * 10;
    $("#cycle_speed").attr("title", TRANSLATIONS.get("lbl_popup_color_selector_optimal_cycle_speed").replace("_SECONDS_", nearestTen));
}

// #endregion

// #region Site color changes, save modifications, preview

var randomColorSelected, cycleSelected = false;

function getSelectionAndSetIt() {

    let input = $("input[data-palette='open']");

    let site = input.attr("data-site");
    let color = $(".sp-input").val().replace('#', '');
    if (color.startsWith("rgba")) color = RGBAToHexA(color);
    color = color.replace('#', '');
    let cycleInterval = $("#cycle_speed").val();

    let selection = input.attr("data-selection");
    let mode = $(".mode_selected").attr("data-mode");

    if (site !== "all") {

        let index = getSiteIndex(site, selection);

        switch (selection) {
    
            case BACKGROUND:
    
                switch (mode) {
                    case COLOR_MODE:
                        sitesBackground[index] = [site, COLOR_MODE, color].join("/blv_ck_bg/");
                        break;
                        
                    case RANDOM_MODE:
                        sitesBackground[index] = [site, RANDOM_MODE].join("/blv_ck_bg/");
                        break;
    
                    case CYCLE_MODE:
                        sitesBackground[index] = [site, CYCLE_MODE, cycleInterval].join("/blv_ck_bg/");
                        break;
    
                    case NOCOLOR_MODE:
                        sitesBackground[index] = [site, NOCOLOR_MODE].join("/blv_ck_bg/");
                        break;
                }
    
                break;
    
            case TEXT:
    
                switch (mode) {
                    case COLOR_MODE:
                        sitesText[index] = [site, COLOR_MODE, color].join("/blv_ck_bg/");
                        break;
                        
                    case RANDOM_MODE:
                        sitesText[index] = [site, RANDOM_MODE].join("/blv_ck_bg/");
                        break;
    
                    case CYCLE_MODE:
                        sitesText[index] = [site, CYCLE_MODE, cycleInterval].join("/blv_ck_bg/");
                        break;
    
                    case NOCOLOR_MODE:
                        sitesText[index] = [site, NOCOLOR_MODE].join("/blv_ck_bg/");
                        break;
                }
                break;
    
            case ULINK:
    
                switch (mode) {
                    case COLOR_MODE:
                        sitesULinks[index] = [site, COLOR_MODE, color].join("/blv_ck_bg/");
                        break;
                        
                    case RANDOM_MODE:
                        sitesULinks[index] = [site, RANDOM_MODE].join("/blv_ck_bg/");
                        break;
    
                    case CYCLE_MODE:
                        sitesULinks[index] = [site, CYCLE_MODE, cycleInterval].join("/blv_ck_bg/");
                        break;
    
                    case NOCOLOR_MODE:
                        sitesULinks[index] = [site, NOCOLOR_MODE].join("/blv_ck_bg/");
                        break;
                }
                break;
    
            case VLINK:
    
                switch (mode) {
                    case COLOR_MODE:
                        sitesVLinks[index] = [site, COLOR_MODE, color].join("/blv_ck_bg/");
                        break;
                        
                    case RANDOM_MODE:
                        sitesVLinks[index] = [site, RANDOM_MODE].join("/blv_ck_bg/");
                        break;
    
                    case CYCLE_MODE:
                        sitesVLinks[index] = [site, CYCLE_MODE, cycleInterval].join("/blv_ck_bg/");
                        break;
        
                    case NOCOLOR_MODE:
                        sitesVLinks[index] = [site, NOCOLOR_MODE].join("/blv_ck_bg/");
                        break;
                }
                break;
    
        }
    } 
    else {

        let allSitesSettings = allSites.split(HAPPY_FACE_SEPARATOR);
        let newSection;

        switch (mode) {
            case COLOR_MODE:
                newSection = [COLOR_MODE, color].join("/blv_ck_bg/");
                break;
                
            case RANDOM_MODE:
                newSection = [RANDOM_MODE].join("/blv_ck_bg/");
                break;

            case CYCLE_MODE:
                newSection = [CYCLE_MODE, cycleInterval].join("/blv_ck_bg/");
                break;

            case NOCOLOR_MODE:
                newSection = [NOCOLOR_MODE].join("/blv_ck_bg/");
                break;
        }

        switch (selection) {
    
            case BACKGROUND:
                allSites = [allSitesSettings[0], newSection, allSitesSettings[2], allSitesSettings[3], allSitesSettings[4]];
                break;
    
            case TEXT:
                allSites = [allSitesSettings[0], allSitesSettings[1], newSection, allSitesSettings[3], allSitesSettings[4]];
                break;
    
            case ULINK:
                allSites = [allSitesSettings[0], allSitesSettings[1], allSitesSettings[2], newSection, allSitesSettings[4]];
                break;
    
            case VLINK:
                allSites = [allSitesSettings[0], allSitesSettings[1], allSitesSettings[2], allSitesSettings[3], newSection];
                break;
    
        }

        allSites = allSites.join(HAPPY_FACE_SEPARATOR);

    }

    // Set input's data or icon
    if (mode === COLOR_MODE)
        input.attr("data-color", color).val(`#${color.substring(0,6)}`); // Remove transparency value
    else if (mode === CYCLE_MODE)
        input.val(cycleInterval).attr("data-cycle_speed", cycleInterval);
        
    input.attr("data-mode", mode);

    modifyInputDependingOnMode(input);

    saveSites(selection, site === "all");
    closePaletteModal(true);
}

function siteColorPreview(color) {

    visualizeSelectedMode(COLOR_MODE);

    let site = $("input[data-palette='open']").attr("data-site");
    let selection = $("input[data-palette='open']").attr("data-selection");

    sendMessageToContentScripts("setSiteColorForPreview", site, selection, color);

}

function randomColorPreview(color) {

    visualizeSelectedMode(RANDOM_MODE, color);

    let site = $("input[data-palette='open']").attr("data-site");
    let selection = $("input[data-palette='open']").attr("data-selection");

    sendMessageToContentScripts("setSiteColorForPreview", site, selection, color);

}

function setRandomColorAsSelected_Preview () {
    siteColorPreview($(".sp-input").val());
}

function rgbCyclePreview() {
    
    visualizeSelectedMode(CYCLE_MODE);

    if (!cycleSelected) {

        let site = $("input[data-palette='open']").attr("data-site");
        let selection = $("input[data-palette='open']").attr("data-selection");
        let cycleInterval = $("#cycle_speed").val();
        
        sendMessageToContentScripts("startCycleForPreview", site, selection, cycleInterval);
        cycleSelected = true;

    }

}

function cycleSpeedPreview() {

    // Cycle icon
    cycle_interval = this.value;
    
    let site = $("input[data-palette='open']").attr("data-site");
    let selection = $("input[data-palette='open']").attr("data-selection");
    
    calculateOptimalCycleRateAndSetInputTitle();
    
    sendMessageToContentScripts("setCycleSpeedForPreview", site, selection, cycle_interval);

}

function noColorPreview() {

    visualizeSelectedMode(NOCOLOR_MODE);

    let site = $("input[data-palette='open']").attr("data-site");
    let selection = $("input[data-palette='open']").attr("data-selection");
    
    sendMessageToContentScripts("noColorForPreview", site, selection);

}

function visualizeSelectedMode(mode, color) {

    $("#save_randomColor").hide();

    switch (mode) {

        case COLOR_MODE:
            // Show only this mode as selected
            $(".sp-input").addClass("sp-input-selected");
            $("#showInput").addClass("mode_selected");
            
            // Deselect other modes
            $(".mode_selected").not("#showInput").removeClass("mode_selected");
            $(".random_div").find("path").eq(0).css("fill", "white");
            $(".cycle_div").find("path").eq(0).css("fill", "white");
            $("#cycle_speed").css('visibility', 'hidden');
            $(".sp-clear-display").css("background-image", NO_COLOR_ICON)

            randomColorSelected = cycleSelected = false;
            break;

        case RANDOM_MODE:
            $(".random_div").find("path").eq(0).css("fill", "#4DDBFF");
            $(".random_div").addClass("mode_selected");
            $("#showInput").spectrum("set", color);

            $(".mode_selected").not(".random_div").removeClass("mode_selected");
            $(".cycle_div").find("path").eq(0).css("fill", "white");
            $("#cycle_speed").css('visibility', 'hidden');
            $(".sp-input-selected").removeClass("sp-input-selected");
            $(".sp-clear-display").css("background-image", NO_COLOR_ICON)

            randomColorSelected = cycleSelected = false;
            break;

        case CYCLE_MODE:
            $(".cycle_div").find("path").eq(0).css("fill", "#4DDBFF");
            $(".cycle_div").addClass("mode_selected");
            $("#cycle_speed").css('visibility', 'visible');

            setTimeout(() => { $(".sp-input").val('') }, 2);
            $("#showInput").spectrum("set", '');
            $(".mode_selected").not(".cycle_div").removeClass("mode_selected");
            $(".random_div").find("path").eq(0).css("fill", "white");
            $(".sp-input-selected").removeClass("sp-input-selected");
            $(".sp-clear-display").css("background-image", NO_COLOR_ICON)

            // cycleSelected = true; It is setted in rgbCyclePreview
            randomColorSelected = false;
            
            break;

        case NOCOLOR_MODE:
            $(".sp-clear-display").css("background-image", NO_COLOR_ICON_SELECTED)
            $(".sp-clear-display").addClass("mode_selected");
            setTimeout(() => { $(".sp-input").val("Original color") }, 2);
            
            $("#showInput").spectrum("set", '');
            $(".mode_selected").not(".sp-clear-display").removeClass("mode_selected");
            $(".sp-input-selected").removeClass("sp-input-selected");
            $(".random_div").find("path").eq(0).css("fill", "white");
            $(".cycle_div").find("path").eq(0).css("fill", "white");
            $("#cycle_speed").css('visibility', 'hidden');
            randomColorSelected = cycleSelected = false;
            break;

    }

}

// #endregion

