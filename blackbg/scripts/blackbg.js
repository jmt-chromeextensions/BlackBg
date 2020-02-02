// Set body's backgroundColor to black if window.location.host is contained in the storaged selected sites (selectedPages).

$( document ).ready(function() {
	
	// Set every new added child element's background color to black
	function setNewElementsBlack() {
		
		// Mutation Observer instantiation
		var mutationObs = new MutationObserver(function(mutations, mutationObs) 
		{ 
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

	// Load settings
	
	chrome.storage.sync.get('itEverything', function(resultItEverything){
		
		chrome.storage.sync.get('itEverywhere', function(resultItEverywhere){
			
			if (resultItEverywhere.itEverywhere === true) {
				
				if (resultItEverything.itEverything === true) {
					$( "body" ).find( "*" ).css('backgroundColor', 'black');
					$( "body" ).find( "*" ).css('color', 'white');
				}
				else
					document.body.style.background = "black";
				
				setNewElementsBlack();
				
			} else {
				
				var page = window.location.host;
				var selectedPages = '';

				chrome.storage.sync.get('selectedPages', function(result){
					selectedPages = result.selectedPages;
					
					selectedPages.forEach(function(selectedPage) {
						
						if (page.localeCompare(selectedPage.split('/blv_ck_bg/')[0]) == 0) {
							if (selectedPage.split('/blv_ck_bg/')[1].localeCompare('enabled') == 0) {
                                if (resultItEverything.itEverything === true) {
                                    $( "body" ).find( "*" ).css('backgroundColor', 'black');
                                    $( "body" ).find( "*" ).css('color', 'white');
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
	
});