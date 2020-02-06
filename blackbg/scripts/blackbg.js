// Set body's backgroundColor to black if window.location.host is contained in the storaged selected sites (selectedPages).

document.addEventListener('DOMContentLoaded', onDOM_Ready, false);

function onDOM_Ready() {

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

	function setEverythingBlackExceptFrom_A_ElementsWithImages() {

		// Black background
		$("body").find("*").each(function () {
			if ($(this).is("a") || $(this).parent().is("a"))
				return;
			$(this).css('backgroundColor', 'black');
		});
		// $( "body" ).find( "*" ).css('backgroundColor', 'black');
		document.body.style.background = "black";

		// White text
		$("body").find("*").css('color', 'white');

		document.body.style.setProperty("display", "initial", "important");

	}

	function contentScript_main() {
		// Load settings

		chrome.storage.sync.get('itEverything', function (resultItEverything) {

			chrome.storage.sync.get('itEverywhere', function (resultItEverywhere) {

				if (resultItEverywhere.itEverywhere === true) {

					if (resultItEverything.itEverything === true) {
						setEverythingBlackExceptFrom_A_ElementsWithImages();
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
										setEverythingBlackExceptFrom_A_ElementsWithImages();
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

	// if(window.location.host !== "www.youtube.com")
	contentScript_main();
	document.body.style.setProperty("display", "initial", "important");

	debugger;


	
	// setTimeout(() => {
		
	// }, 20);
	
	// $( "body" ).append('<div class="blackbgdiv" style="width: 100%; height: 100%; background-color:black"')




}











