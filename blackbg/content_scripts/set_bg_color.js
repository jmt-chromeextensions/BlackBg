// Set body's backgroundColor to black if window.location.host is contained in the storaged selected sites (selectedPages).

// $(document).ready(function () {

var mutationObs;

activateBlackModeIfPageSelectedOrItEverywhere();

// Set every new added child element's background color to black
function setNewElementsBlack() {

	// Mutation Observer instantiation
	mutationObs = new MutationObserver(function (mutations) {
		for (let i = 0, length = mutations.length; i < length; i++) {

			for (let j = 0, length2 = mutations[i].addedNodes.length; j < length2; j++) {
				if (mutations[i].addedNodes[j]) {
					// $(mutations[i].addedNodes[j]).addClass("blackbg_lets_go");
					// $(mutations[i].addedNodes[0]).css('cssText', 'background-color: black !important; color: white !important');

					if (!$(mutations[i].addedNodes[j]).hasClass("blackg_lets_go"))
					if (!window.getComputedStyle(mutations[i].addedNodes[j]).getPropertyValue("background-color").startsWith("rgba(0, 0, 0, 0")) {
						// $(mutations[i].addedNodes[0]).css('background-color', 'black');
						// $(mutations[i].addedNodes[0]).css('color', 'white');
						// replaceCssAttributeValue(mutations[i].addedNodes[j], 'background-color', 'black', true)
						// replaceCssAttributeValue(mutations[i].addedNodes[j], 'color', 'white', true)
						mutations[i].addedNodes[j].style.setProperty('background-color', 'black', 'important')
						mutations[i].addedNodes[j].style.setProperty('color', 'white', 'important')
						$(mutations[i].addedNodes[j]).addClass("blackg_lets_go");
					}
					
				}
			}

			if (mutations[i].target) {

				if (!window.getComputedStyle(mutations[i].target).getPropertyValue("background-color").startsWith("rgba(0, 0, 0, 0")) {
				// $(mutations[i].target).addClass("blackbg_lets_go");
					mutations[i].target.style.setProperty('background-color', 'black', 'important')
					mutations[i].target.style.setProperty('color', 'white', 'important')
					// replaceCssAttributeValue(mutations[i].target, 'background-color', 'black', true)
					// replaceCssAttributeValue(mutations[i].target, 'color', 'white', true)
				// $(mutations[i].target).css('background-color', 'black');
				// $(mutations[i].target).css('color', 'white');
				}
			}

		}
	});

	// Observe initialization
	mutationObs.observe(document.body, { childList: true, attributes: true, subtree: true });

}

function setEverythingBlackWithExceptions() {

	// Black background
	$("body").find("*").not(".blackg_pass, .blackbg_lets_go, img, video").each(function () {

		if (!window.getComputedStyle(this).getPropertyValue("background-color").startsWith("rgba(0, 0, 0, 0")) {
			// Add class to mark the elements whose backgrounds have already been set to black
			// $(this).css('cssText', 'background-color: black !important; color: white !important');
			// replaceCssAttributeValue(this, 'background-color', 'black', true)
			this.style.setProperty('background-color', 'black', 'important')
			// $(this).css('background-color', 'black');
			// $(this).css('color', 'white');
			$(this).addClass("blackg_lets_go");
		}
		else {
			console.log('hey');
		}
		$(this).addClass("blackg_pass");
		this.style.setProperty('color', 'white', 'important')
		// replaceCssAttributeValue(this, 'color', 'white', true)
	});

	// $("body").find("*").css('color', 'white');

}

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

					if (current_page.localeCompare(selectedPage.split('/blv_ck_bg/')[0]) == 0) {
						if (selectedPage.split('/blv_ck_bg/')[1].localeCompare('enabled') == 0) {
							initBlackMode();
						}
					}
				});
			});
		}
	});
}

function replaceCssAttributeValue(elem, attribute, value, important) {
	const regex = new RegExp(`; ${attribute}:[^;]*;`);
	let cssText_WithReplacedValue = $(elem).css('cssText').replace(regex, `; ${attribute}:${value}${important ? " !important" : ""};`);
	$(elem).css('cssText', cssText_WithReplacedValue);
	console.log('ola')
}	

function initBlackMode() {
	// Page background
	$("html")[0].style.setProperty('background-color', 'black', 'important')
	document.body.style.background = "black";

	setEverythingBlackWithExceptions();
	setNewElementsBlack();
	setInterval(setEverythingBlackWithExceptions, 250);
}











