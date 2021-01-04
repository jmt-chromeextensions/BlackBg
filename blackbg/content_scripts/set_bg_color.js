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
".chat-author__display-name, textarea[autocomplete='twitch-chat'], .sp-thumb-inner, .r-6416eg"; // Twitch chat usernames
	                            // Twitch chat box // Spectrum sample palette colors // Twitter profile pictures (in TL)

var pageEnabled = false;
var itEverywhere = false;

var customBgColor_HEX = "#000000", customBgColor_RGB, customBgColor_HEX_preview;
var customTextColor_HEX = "#FFFFFF", customTextColor_RGB, customTextColor_HEX_preview;
var customULinkColor_HEX, customULinkColor_RGB, customULinkColor_HEX_preview;
var customVLinkColor_HEX, customVLinkColor_RGB, customVLinkColor_HEX_preview;

var bgCycle_interval, bgCycle_ms;
var textCycle_interval, textCycle_ms;
var ulinkCycle_interval, ulinkCycle_ms;
var vlinkCycle_interval, vlinkCycle_ms;

var links_style, links_style_PREVIEW;

// Set body's backgroundColor to black if window.location.host is contained in the storaged selected sites (sitesEnabled).
var setBgColorInterval;
var mutationObs = new MutationObserver(function(mutations) {
	setNewElementsColor(mutations);
});    


$(document).ready(function () {
	// $("*").each(function () {
	// 	if (!window.getComputedStyle(this).getPropertyValue("background-color").startsWith("rgba(0, 0, 0, 0") && 
	// 	!window.getComputedStyle(this).getPropertyValue("background-color").startsWith("rgb(0, 0, 0"))
	// 		$(this).addClass("data-blackbg_cbgcolor");
	// });
	activateCustomBgModeIfPageSelectedOrItEverywhere();
});

// setInterval(() => {
// 	$("*").each(function () {
// 		if (!window.getComputedStyle(this).getPropertyValue("background-color").startsWith("rgba(0, 0, 0, 0") && 
// 		!window.getComputedStyle(this).getPropertyValue("background-color").startsWith("rgb(0, 0, 0"))
// 			$(this).addClass("data-blackbg_cbgcolor");
// 	});
// }, 1);

