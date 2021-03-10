const hexToRgb = hex =>
  `rgb (${hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
	,(m, r, g, b) => '#' + r + r + g + g + b + b)
.substring(1).match(/.{2}/g)
.map(x => parseInt(x, 16))
.join(", ")})`

const LINKS_STYLESHEET_ID = "blv_ck_bg_links"
const LINKS_STYLE_SECTION = `<style type="text/css" id="${LINKS_STYLESHEET_ID}" media="not all"> </style>`
  
const ENABLED = "enabled";
const BACKGROUND = "background";
const TEXT = "text";
const ULINK = "ulink"; // Unvisited link
const VLINK = "vlink"; // Visited link

const COLOR_MODE = "color";
const RANDOM_MODE = "random";
const CYCLE_MODE = "cycle";
const NOCOLOR_MODE = "nocolor";

const HTML_ELEMENTS_EXCEPTIONS = "script, noscript, style, link, img, video";
const HTML_VIP_ELEMENTS = 
".chat-author__display-name, textarea[autocomplete='twitch-chat'], .sp-thumb-inner, .r-6416eg, #progress.style-scope, .ScChannelStatusIndicator-sc-1cf6j56-0"; // Twitch chat usernames 
								// Twitch chat box // Spectrum sample palette colors // Twitter profile pictures (in TL) // YouTube thumbnails' progress bar // Twitch followed channels columns: live red circle icon
								
// .tw-flex-grow-1, // Twitch chat usernames (VODs)	 							

var currentUrl = window.location.href;

var pageEnabled = false;
var itEverywhere = false;
var isUrl = false;

var previewMode = new Map();

var customBgColor_HEX = "#000000", customBgColor_RGB, customBgColor_HEX_preview;
var customTextColor_HEX = "#FFFFFF", customTextColor_RGB, customTextColor_HEX_preview;
var customULinkColor_HEX, customULinkColor_RGB, customULinkColor_HEX_preview;
var customVLinkColor_HEX, customVLinkColor_RGB, customVLinkColor_HEX_preview;

var bgCycle_interval = false, bgCycle_interval_preview = false, bgCycle_step, bgCycle_ms, bgCycle_ms_preview;
var textCycle_interval = false, textCycle_interval_preview = false, textCycle_step, textCycle_ms, textCycle_ms_preview;
var ulinkCycle_interval = false, ulinkCycle_interval_preview = false, ulinkCycle_step, ulinkCycle_ms, ulinkCycle_ms_preview;
var vlinkCycle_interval = false, vlinkCycle_interval_preview = false, vlinkCycle_step, vlinkCycle_ms, vlinkCycle_ms_preview;

var hostSettings = new Map();

// Set body's backgroundColor to black if window.location.host is contained in the storaged selected sites (sitesEnabled).
var setBgColorInterval;
var mutationObs = new MutationObserver(function(mutations) {
	setNewElementsColor(mutations);
});    


$(document).ready(function () {

	// Add stylesheet for links' colors
	$("head").prepend(LINKS_STYLE_SECTION);

	activateCustomBgModeIfPageSelectedOrItEverywhere();

	// // Watch URL changes to apply host/URL settings when needed
	// setInterval(() => {
	// 	if (window.location.href !== currentUrl) {
	// 		currentUrl = window.location.href;
	// 		revertCustomBgMode();
	// 		activateCustomBgModeIfPageSelectedOrItEverywhere();
	// 	}
	// }, 500);

});

// Inbox 📫
chrome.extension.onMessage.addListener(function (msg, sender, sendResponse) {

	// Current color request (get random)
	if (msg.action === "getCurrentColor") {

		let currentColor;

		switch (msg.selection) {
			case BACKGROUND:
				currentColor = customBgColor_HEX_preview ? customBgColor_HEX_preview : customBgColor_HEX;
				break;

			case TEXT:
				currentColor = customTextColor_HEX_preview ? customTextColor_HEX_preview : customTextColor_HEX;
				break;

			case ULINK:
				currentColor = customULinkColor_HEX_preview ? customULinkColor_HEX_preview : customULinkColor_HEX;
				break;

			case VLINK:
				currentColor = customVLinkColor_HEX_preview ? customVLinkColor_HEX_preview : customVLinkColor_HEX;
				break;
		}

		// chrome.runtime.sendMessage(
		// 	{ action: "getCurrentColorResponse", currentColor: currentColors }
		// );
		sendResponse({ currentColor: currentColor })
		return;
	}

	let domain = window.location.host.replace("www.", "");
	let hrefNoOrigin = window.location.href.replace(window.location.origin, "").substring(1); // Remove first slash (/)

	// Apply on all pages
	if (msg.action === "applyOnAllPages") {
		itEverywhere = true;
		if (!pageEnabled)
			initCustomBgMode();
		return;
	}

	if (msg.action === "notApplyOnAllPages") {
		itEverywhere = false;
		if (!pageEnabled)
			revertCustomBgMode();
		return;
	}

	// Apply on specific site

	if (!isUrl == 1 && !domain.includes(msg.site[0])) // Watch out
		return;

	if (isUrl && (msg.site.length < 2 && !domain.includes(msg.site[0]) || !hrefNoOrigin.includes(msg.site[1])))
		return;

	switch(msg.action) {

		case "activateBlackBgMode":
			pageEnabled = true;
			if (!itEverywhere)
				initCustomBgMode();
			break;

		case "deactivateBlackBgMode":
			pageEnabled = false;
			if (!itEverywhere)
				revertCustomBgMode();
			break;

		case "setSiteColorForPreview":
			setSiteColorForPreview(msg.selection, msg.value);
			break;

		case "startCycleForPreview":
			startCycleForPreview(msg.selection, msg.value);
			break;

		case "setCycleSpeedForPreview":
			setCycleSpeedForPreview(msg.selection, msg.value);
			break;

		case "noColorForPreview":
			noColorForPreview(msg.selection);
			break;

		case "savePreview":
			savePreview(msg.selection);
			break;

		case "stopPreview":
			stopPreview(msg.selection);
			break;
		
	}

});

