const hexToRgb = hex =>
  `rgb (${hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
	,(m, r, g, b) => '#' + r + r + g + g + b + b)
.substring(1).match(/.{2}/g)
.map(x => parseInt(x, 16))
.join(", ")})`
  

const HTML_ELEMENTS_EXCEPTIONS = "script, noscript, style, link, img, video";
const HTML_VIP_ELEMENTS = 
".chat-author__display-name, textarea[autocomplete='twitch-chat'], .sp-thumb-inner"; // Twitch chat usernames
	                            // Twitch chat box // Spectrum sample palette colors

var customBgColor_HEX;
var customBgColor_RGB;
var customTextColor_HEX;
var customTextColor_RGB;

var customBgColor_HEX_preview;
var customTextColor_HEX_preview;

var pageEnabled = false;
var itEverywhere = false;

// Set body's backgroundColor to black if window.location.host is contained in the storaged selected sites (selectedPages).
var setBgColorInterval;
var mutationObs = new MutationObserver(function(mutations) {
	setNewElementsColor(mutations);
});    

$(document).ready(function () {
	activateCustomBgModeIfPageSelectedOrItEverywhere();
});

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
			customBgColor_HEX_preview = msg.color;
			// customBgColor_RGB = hexToRgb(customBgColor_HEX);
			setSiteColorForPreview(true);
			break;

		case "setSiteTextColorForPreview":
			customTextColor_HEX_preview = msg.color;
			// customTextColor_RGB = hexToRgb(customTextColor_HEX);
			setSiteColorForPreview(false);
			break;

		case "stopPreviewBackground":
			stopPreview(true);
			break;

		case "stopPreviewText":
			stopPreview(false);
			break;
	}

});

function activateCustomBgModeIfPageSelectedOrItEverywhere() {

	// Load settings
	chrome.storage.sync.get(['itEverywhere', 'selectedPages'], function (result) {

		if (result.itEverywhere === true)
			itEverywhere = true;

		let current_page = window.location.host;
		let selectedPages = '';

		selectedPages = result.selectedPages;

		if (selectedPages)
			selectedPages.forEach(function (selectedPage) {

				let siteValues = selectedPage.split('/blv_ck_bg/')

				if (current_page === siteValues[0])
					if (siteValues[1] === "enabled") {
						pageEnabled = true;

						if (siteValues.length == 2) {
							customBgColor_HEX = "#000000" // Black by default
							customBgColor_RGB = hexToRgb(customBgColor_HEX);
						}
						else {
							customBgColor_HEX = `#${siteValues[2]}`
							customBgColor_RGB = hexToRgb(customBgColor_HEX);
						}

						if (siteValues.length == 4) { // Is there a better offer?
							customTextColor_HEX = `#${siteValues[3]}`
							customTextColor_RGB = hexToRgb(customTextColor_HEX);
						}

					}
			});

		if (pageEnabled || itEverywhere)
			initCustomBgMode();
	});
}

function setEverythingColorExceptElementsWithTransparentBackground() {

	$("body").find("*").not(`.blackbg_pass, .blackbg_lets_go, .blacktc_lets_go, ${HTML_ELEMENTS_EXCEPTIONS}, ${HTML_VIP_ELEMENTS}`).each(function () {

		if (!window.getComputedStyle(this).getPropertyValue("background-color").startsWith("rgba(0, 0, 0, 0") && 
			!window.getComputedStyle(this).getPropertyValue("background-color").startsWith("rgb(0, 0, 0")) 
		{
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

function replaceCssAttributeValue(elem, attribute, value, important) {
	const regex = new RegExp(`; ${attribute}:[^;]*;`);
	let cssText_WithReplacedValue = $(elem).css('cssText').replace(regex, `; ${attribute}:${value}${important ? " !important" : ""};`);
	$(elem).css('cssText', cssText_WithReplacedValue);
}

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

}

function setSiteColorForPreview(background) {

	if (background)
		$("html,body, .blackbg_lets_go").each(function(){
			setCssProp_storePropInDataAttributeIfExistant(this, "background-color", customBgColor_HEX_preview, true)
		});
	else
		$("html,body, .blacktc_lets_go").each(function(){
			setCssProp_storePropInDataAttributeIfExistant(this, "color", customTextColor_HEX_preview, true)
		});

}

function stopPreview (background) { 

	if (background)
		$("html,body, .blackbg_lets_go").each(function(){
			setCssProp_storePropInDataAttributeIfExistant(this, "background-color", customBgColor_HEX, true)
		});
		
	else
		$("html,body, .blacktc_lets_go").each(function(){
			setCssProp_storePropInDataAttributeIfExistant(this, "color", customTextColor_HEX, true)
		});

}