// Inbox 📫
chrome.extension.onMessage.addListener(function (msg) {

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

	if (!window.location.hostname.includes(msg.domain)) // Watch out
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

			setSiteColorForPreview(msg.selection, msg.color);
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

		let current_page = window.location.host;
		let sitesEnabled, sitesBackground, sitesText, sitesULinks, sitesVLinks;

		[sitesEnabled, sitesBackground, sitesText, sitesULinks, sitesVLinks] = [result.sitesEnabled, result.sitesBackground, result.sitesText, result.sitesULinks, result.sitesVLinks];

		if (sitesEnabled)
			for (let i = 0; i < sitesEnabled.length; i++) {

				let siteEnabled, siteBackground, siteText, siteULinks, siteVLinks;
				let site = sitesEnabled[i].split("/blv_ck_bg/")[0];
				[siteEnabled, siteBackground, siteText, siteULinks, siteVLinks] = 
				[sitesEnabled[i].split("/blv_ck_bg/"), sitesBackground[i].split("/blv_ck_bg/"), sitesText[i].split("/blv_ck_bg/"), sitesULinks[i].split("/blv_ck_bg/"), sitesVLinks[i].split("/blv_ck_bg/")];

				if (current_page === site) {

					if (siteEnabled[1] === "enabled")
						pageEnabled = true;

					// Background color
					switch (siteBackground[1]) {

						case COLOR_MODE:
							customBgColor_HEX = `#${siteBackground[2]}`
							break;

						case RANDOM_MODE:
							customBgColor_HEX = getRandomHexColor();
							break;

						case CYCLE_MODE:
							bgCycle_interval = `#${siteBackground[2]}`;
							break;
						
					}
					customBgColor_RGB = hexToRgb(customBgColor_HEX);
						
					// Text color
					switch (siteText[1]) {

						case COLOR_MODE:
							customTextColor_HEX = `#${siteText[2]}`
							break;

						case RANDOM_MODE:
							customTextColor_HEX = getRandomHexColor();
							break;

						case CYCLE_MODE:
							textCycle_interval = `#${siteText[2]}`;
							break;

					}
					customTextColor_RGB = hexToRgb(customTextColor_HEX);

					// Unvisited links color
					switch (siteULinks[1]) {

						case COLOR_MODE:
							customULinkColor_HEX = `#${siteULinks[2]}`
							break;

						case RANDOM_MODE:
							customULinkColor_HEX = getRandomHexColor();
							break;

						case CYCLE_MODE:
							ulinkCycle_interval = `#${siteULinks[2]}`;
							break;

					}

					// Visited links color
					switch (siteVLinks[1]) {

						case COLOR_MODE:
							customVLinkColor_HEX = `#${siteVLinks[2]}`
							break;

						case RANDOM_MODE:
							customVLinkColor_HEX = getRandomHexColor();
							break;

						case CYCLE_MODE:
							vlinkCycle_interval = `#${siteVLinks[2]}`;
							break;

					}
					
				}
			};

		// Add stylesheet for links' colors
		$("head").append(LINKS_STYLE_SECTION);

		if (pageEnabled || itEverywhere)
			initCustomBgMode();
	});
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
			if (!$(this).is("a")) {
				setCssProp_storePropInDataAttributeIfExistant(this, "color", customTextColor_HEX, true);
				$(this).addClass("blacktc_lets_go");
			}

		if ($(this).is("a"))
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
		addOrUpdateStylesheetRule(`#${LINKS_STYLESHEET_ID}`, ".blackbg_link:not(:visited)", "color", customULinkColor_HEX, true);
	if (customVLinkColor_HEX)
		addOrUpdateStylesheetRule(`#${LINKS_STYLESHEET_ID}`, ".blackbg_link:visited", "color", customVLinkColor_HEX, true);

	$(`#${LINKS_STYLESHEET_ID}`).attr("media", "");
	// links_style = (customULinkColor_HEX) ? links_style.replace("XXX", `.blackbg_link:not(:visited) { color: ${customULinkColor_HEX} !important; } `) : ""; 
	// links_style = (customVLinkColor_HEX) ? links_style.replace("YYY", `.blackbg_link:visited { color: ${customVLinkColor_HEX} !important; }`) : links_style.replace("YYY", ""); 

	// Elements with cycle mode activated
	initializeCycles();

	// Start continuous painting process
	setEverythingColorExceptElementsWithTransparentBackground();
	setBgColorInterval = setInterval(setEverythingColorExceptElementsWithTransparentBackground, 10);
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

function initializeCycles() {

	if (bgCycle_ms) {

	}
		

}