function activateCustomBgModeIfPageSelectedOrItEverywhere() {

	// Load settings
	chrome.storage.sync.get(["itEverywhere", "sitesEnabled", "sitesBackground", "sitesText", "sitesULinks", "sitesVLinks"], function (result) {

		if (result.itEverywhere === true)
			itEverywhere = true;

		let domain = window.location.host.replace("www.", "");
		let hrefNoOrigin = window.location.href.replace(window.location.origin, "").substring(1); // Remove first slash (/)

		let sitesEnabled, sitesBackground, sitesText, sitesULinks, sitesVLinks;
		[sitesEnabled, sitesBackground, sitesText, sitesULinks, sitesVLinks] = [result.sitesEnabled, result.sitesBackground, result.sitesText, result.sitesULinks, result.sitesVLinks];

		if (sitesEnabled) {

			let siteIndex = -1;

			if (hrefNoOrigin) {

				siteIndex = sitesEnabled.findIndex(site => site.startsWith(`${domain}||url||${hrefNoOrigin}`));
				if (siteIndex != -1)
					// Site info refers to a specific URL
					isUrl = true;

			}

			if (siteIndex == -1)
				// Check if there are saved settings for just the page's host 
				siteIndex = sitesEnabled.findIndex(site => site.split("/blv_ck_bg/")[0] === domain);

			if (siteIndex == -1)
				// The user hasn't added the current host/URL to their customized sites list (this will happen continuously on most pages)
				return;

			let siteEnabled, siteBackground, siteText, siteULinks, siteVLinks;
			
			let site = sitesEnabled[siteIndex].split("/blv_ck_bg/")[0];
			site = site.replace("www.", "");

			[siteEnabled, siteBackground, siteText, siteULinks, siteVLinks] = 
			[sitesEnabled[siteIndex].split("/blv_ck_bg/"), sitesBackground[siteIndex].split("/blv_ck_bg/"), sitesText[siteIndex].split("/blv_ck_bg/"), sitesULinks[siteIndex].split("/blv_ck_bg/"), sitesVLinks[siteIndex].split("/blv_ck_bg/")];

			if (siteEnabled[1] === "enabled")
				pageEnabled = true;

			// Background color
			switch (siteBackground[1]) {

				case COLOR_MODE:
					customBgColor_HEX = `#${siteBackground[2]}`
					break;

				case RANDOM_MODE:
					customBgColor_HEX = getPaddedRandomHexColor();
					break;

				case CYCLE_MODE:
					bgCycle_ms = siteBackground[2];
					bgCycle_interval = true;
					break;

				case NOCOLOR_MODE:
					customBgColor_HEX = '';
					break;
				
			}

			if (customBgColor_HEX)
				customBgColor_RGB = hexToRgb(customBgColor_HEX);
				
			// Text color
			switch (siteText[1]) {

				case COLOR_MODE:
					customTextColor_HEX = `#${siteText[2]}`
					break;

				case RANDOM_MODE:
					customTextColor_HEX = getPaddedRandomHexColor();
					break;

				case CYCLE_MODE:
					textCycle_ms = siteText[2];
					textCycle_interval = true;
					break;
				
				case NOCOLOR_MODE:
					customTextColor_HEX = '';
					break;

			}

			if (customTextColor_HEX)
				customTextColor_RGB = hexToRgb(customTextColor_HEX);

			// Unvisited links color
			switch (siteULinks[1]) {

				case COLOR_MODE:
					customULinkColor_HEX = `#${siteULinks[2]}`
					break;

				case RANDOM_MODE:
					customULinkColor_HEX = getPaddedRandomHexColor();
					break;

				case CYCLE_MODE:
					ulinkCycle_ms = siteULinks[2];
					ulinkCycle_interval = true;
					break;

				case NOCOLOR_MODE:
					customULinkColor_HEX = '';
					break;

					
				}
			
			if (customULinkColor_HEX)
				customULinkColor_RGB = hexToRgb(customULinkColor_HEX);
				
			// Visited links color
			switch (siteVLinks[1]) {

				case COLOR_MODE:
					customVLinkColor_HEX = `#${siteVLinks[2]}`
					break;

				case RANDOM_MODE:
					customVLinkColor_HEX = getPaddedRandomHexColor();
					break;

				case CYCLE_MODE:
					vlinkCycle_ms = siteVLinks[2];
					vlinkCycle_interval = true;
					break;

				case NOCOLOR_MODE:
					customVLinkColor_HEX = '';
					break;

			}

			if (customVLinkColor_HEX)
				customVLinkColor_RGB = hexToRgb(customVLinkColor_HEX);

			if (pageEnabled || itEverywhere)
				initCustomBgMode();

		}
	});
}

