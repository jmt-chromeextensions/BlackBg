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
var cycle_interval = 10;

function initializeCycleIcon() {
    cycleIcon($(".cycle_div > * path").eq(1), 0xff0000, 1);

    setTimeout(() => {
        cycleIcon($(".cycle_div > * path").eq(2), 0xff0000, 1);
    }, 500);
}

function cycleIcon(path, hex, step) {

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

    let paddedHexString = toPaddedHexString(hex.toString(16), 6);
    path.attr("fill", `#${paddedHexString}`);

    setTimeout(() => {
        cycleIcon(path, hex, step)
    }, cycle_interval);

}

function paintRandomIcon(e) {
    // $(this).find("path").eq(0).css("fill", getRandomHexColor());
    let rndColor = getRandomHexColor();
    $("#color_selector .random_div").find("path").eq(1).css("fill", rndColor);
    $("#color_selector .random_div").find("path").eq(2).css("fill", rndColor);
    return rndColor;
}

// #endregion

// #region Site color changes, save modifications, preview

var randomColorSelected = false;

function getSelectionAndSetIt() {

    let domain = $("input[data-palette='open']").attr("data-domain").replaceAll("-", ".");
    let color = $(".sp-input").val().replace('#', '');

    let selection = $("input[data-palette='open']").attr("class").substring(12); // input_color_{selection}
    let index = getPageIndexInArrayByDomain(domain, selection);
    let mode = $(".mode_selected").attr("data-mode");

    switch (selection) {

        case BACKGROUND:

            switch (mode) {
                case COLOR_MODE:
                    sitesBackground[index] = [domain, COLOR_MODE, color].join("/blv_ck_bg/");
                    break;
                    
                case RANDOM_MODE:
                    sitesBackground[index] = [domain, RANDOM_MODE].join("/blv_ck_bg/");
                    break;
            }
            break;

        case TEXT:

            switch (mode) {
                case COLOR_MODE:
                    sitesText[index] = [domain, COLOR_MODE, color].join("/blv_ck_bg/");
                    break;
                    
                case RANDOM_MODE:
                    sitesText[index] = [domain, RANDOM_MODE].join("/blv_ck_bg/");
                    break;
            }
            break;

        case ULINK:

            switch (mode) {
                case COLOR_MODE:
                    sitesULinks[index] = [domain, COLOR_MODE, color].join("/blv_ck_bg/");
                    break;
                    
                case RANDOM_MODE:
                    sitesULinks[index] = [domain, RANDOM_MODE].join("/blv_ck_bg/");
                    break;
            }
            break;

        case VLINK:

            switch (mode) {
                case COLOR_MODE:
                    sitesVLinks[index] = [domain, COLOR_MODE, color].join("/blv_ck_bg/");
                    break;
                    
                case RANDOM_MODE:
                    sitesVLinks[index] = [domain, RANDOM_MODE].join("/blv_ck_bg/");
                    break;
            }
            break;

    }

    $("input[data-palette='open']").val(`#${color}`);
    saveSites(selection);

    closePaletteModal(true);
}

function siteColorPreview(color) {

    visualizeSelectedMode(COLOR_MODE);

    let domain = $("input[data-palette='open']").attr("data-domain").replaceAll("-", ".");
    let selection = $("input[data-palette='open']").attr("class").substring(12); // input_color_{selection}

    sendMessageToContentScripts("setSiteColorForPreview", domain, selection, color);

}

function randomColorPreview(color) {

    visualizeSelectedMode(RANDOM_MODE);

    let domain = $("input[data-palette='open']").attr("data-domain").replaceAll("-", ".");
    let selection = $("input[data-palette='open']").attr("class").substring(12); // input_color_{selection}

    sendMessageToContentScripts("setSiteColorForPreview", domain, selection, color);

}

function rgbCyclePreview() {
    
    visualizeSelectedMode(CYCLE_MODE);
    


    //...
}

function cycleSpeedPreview() {
    cycle_interval = this.value;

}

function visualizeSelectedMode(mode) {

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
            randomColorSelected = false;
            break;

        case RANDOM_MODE:
            $(".random_div").find("path").eq(0).css("fill", "#4DDBFF");
            $(".random_div").addClass("mode_selected");

            $(".mode_selected").not(".random_div").removeClass("mode_selected");
            $(".cycle_div").find("path").eq(0).css("fill", "white");
            $("#cycle_speed").css('visibility', 'hidden');
            $(".sp-input-selected").removeClass("sp-input-selected");
            break;

        case CYCLE_MODE:
            $(".cycle_div").find("path").eq(0).css("fill", "#4DDBFF");
            $(".cycle_div").addClass("mode_selected");
            $("#cycle_speed").css('visibility', 'visible');

            $(".mode_selected").not(".cycle_div").removeClass("mode_selected");
            $(".random_div").find("path").eq(0).css("fill", "white");
            $(".sp-input-selected").removeClass("sp-input-selected");
            randomColorSelected = false;
            break;

    }

}

// #endregion

