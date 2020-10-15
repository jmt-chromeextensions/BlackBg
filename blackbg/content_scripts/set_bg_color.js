const HTML_ELEMENTS_EXCEPTIONS = "script, noscript, style, link, img, video";
const HTML_VIP_ELEMENTS = 
".chat-author__display-name"; // Twitch chat usernames

var pageEnabled = false;
var itEverywhere = false;

// Set body's backgroundColor to black if window.location.host is contained in the storaged selected sites (selectedPages).
var setBgColorInterval;
var mutationObs = new MutationObserver(function(mutations) {
	setNewElementsBlack(mutations);
});    

$(document).ready(function () {
	activateBlackModeIfPageSelectedOrItEverywhere();
});

// Inbox 📫
chrome.extension.onMessage.addListener(function (msg) {

	// Apply on all pages
	if (msg.action === "applyOnAllPages") {
		itEverywhere = true;
		if (!pageEnabled)
			initBlackMode();
		return;
	}

	if (msg.action === "notApplyOnAllPages") {
		itEverywhere = false;
		if (!pageEnabled)
			revertBlackMode();
		return;
	}

	if (window.location.hostname !== msg.domain)
		return;

	if (msg.action === "activateBlackBgMode") {
		pageEnabled = true;
		if (!itEverywhere)
			initBlackMode();
	}

	else if (msg.action == 'deactivateBlackBgMode') {
		pageEnabled = false;
	 	if (!itEverywhere)
			revertBlackMode();
	}

});

function activateBlackModeIfPageSelectedOrItEverywhere() {

	// Load settings
	chrome.storage.sync.get(['itEverywhere', 'selectedPages'], function (result) {

		if (result.itEverywhere === true)
			itEverywhere = true;

		let current_page = window.location.host;
		let selectedPages = '';

		selectedPages = result.selectedPages;

		if (selectedPages)
			selectedPages.forEach(function (selectedPage) {

				if (current_page === selectedPage.split('/blv_ck_bg/')[0])
					if (selectedPage.split('/blv_ck_bg/')[1] === "enabled") {
						pageEnabled = true;
					}
			});

		if (pageEnabled || itEverywhere)
			initBlackMode();
	});
}

function setEverythingBlackExceptElementsWithTransparentBackground() {

	$("body").find("*").not(`.blackbg_pass, .blackbg_lets_go, ${HTML_ELEMENTS_EXCEPTIONS}, ${HTML_VIP_ELEMENTS}`).each(function () {

		if (!window.getComputedStyle(this).getPropertyValue("background-color").startsWith("rgba(0, 0, 0, 0") && 
			!window.getComputedStyle(this).getPropertyValue("background-color").startsWith("rgb(0, 0, 0")) {
			setCssProp_storePropInDataAttributeIfExistant(this, "background-color", "black", true);
			
			// Add class to mark the elements whose backgrounds have already been set to black
			$(this).addClass("blackbg_lets_go");
		}
		
		// All texts' color need to be white
		if (!window.getComputedStyle(this).getPropertyValue("color").startsWith("rgb(255, 255, 255"))
			if (!$(this).is("a")) 
				setCssProp_storePropInDataAttributeIfExistant(this, "color", "white", true);
			 
		
		// Add class this class to mark elements that have been already processed by this function
		$(this).addClass("blackbg_pass");
	});

	$("a").each(function () {
		if (window.getComputedStyle(this).getPropertyValue("color").startsWith("rgb(0, 0, 0") || 
		window.getComputedStyle(this).getPropertyValue("color").startsWith("rgb(26, 13, 171") || window.getComputedStyle(this).getPropertyValue("color").startsWith("rgb(26, 115, 232"))
			$(this).addClass("blackbg_link");
	});

}

function setNewElementsBlack(mutations) {
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
	if ($(elem).css(`${prop}`))
		$(elem).data(`blackbg-bg-${prop}`, $(elem).css(`${prop}`));
	else
		$(elem).data(`blackbg-bg-${prop}`, window.getComputedStyle($(elem)).getPropertyValue(`${prop}`));

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

function initBlackMode() {

	// Page background
	$("html, body").each(function () {
		setCssProp_storePropInDataAttributeIfExistant(this, "background-color", "black", true);
		setCssProp_storePropInDataAttributeIfExistant(this, "color", "white", true);
		// setCssProp_storePropInDataAttributeIfExistant(this, "background", "none", true);
		// setCssProp_storePropInDataAttributeIfExistant(this, "background-image", "none", true);
		if (!$(this).css("background").startsWith("rgb(0, 0, 0") && !$(this).css("background").startsWith("rgba(0, 0, 0")) {
			$(this).css("background", "none");
		}

		if (!$(this).css("background-image").startsWith("rgb(0, 0, 0") && !$(this).css("background-image").startsWith("rgba(0, 0, 0")) {
			$(this).css("background-image", "none");
		}

		// $(this).css("background", `${$(this).css("background")}pepe`);
		// $(this).css("background-image", `${$(this).css("background-image")}pepe`);
	});

	setEverythingBlackExceptElementsWithTransparentBackground();
	setBgColorInterval = setInterval(setEverythingBlackExceptElementsWithTransparentBackground, 10);
	// mutationObs.observe(document.body, { childList: true, attributes: true, subtree: true });
}

function revertBlackMode () {

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

	$(".blackbg_link").removeClass("blackbg_link");

	$(".blackbg_pass").each(function () {
		removePropertyOrSetIfStored(this, "color");
		$(this).removeClass("blackbg_pass");
	});

}