function setSiteSettings (siteSettings) {

	let siteEnabled, siteBackground, siteText, siteULinks, siteVLinks;

	if (siteEnabled[1] === "enabled")
				pageEnabled = true;

			// Background color
			switch (siteBackground[1]) {

				case COLOR_MODE:
					customBgColor_HEX = `#${siteBackground[2]}`
					break;

				case RANDOM_MODE:
					customBgColor_HEX = getPaddedRandomHexColor();
					break;

				case CYCLE_MODE:
					bgCycle_ms = siteBackground[2];
					bgCycle_interval = true;
					break;

				case NOCOLOR_MODE:
					customBgColor_HEX = '';
					break;
				
			}

			if (customBgColor_HEX)
				customBgColor_RGB = hexToRgb(customBgColor_HEX);
				
			// Text color
			switch (siteText[1]) {

				case COLOR_MODE:
					customTextColor_HEX = `#${siteText[2]}`
					break;

				case RANDOM_MODE:
					customTextColor_HEX = getPaddedRandomHexColor();
					break;

				case CYCLE_MODE:
					textCycle_ms = siteText[2];
					textCycle_interval = true;
					break;
				
				case NOCOLOR_MODE:
					customTextColor_HEX = '';
					break;

			}

			if (customTextColor_HEX)
				customTextColor_RGB = hexToRgb(customTextColor_HEX);

			// Unvisited links color
			switch (siteULinks[1]) {

				case COLOR_MODE:
					customULinkColor_HEX = `#${siteULinks[2]}`
					break;

				case RANDOM_MODE:
					customULinkColor_HEX = getPaddedRandomHexColor();
					break;

				case CYCLE_MODE:
					ulinkCycle_ms = siteULinks[2];
					ulinkCycle_interval = true;
					break;

				case NOCOLOR_MODE:
					customULinkColor_HEX = '';
					break;

					
				}
			
			if (customULinkColor_HEX)
				customULinkColor_RGB = hexToRgb(customULinkColor_HEX);
				
			// Visited links color
			switch (siteVLinks[1]) {

				case COLOR_MODE:
					customVLinkColor_HEX = `#${siteVLinks[2]}`
					break;

				case RANDOM_MODE:
					customVLinkColor_HEX = getPaddedRandomHexColor();
					break;

				case CYCLE_MODE:
					vlinkCycle_ms = siteVLinks[2];
					vlinkCycle_interval = true;
					break;

				case NOCOLOR_MODE:
					customVLinkColor_HEX = '';
					break;

			}

			if (customVLinkColor_HEX)
				customVLinkColor_RGB = hexToRgb(customVLinkColor_HEX);

			if (pageEnabled || itEverywhere)
				initCustomBgMode();

}

function setEverythingColorExceptElementsWithTransparentBackground() {

	$("body").find("*").not(`.blackbg_pass, .blackbg_lets_go, .blacktc_lets_go, ${HTML_ELEMENTS_EXCEPTIONS}, ${HTML_VIP_ELEMENTS}`).each(function () {

		if (!window.getComputedStyle(this).getPropertyValue("background-color").startsWith("rgba(0, 0, 0")) {
		// if (!window.getComputedStyle(this).getPropertyValue("background-color").startsWith("rgba")) {
		// 	!window.getComputedStyle(this).getPropertyValue("background-color").startsWith("rgb(0, 0, 0")) 
		// {
			setCssProp_storePropInDataAttributeIfExistant(this, "background-color", customBgColor_HEX, true);
			
			// Add class to mark the elements whose backgrounds have already been set to black
			$(this).addClass("blackbg_lets_go");
		}
		
		// All texts' color need to be white
		// if (!window.getComputedStyle(this).getPropertyValue("color").startsWith("rgb(255, 255, 255"))
		if (customTextColor_HEX)
			if (!$(this).is("a") && $(this).parents("a").length == 0) {
				setCssProp_storePropInDataAttributeIfExistant(this, "color", customTextColor_HEX, true);
				$(this).addClass("blacktc_lets_go");
			}

		if ($(this).is("a") || $(this).parents("a").length > 0)
			$(this).addClass("blackbg_link");
		
		// Add class this class to mark elements that have been already processed by this function
		$(this).addClass("blackbg_pass");
	});

	// $("a").each(function () {
	// 	if (window.getComputedStyle(this).getPropertyValue("color").startsWith("rgb(0, 0, 0") || 
	// 	window.getComputedStyle(this).getPropertyValue("color").startsWith("rgb(26, 13, 171") || window.getComputedStyle(this).getPropertyValue("color").startsWith("rgb(26, 115, 232"))
	// 		$(this).addClass("blackbg_link");
	// });

}

