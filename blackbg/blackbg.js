// Set body's backgroundColor to black if window.location.host is contained in the storaged selected sites (selectedPages).

$( document ).ready(function() {
	
	// $('*').css('background-color', 'black');
	// $('*').css('color', 'white');

	var page = window.location.host;
	var selectedPages = '';

	chrome.storage.sync.get('selectedPages', function(result){
		selectedPages = result.selectedPages;
		
		if (selectedPages.includes(page))
			document.body.style.background = "black";
		
	});
		
	
	
	

});