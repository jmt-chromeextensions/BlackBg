// Set body's backgroundColor to black if window.location.host is contained in the storaged selected sites (selectedPages).
$(document).ready(function () {

	// Set every new added child element's background color to black
	function setNewElementsBlack() {

		// Mutation Observer instantiation
		var mutationObs = new MutationObserver(function (mutations, mutationObs) {
			for (let i = 0, length = mutations.length; i < length; i++) {
				if (mutations[i].addedNodes[0]) {
					// $(mutations[i].addedNodes[0]).css('cssText', 'background-color: black !important');
					$(mutations[i].addedNodes[0]).css("backgroundColor", "black");
				}
			}
		}
		);

		// Observe initialization
		mutationObs.observe(document.body, { childList: true, subtree: true });

	}

	function setEverythingBlackWithExceptions() {

		// Black background
		$("body").find("*").each(function () {
			if (($(this).is("a") || $(this).parent().is("a")
				|| $(this).is("script"))) // Exclude 'a' tags or elements that contain them
				return; // Jump to next iteration
			$(this).css('backgroundColor', 'black');
		});
		// $( "body" ).find( "*" ).css('backgroundColor', 'black');
		document.body.style.background = "black";

		// White text
		$("body").find("*").css('color', 'white');

		

	}

	function blackBg_main() {

		// Load settings
		chrome.storage.sync.get('itEverything', function (resultItEverything) {

			chrome.storage.sync.get('itEverywhere', function (resultItEverywhere) {

				if (resultItEverywhere.itEverywhere === true) {

					if (resultItEverything.itEverything === true) {
						setInterval(setEverythingBlackWithExceptions, 500);
					}
					else
						document.body.style.background = "black";

					setNewElementsBlack();

				} else {

					var page = window.location.host;
					var selectedPages = '';

					chrome.storage.sync.get('selectedPages', function (result) {
						selectedPages = result.selectedPages;

						selectedPages.forEach(function (selectedPage) {

							if (page.localeCompare(selectedPage.split('/blv_ck_bg/')[0]) == 0) {
								if (selectedPage.split('/blv_ck_bg/')[1].localeCompare('enabled') == 0) {
									if (resultItEverything.itEverything === true) {
										setInterval(setEverythingBlackWithExceptions, 500);
									}
									else
										document.body.style.background = "black";

									setNewElementsBlack();
								}
							}

						});

					});

				}

			});

		});

	}

	blackBg_main();

});