function setNewElementsColor(mutations) {
	for (let i = 0, length = mutations.length; i < length; i++) {

		for (let j = 0, length2 = mutations[i].addedNodes.length; j < length2; j++) {
			if (mutations[i].addedNodes[j]) {

				if (!$(mutations[i].addedNodes[j]).hasClass("blackbg_lets_go"))
					if (typeof (mutations[i].addedNodes[j]) === "object" && 
						!window.getComputedStyle(mutations[i].addedNodes[j]).getPropertyValue("background-color").startsWith("rgba(0, 0, 0, 0")) 
					{
						setCssProp_storePropInDataAttributeIfExistant(mutations[i].addedNodes[j], "background-color", "black", true);
						$(mutations[i].addedNodes[j]).addClass("blackbg_lets_go");
					}
				setCssProp_storePropInDataAttributeIfExistant(mutations[i].addedNodes[j], "color", "white", true);
				$(mutations[i].addedNodes[j]).addClass("blackbg_pass");
			}
		}
		
		if (mutations[i].target) {
			
			if (!$(mutations[i].target).hasClass("blackbg_lets_go"))
				if (!window.getComputedStyle(mutations[i].target).getPropertyValue("background-color").startsWith("rgba(0, 0, 0, 0")) 
				{
					setCssProp_storePropInDataAttributeIfExistant(mutations[i].target, "background-color", "black", true);
					$(mutations[i].target).addClass("blackbg_lets_go");
				}
			setCssProp_storePropInDataAttributeIfExistant(mutations[i].target, "color", "white", true);
			$(mutations[i].target).addClass("blackbg_pass");
		}

	}
}

// function replaceCssAttributeValue(elem, attribute, value, important) {
// 	const regex = new RegExp(`; ${attribute}:[^;]*;`);
// 	let cssText_WithReplacedValue = $(elem).css('cssText').replace(regex, `; ${attribute}:${value}${important ? " !important" : ""};`);
// 	$(elem).css('cssText', cssText_WithReplacedValue);
// }

function setCssProp_storePropInDataAttributeIfExistant (elem, prop, value, important) {

	if (!$(elem).data(`blackbg-bg-${prop}`)) {

		if ($(elem).css(`${prop}`))
			$(elem).data(`blackbg-bg-${prop}`, $(elem).css(`${prop}`));
		else
			$(elem).data(`blackbg-bg-${prop}`, window.getComputedStyle($(elem)).getPropertyValue(`${prop}`));

	}

	if (important)
		elem.style.setProperty(prop, value, 'important')
	else
		elem.style.setProperty(prop, value)
}

function removePropertyOrSetIfStored (elem, prop) {
	$(elem)[0].style.removeProperty(prop);

	if ($(elem).data(`blackbg-bg-${prop}`)) {
		$(elem).css(prop, $(elem).data(`blackbg-bg-${prop}`));
		$(elem).removeData(`blackbg-bg-${prop}`);
	}
}

function initCustomBgMode() {

	// Page background
	$("html, body").each(function () {
		setCssProp_storePropInDataAttributeIfExistant(this, "background-color", customBgColor_HEX, true);
		if (customTextColor_HEX) setCssProp_storePropInDataAttributeIfExistant(this, "color", customTextColor_HEX, true);
		// setCssProp_storePropInDataAttributeIfExistant(this, "background", "none", true);
		// setCssProp_storePropInDataAttributeIfExistant(this, "background-image", "none", true);
		// if (!$(this).css("background").startsWith("rgb(0, 0, 0") && !$(this).css("background").startsWith("rgba(0, 0, 0")) {
		// 	$(this).css("background", "none");
		// }

		// if (!$(this).css("background-image").startsWith("rgb(0, 0, 0") && !$(this).css("background-image").startsWith("rgba(0, 0, 0")) {
		// 	$(this).css("background-image", "none");
		// }

		$(this).addClass("blackbg_pass");

		// $(this).css("background", `${$(this).css("background")}pepe`);
		// $(this).css("background-image", `${$(this).css("background-image")}pepe`);
	});

	// Add CSS rules for links' colors and 'activate' stylesheet
	if (customULinkColor_HEX)
		addOrUpdateStylesheetRule(`#${LINKS_STYLESHEET_ID}`, ".blackbg_link:not(:visited), .blackbg_link:not(:visited) *", "color", customULinkColor_HEX, true);
	
	if (customVLinkColor_HEX)
		addOrUpdateStylesheetRule(`#${LINKS_STYLESHEET_ID}`, ".blackbg_link:visited, .blackbg_link:visited *", "color", customVLinkColor_HEX, true);

	$(`#${LINKS_STYLESHEET_ID}`).attr("media", "");
	// links_style = (customULinkColor_HEX) ? links_style.replace("XXX", `.blackbg_link:not(:visited) { color: ${customULinkColor_HEX} !important; } `) : ""; 
	// links_style = (customVLinkColor_HEX) ? links_style.replace("YYY", `.blackbg_link:visited { color: ${customVLinkColor_HEX} !important; }`) : links_style.replace("YYY", ""); 

	// Elements with cycle mode activated
	if (pageEnabled || itEverywhere)
		initializeCycles();

	// Start continuous painting process
	setEverythingColorExceptElementsWithTransparentBackground();
	setBgColorInterval = setInterval(setEverythingColorExceptElementsWithTransparentBackground, 50);
	// mutationObs.observe(document.body, { childList: true, attributes: true, subtree: true });
}

