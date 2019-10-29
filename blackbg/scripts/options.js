// Save options

$( document ).ready(function() {
	
	// Load settings
	chrome.storage.sync.get('itEverywhere', function(result) {
		$('#checkEverywhere').prop('checked', result.itEverywhere);
	});
	
	chrome.storage.sync.get('itEverything', function(result) {
		$('#checkEverything').prop('checked', result.itEverything);
	});
	
    // Save button
	$('#btnSave').click(function() {
		
		chrome.storage.sync.set({'itEverywhere': $('#checkEverywhere').prop('checked')}, function() { 
			chrome.storage.sync.set({'itEverything': $('#checkEverything').prop('checked')}, function() { alert('Options saved!'); })
		})
		
		
	});

});











