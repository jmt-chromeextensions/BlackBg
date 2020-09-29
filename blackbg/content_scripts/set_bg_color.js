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

	if (window.location.hostname !== msg.domain)
		return;

	if (msg.action === "activateBlackBgMode")
		initBlackMode();

	else if (msg.action == 'deactivateBlackBgMode')
		revertBlackMode();

});

function activateBlackModeIfPageSelectedOrItEverywhere() {

	// Load settings
	chrome.storage.sync.get('itEverywhere', function (resultItEverywhere) {

		if (resultItEverywhere.itEverywhere === true) {
			initBlackMode();
		} else {

			let current_page = window.location.host;
			let selectedPages = '';

			chrome.storage.sync.get('selectedPages', function (result) {
				selectedPages = result.selectedPages;
				selectedPages.forEach(function (selectedPage) {

					if (current_page === selectedPage.split('/blv_ck_bg/')[0]) 
						if (selectedPage.split('/blv_ck_bg/')[1] === "enabled") 
							initBlackMode();
						
				});
			});
		}
	});
}

function setEverythingBlackExceptElementsWithTransparentBackground() {

	$("body").find("*").not(".blackbg_pass, .blackbg_lets_go, script, noscript, style, link, img, video").each(function () {

		if (!window.getComputedStyle(this).getPropertyValue("background-color").startsWith("rgba(0, 0, 0, 0") && 
			!window.getComputedStyle(this).getPropertyValue("background-color").startsWith("rgb(0, 0, 0")) {
			setCssProp_storePropInDataAttributeIfExistant(this, "background-color", "black", true);
			
			// Add class to mark the elements whose backgrounds have already been set to black
			$(this).addClass("blackbg_lets_go");
		}
		
		// All texts' color need to be white
		if (!window.getComputedStyle(this).getPropertyValue("color").startsWith("rgb(255, 255, 255"))
			setCssProp_storePropInDataAttributeIfExistant(this, "color", "white", true);
		
		// Add class this class to mark elements that have been already processed by this function
		$(this).addClass("blackbg_pass");
	});

}

function setNewElementsBlack(mutations) {
	for (let i = 0, length = mutations.length; i < length; i++) {

		for (let j = 0, length2 = mutations[i].addedNodes.length; j < length2; j++) {
			if (mutations[i].addedNodes[j]) {

				if (!$(mutations[i].addedNodes[j]).hasClass("blackbg_lets_go"))
					if (!window.getComputedStyle(mutations[i].addedNodes[j]).getPropertyValue("background-color").startsWith("rgba(0, 0, 0, 0")) 
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
	});

	setEverythingBlackExceptElementsWithTransparentBackground();
	setBgColorInterval = setInterval(setEverythingBlackExceptElementsWithTransparentBackground, 10);
	mutationObs.observe(document.body, { childList: true, attributes: true, subtree: true });
}

function revertBlackMode () {

	clearInterval(setBgColorInterval);
	mutationObs.disconnect();

	$("html, body").each(function () {
		removePropertyOrSetIfStored(this, "background-color");
		removePropertyOrSetIfStored(this, "color");
	});

	$(".blackbg_lets_go").each(function () {
		removePropertyOrSetIfStored(this, "background-color");
		removePropertyOrSetIfStored(this, "color");
		$(this).removeClass("blackbg_lets_go");
	});

	$(".blackbg_pass").each(function () {
		removePropertyOrSetIfStored(this, "color");
		$(this).removeClass("blackbg_pass");
	});

}