function revertCustomBgMode () {

	clearInterval(setBgColorInterval);
	mutationObs.disconnect();

	$("html, body").each(function () {
		removePropertyOrSetIfStored(this, "background-color");
		removePropertyOrSetIfStored(this, "color");
		removePropertyOrSetIfStored(this, "background");
		removePropertyOrSetIfStored(this, "background-image");
		// $(this).css("background", $(this).css("background").replace("pepe", ""));
		// $(this).css("background-image", $(this).css("background-image").replace("pepe", ""));
	});

	$(".blackbg_lets_go").each(function () {
		removePropertyOrSetIfStored(this, "background-color");
		removePropertyOrSetIfStored(this, "color");
		$(this).removeClass("blackbg_lets_go");
	});

	$(".blacktc_lets_go").each(function () {
		removePropertyOrSetIfStored(this, "color");
		$(this).removeClass("blacktc_lets_go");
	});

	$(".blackbg_link").removeClass("blackbg_link");

	$(".blackbg_pass").each(function () {
		removePropertyOrSetIfStored(this, "color");
		$(this).removeClass("blackbg_pass");
	});

	$(`#${LINKS_STYLESHEET_ID}`).attr("media", "not all");

}

function setSiteColorForPreview(selection, color, cycle) {

	previewMode.set(selection, COLOR_MODE);

	switch (selection) {
		case BACKGROUND:

			if (!cycle) {
				customBgColor_HEX_preview = color;
				bgCycle_interval = false;
			}

			if (pageEnabled || itEverywhere)
				$("html,body, .blackbg_lets_go").each(function(){
					setCssProp_storePropInDataAttributeIfExistant(this, "background-color", customBgColor_HEX_preview, true)
				});
			break;

		case TEXT:

			if (!cycle) {
				customTextColor_HEX_preview = color;
				textCycle_interval = false;
			}
			
			if (pageEnabled || itEverywhere)
				$("html,body, .blacktc_lets_go").each(function(){
					setCssProp_storePropInDataAttributeIfExistant(this, "color", customTextColor_HEX_preview, true)
				});
			break;
			
		case ULINK:
			customULinkColor_HEX_preview = color;
			ulinkCycle_interval = false;
			addOrUpdateStylesheetRule(`#${LINKS_STYLESHEET_ID}`, ".blackbg_link:not(:visited), .blackbg_link:not(:visited) *", "color", customULinkColor_HEX_preview, true);
			break;
			
		case VLINK:
			customVLinkColor_HEX_preview = color;
			vlinkCycle_interval = false;
			addOrUpdateStylesheetRule(`#${LINKS_STYLESHEET_ID}`, ".blackbg_link:visited, .blackbg_link:visited *", "color", customVLinkColor_HEX_preview, true);
			break;
	}		

}

// According to pop-up's functionality, it is assumed that a cycle is not being executed if this function is reached
function startCycleForPreview(selection, cycleInterval) {

	previewMode.set(selection, CYCLE_MODE);
	
	switch (selection) {
		case BACKGROUND:
			bgCycle_interval = true;
			bgCycle_ms_preview = cycleInterval;
			
			customBgColor_HEX_preview = "ff0000";
			bgCycle_step = 1;
			cycleBackground();
			break;

		case TEXT:
			textCycle_interval = true;
			textCycle_ms_preview = cycleInterval;
			
			customTextColor_HEX_preview = "ff0000";
			textCycle_step = 1;
			cycleText();
			break;
			
		case ULINK:
			ulinkCycle_interval = true;
			ulinkCycle_ms_preview = cycleInterval;
			
			customULinkColor_HEX_preview = "ff0000";
			ulinkCycle_step = 1;
			cycleULink();
			break;
			
		case VLINK:
			vlinkCycle_interval = true;
			vlinkCycle_ms_preview = cycleInterval;
			
			customVLinkColor_HEX_preview = "ff0000";
			vlinkCycle_step = 1;
			cycleVLink();
			break;
	}		

}