function setSiteColorForPreview(selection, color) {

	switch (selection) {
		case BACKGROUND:
			customBgColor_HEX_preview = color;
			if (pageEnabled || itEverywhere)
				$("html,body, .blackbg_lets_go").each(function(){
					setCssProp_storePropInDataAttributeIfExistant(this, "background-color", customBgColor_HEX_preview, true)
				});
			break;

		case TEXT:
			customTextColor_HEX_preview = color;
			if (pageEnabled || itEverywhere)
				$("html,body, .blacktc_lets_go").each(function(){
					setCssProp_storePropInDataAttributeIfExistant(this, "color", customTextColor_HEX_preview, true)
				});
			break;
			
		case ULINK:
			customULinkColor_HEX_preview = color;
			addOrUpdateStylesheetRule(`#${LINKS_STYLESHEET_ID}`, ".blackbg_link:not(:visited)", "color", customULinkColor_HEX_preview, true);
			// if (pageEnabled || itEverywhere) {
			// 	if ($("head #blv_ck_bg_links").length > 0) {
			// 		links_style = `.blackbg_link:not(:visited) { color: ${customULinkColor_HEX_preview} !important; } `;
			// 		links_style += (customVLinkColor_HEX) ? `.blackbg_link:visited { color: ${customVLinkColor_HEX_preview ? customVLinkColor_HEX_preview : customVLinkColor_HEX} !important; }` : ""; 
			// 		$("head #blv_ck_bg_links").html(links_style);
			// 	}
			// 	else {
			// 		links_style = LINKS_STYLE_SECTION;
			// 		links_style = links_style.replace("XXX", `.blackbg_link:not(:visited) { color: ${customULinkColor_HEX_preview} !important; } `); 
			// 		links_style = (customVLinkColor_HEX) ? links_style.replace("YYY", `.blackbg_link:visited { color: ${customVLinkColor_HEX_preview ? customVLinkColor_HEX_preview : customVLinkColor_HEX} !important; }`) : links_style.replace("YYY", ""); 
			// 		$("head").append(links_style);
			// 	}
			// }
			break;
			
		case VLINK:
			customVLinkColor_HEX_preview = color;
			addOrUpdateStylesheetRule(`#${LINKS_STYLESHEET_ID}`, ".blackbg_link:visited", "color", customVLinkColor_HEX_preview, true);
			// if (pageEnabled || itEverywhere) {
			// 	if ($("head #blv_ck_bg_links").length > 0) {
			// 		links_style = (customULinkColor_HEX) ? `.blackbg_link:not(:visited) { color: ${customULinkColor_HEX_preview ? customULinkColor_HEX_preview : customULinkColor_HEX} !important; } ` : ""; 
			// 		links_style += `.blackbg_link:visited { color: ${customVLinkColor_HEX_preview} !important; }`;
			// 		$("head #blv_ck_bg_links").html(links_style);
			// 	}
			// 	else {
			// 		links_style = LINKS_STYLE_SECTION;
			// 		links_style = (customVLinkColor_HEX) ? links_style.replace("XXX", `.blackbg_link:not(:visited) { color: ${customULinkColor_HEX_preview ? customULinkColor_HEX_preview : customULinkColor_HEX} !important; } `) : links_style.replace("XXX", ""); 
			// 		links_style = links_style.replace("YYY", `.blackbg_link:visited { color: ${customVLinkColor_HEX_preview ? customVLinkColor_HEX_preview : customVLinkColor_HEX} !important; }`); 
			// 		$("head").append(links_style);
			// 	}
			// }
			break;
	}		

}

function savePreview (selection) { 

	switch (selection) {
		case BACKGROUND:
			if (customBgColor_HEX_preview)
				customBgColor_HEX = customBgColor_HEX_preview;

			// Remove last preview color
			customBgColor_HEX_preview = '';			
			break;

		case TEXT:
			if (customTextColor_HEX_preview)
			customTextColor_HEX = customTextColor_HEX_preview;

			customTextColor_HEX_preview = '';	
			break;

		case ULINK:
			if (customULinkColor_HEX_preview)
			customULinkColor_HEX = customULinkColor_HEX_preview;

			customULinkColor_HEX_preview = '';	
			break;

		case VLINK:
			if (customVLinkColor_HEX_preview)
			customVLinkColor_HEX = customVLinkColor_HEX_preview;

			customVLinkColor_HEX_preview = '';	
			break;

	}

}


function stopPreview (selection) { 

	switch (selection) {
		case BACKGROUND:
			if (pageEnabled || itEverywhere)
				$("html,body, .blackbg_lets_go").each(function(){
					setCssProp_storePropInDataAttributeIfExistant(this, "background-color", customBgColor_HEX, true)
				});
			customBgColor_HEX_preview = '';
			break;

		case TEXT:
			if (pageEnabled || itEverywhere)
				$("html,body, .blacktc_lets_go").each(function(){
					setCssProp_storePropInDataAttributeIfExistant(this, "color", customTextColor_HEX, true)
				});
			customTextColor_HEX_preview = '';
			break;
			
		case ULINK:
			addOrUpdateStylesheetRule(`#${LINKS_STYLESHEET_ID}`, ".blackbg_link:not(:visited)", "color", customULinkColor_HEX, true);
			customULinkColor_HEX_preview = '';
			break;

		case VLINK:
			addOrUpdateStylesheetRule(`#${LINKS_STYLESHEET_ID}`, ".blackbg_link:visited", "color", customVLinkColor_HEX, true);
			customVLinkColor_HEX_preview = '';
			break;

	}

}










