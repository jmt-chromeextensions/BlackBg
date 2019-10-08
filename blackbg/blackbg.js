// Set body's backgroundColor to black if window.location.host is contained in the storaged selected sites (selectedPages).

$( document ).ready(function() {
	
	var page = window.location.host;
	var selectedPages = '';
	var selectedDomains = [];

	chrome.storage.sync.get('selectedPages', function(result){
		selectedPages = result.selectedPages;
		
		selectedPages.forEach(function(selectedPage) {
			
			if (page.localeCompare(selectedPage.split('/blv_ck_bg/')[0]) == 0) {
				if (selectedPage.split('/blv_ck_bg/')[1].localeCompare('enabled') == 0) {
					document.body.style.background = "black";
				}
			}
			
		});

	});
	
});