function savePreview (selection) { 

	switch (selection) {
		case BACKGROUND:
			// Preview values are now the selected values (congratulations)
			if (customBgColor_HEX_preview)
				customBgColor_HEX = customBgColor_HEX_preview;

			if (previewMode.get(selection) === CYCLE_MODE && bgCycle_ms_preview)
				// Cycle mode preview
				bgCycle_ms = bgCycle_ms_preview;
			else
				// A mode that is not cycle is saved (stop previous cycle)
				bgCycle_ms = '';

			if (previewMode.get(selection) === NOCOLOR_MODE)
				customBgColor_HEX = '';

			// Remove preview values
			customBgColor_HEX_preview = bgCycle_ms_preview = '';
			break;

		case TEXT:
			if (customTextColor_HEX_preview)
				customTextColor_HEX = customTextColor_HEX_preview;

			if (previewMode.get(selection) === CYCLE_MODE && textCycle_ms_preview)
				textCycle_ms = textCycle_ms_preview;
			else 
				textCycle_ms = '';

			if (previewMode.get(selection) === NOCOLOR_MODE)
				customTextColor_HEX = '';

			customTextColor_HEX_preview = textCycle_ms_preview = '';
			break;

		case ULINK:
			if (customULinkColor_HEX_preview)
				customULinkColor_HEX = customULinkColor_HEX_preview;

			if (previewMode.get(selection) === CYCLE_MODE && ulinkCycle_ms_preview)
				ulinkCycle_ms = ulinkCycle_ms_preview;
			else
				ulinkCycle_ms = '';

			if (previewMode.get(selection) === NOCOLOR_MODE)
				customULinkColor_HEX = '';

			customULinkColor_HEX_preview = ulinkCycle_ms_preview = '';
			break;

		case VLINK:
			if (customVLinkColor_HEX_preview)
				customVLinkColor_HEX = customVLinkColor_HEX_preview;

			if (previewMode.get(selection) === CYCLE_MODE && vlinkCycle_ms_preview)
				vlinkCycle_ms = vlinkCycle_ms_preview;
			else
				vlinkCycle_ms = '';

			if (previewMode.get(selection) === NOCOLOR_MODE)
				customVLinkColor_HEX = '';

			customVLinkColor_HEX_preview = vlinkCycle_ms_preview = '';
			break;
	}
}

function stopPreview (selection) { 

	switch (selection) {
		case BACKGROUND:

			// Apply changes only if site is active
			if (pageEnabled || itEverywhere)
				if (customBgColor_HEX)
					$("html,body, .blackbg_lets_go").each(function(){
						setCssProp_storePropInDataAttributeIfExistant(this, "background-color", customBgColor_HEX, true)
					});
				else
					// No color mode: remove applied preview colors
					$("html,body, .blackbg_lets_go").each(function(){
						removePropertyOrSetIfStored(this, "background-color");
					});

			customBgColor_HEX_preview = bgCycle_ms_preview = '';
			bgCycle_interval = false;

			// Resume color cycle
			if (bgCycle_ms) {
				bgCycle_interval = true;
				cycleBackground();
			}

			break;

		case TEXT:
			
			if (pageEnabled || itEverywhere)
				if (customTextColor_HEX)
					$("html,body, .blacktc_lets_go").each(function(){
						setCssProp_storePropInDataAttributeIfExistant(this, "color", customTextColor_HEX, true)
					});
				else 
					$("html,body, .blackbg_pass, .blackbg_lets_go, .blacktc_lets_go").each(function(){
						this.style.removeProperty("color");
					});
			
			customTextColor_HEX_preview = textCycle_ms_preview = '';
			textCycle_interval = false;
				
			if (textCycle_ms) {
				textCycle_interval = true;
				cycleText();
			}
			break;
			
		case ULINK:
			if (pageEnabled || itEverywhere)
				if (customULinkColor_HEX)
					addOrUpdateStylesheetRule(`#${LINKS_STYLESHEET_ID}`, ".blackbg_link:not(:visited), .blackbg_link:not(:visited) *", "color", customULinkColor_HEX, true);
				else 
					deleteStylesheetRule(`#${LINKS_STYLESHEET_ID}`, ".blackbg_link:not(:visited), .blackbg_link:not(:visited) *", "color");
		
			customULinkColor_HEX_preview = ulinkCycle_ms_preview = '';
			ulinkCycle_interval = false;

			if (ulinkCycle_ms) {
				ulinkCycle_interval = true;
				cycleULink();
			}
			break;

		case VLINK:
			if (pageEnabled || itEverywhere)
				if (customVLinkColor_HEX)
					addOrUpdateStylesheetRule(`#${LINKS_STYLESHEET_ID}`, ".blackbg_link:visited, .blackbg_link:visited *", "color", customVLinkColor_HEX, true);
				else
					deleteStylesheetRule(`#${LINKS_STYLESHEET_ID}`, ".blackbg_link:visited, .blackbg_link:visited *", "color");

			customVLinkColor_HEX_preview = vlinkCycle_ms_preview = '';
			vlinkCycle_interval = false;
			
			if (vlinkCycle_ms) {
				vlinkCycle_interval = true;
				cycleVLink();
			}
			break;

	}

	// bgCycle_interval = textCycle_interval = ulinkCycle_interval = vlinkCycle_interval = false;

}

//#region RGB cycles

function initializeCycles() {

	if (bgCycle_ms) {
		customBgColor_HEX = "ff0000";
		bgCycle_step = 1;
		cycleBackground();
	}

	if (textCycle_ms) {
		textCycle_step = 1;
		cycleText();
	}

	if (ulinkCycle_ms) {
		customULinkColor_HEX = "ff0000";
		ulinkCycle_step = 1;
		cycleULink();
	}

	if (vlinkCycle_ms) {
		customVLinkColor_HEX = "ff0000";
		vlinkCycle_step = 1;
		cycleVLink();
	}
	
	// setTimeout(() => {
	// 	if (textCycle_ms)
	// 		cycleText(0xff0000, 1)
	// }, bgCycle_ms ? 1000 : 1);

}

function resumeCycles() {

	if (bgCycle_ms)
		cycleBackground();
	
	if (textCycle_ms)
		cycleText();

	if (ulinkCycle_ms)
		cycleULink();

	if (vlinkCycle_ms)
		cycleVLink();
	
	// setTimeout(() => {
	// 	if (textCycle_ms)
	// 		cycleText(0xff0000, 1)
	// }, bgCycle_ms ? 1000 : 1);

}

function cycleBackground() {

	if (!bgCycle_interval || (!pageEnabled && !itEverywhere))
		return;

	if (!customBgColor_HEX_preview) {

		[bgCycle_step, customBgColor_HEX] = stepOperation(bgCycle_step, customBgColor_HEX.replace("#", ""));
		customBgColor_HEX = toPaddedHexString(customBgColor_HEX.toString(16), 6);

		customBgColor_HEX = `#${customBgColor_HEX}`;
		setSiteColorForPreview(BACKGROUND, customBgColor_HEX, true);
		
		$("html, body, .blackbg_lets_go").each(function(){
			setCssProp_storePropInDataAttributeIfExistant(this, "background-color", customBgColor_HEX, true)
		});

	} else {

		[bgCycle_step, customBgColor_HEX_preview] = stepOperation(bgCycle_step, customBgColor_HEX_preview.replace("#", ""));
		customBgColor_HEX_preview = toPaddedHexString(customBgColor_HEX_preview.toString(16), 6);

		customBgColor_HEX_preview = `#${customBgColor_HEX_preview}`;
		setSiteColorForPreview(BACKGROUND, customBgColor_HEX_preview, true);
		
		$("html, body, .blackbg_lets_go").each(function(){
			setCssProp_storePropInDataAttributeIfExistant(this, "background-color", customBgColor_HEX_preview, true)
		});

	}
	
	bgCycle_interval = true;
    setTimeout(() => {
        cycleBackground();
	}, bgCycle_ms_preview ? bgCycle_ms_preview : bgCycle_ms);
	
}

function cycleText() {

	if (!textCycle_interval || (!pageEnabled && !itEverywhere))
		return;

	if (!customTextColor_HEX_preview) {

		[textCycle_step, customTextColor_HEX] = stepOperation(textCycle_step, customTextColor_HEX.replace("#", ""));
		customTextColor_HEX = toPaddedHexString(customTextColor_HEX.toString(16), 6);
	
		customTextColor_HEX = `#${customTextColor_HEX}`;
		setSiteColorForPreview(TEXT, customTextColor_HEX, true);
		
		$("html, body, .blacktc_lets_go").each(function(){
			setCssProp_storePropInDataAttributeIfExistant(this, "color", customTextColor_HEX, true)
		});

	} else {

		[textCycle_step, customTextColor_HEX_preview] = stepOperation(textCycle_step, customTextColor_HEX_preview.replace("#", ""));
		customTextColor_HEX_preview = toPaddedHexString(customTextColor_HEX_preview.toString(16), 6);
	
		customTextColor_HEX_preview = `#${customTextColor_HEX_preview}`;
		setSiteColorForPreview(TEXT, customTextColor_HEX_preview, true);
		
		$("html, body, .blacktc_lets_go").each(function(){
			setCssProp_storePropInDataAttributeIfExistant(this, "color", customTextColor_HEX_preview, true)
		});

	}
	
	textCycle_interval = true;
	setTimeout(() => {
		cycleText();
	}, textCycle_ms_preview ? textCycle_ms_preview : textCycle_ms);
	
}

function cycleULink() {

	if (!ulinkCycle_interval || (!pageEnabled && !itEverywhere))
		return;

	if (!customULinkColor_HEX_preview) {

		[ulinkCycle_step, customULinkColor_HEX] = stepOperation(ulinkCycle_step, customULinkColor_HEX.replace("#", ""));
		customULinkColor_HEX = toPaddedHexString(customULinkColor_HEX.toString(16), 6);
		
		customULinkColor_HEX = `#${customULinkColor_HEX}`;
		addOrUpdateStylesheetRule(`#${LINKS_STYLESHEET_ID}`, ".blackbg_link:not(:visited), .blackbg_link:not(:visited) *", "color", customULinkColor_HEX, true);

	} else {

		[ulinkCycle_step, customULinkColor_HEX_preview] = stepOperation(ulinkCycle_step, customULinkColor_HEX_preview.replace("#", ""));
		customULinkColor_HEX_preview = toPaddedHexString(customULinkColor_HEX_preview.toString(16), 6);
		
		customULinkColor_HEX_preview = `#${customULinkColor_HEX_preview}`;
		addOrUpdateStylesheetRule(`#${LINKS_STYLESHEET_ID}`, ".blackbg_link:not(:visited), .blackbg_link:not(:visited) *", "color", customULinkColor_HEX_preview, true);

	}

    setTimeout(() => {
        cycleULink();
	}, ulinkCycle_ms_preview ? ulinkCycle_ms_preview : ulinkCycle_ms);
	
}

function cycleVLink() {

	if (!vlinkCycle_interval || (!pageEnabled && !itEverywhere))
		return;

	if (!customVLinkColor_HEX_preview) {

		[vlinkCycle_step, customVLinkColor_HEX] = stepOperation(vlinkCycle_step, customVLinkColor_HEX.replace("#", ""));
		customVLinkColor_HEX = toPaddedHexString(customVLinkColor_HEX.toString(16), 6);
		customVLinkColor_HEX = `#${customVLinkColor_HEX}`;

		addOrUpdateStylesheetRule(`#${LINKS_STYLESHEET_ID}`, ".blackbg_link:visited, .blackbg_link:visited *", "color", customVLinkColor_HEX, true);

	} else {

		[vlinkCycle_step, customVLinkColor_HEX_preview] = stepOperation(vlinkCycle_step, customVLinkColor_HEX_preview.replace("#", ""));
		customVLinkColor_HEX_preview = toPaddedHexString(customVLinkColor_HEX_preview.toString(16), 6);
		customVLinkColor_HEX_preview = `#${customVLinkColor_HEX_preview}`;
		
		addOrUpdateStylesheetRule(`#${LINKS_STYLESHEET_ID}`, ".blackbg_link:visited, .blackbg_link:visited *", "color", customVLinkColor_HEX_preview, true);

	}

    setTimeout(() => {
        cycleVLink();
	}, vlinkCycle_ms_preview ? vlinkCycle_ms_preview : vlinkCycle_ms);
	
}

function stepOperation (step, hex) {

	hex = parseInt(hex, 16);

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
            if (hex == 0xff0000) {
				step = 1;
				console.log("reset");
			} 
				
            break;

    }

    return [step, hex];

}

function setCycleSpeedForPreview(selection, interval) {

	switch (selection) {
		case BACKGROUND:
			// if (!customBgColor_HEX_preview)
			// 	customBgColor_HEX_preview = "ff0000";
			bgCycle_ms_preview = interval;
			break;

		case TEXT:
			// if (!customTextColor_HEX_preview)
			// 	customTextColor_HEX_preview = "ff0000";
			textCycle_ms_preview = interval;
			break;
			
		case ULINK:
			// if (!customULinkColor_HEX_preview)
			// 	customULinkColor_HEX_preview = "ff0000";
			ulinkCycle_ms_preview = interval;
			break;

		case VLINK:
			// if (!customVLinkColor_HEX_preview)
			// 	customVLinkColor_HEX_preview = "ff0000";
			vlinkCycle_ms_preview = interval;
			break;

	}

}

//#endregion 

function noColorForPreview(selection) {

	previewMode.set(selection, NOCOLOR_MODE);

	switch (selection) {
		case BACKGROUND:
			bgCycle_interval = false;
			if (pageEnabled || itEverywhere)
				$("html,body, .blackbg_lets_go").each(function(){
					removePropertyOrSetIfStored(this, "background-color");
				});
			break;

		case TEXT:
			textCycle_interval = false;
			if (pageEnabled || itEverywhere)
				$("html,body, .blackbg_pass, .blackbg_lets_go, .blacktc_lets_go").each(function(){
					// removePropertyOrSetIfStored(this, "color");
					this.style.removeProperty("color");
				});
			break;
			
		case ULINK:
			ulinkCycle_interval = false;
			deleteStylesheetRule(`#${LINKS_STYLESHEET_ID}`, ".blackbg_link:not(:visited), .blackbg_link:not(:visited) *", "color");
			break;

		case VLINK:
			bgCycle_interval = false;
			deleteStylesheetRule(`#${LINKS_STYLESHEET_ID}`, ".blackbg_link:visited, .blackbg_link:visited *", "color");
			break;

	}
}