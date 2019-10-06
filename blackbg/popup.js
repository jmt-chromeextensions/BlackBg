// Manage interaction with the popup and the selected pages list.

$( document ).ready(function() {
	
	var selectedPages = ''
	var pageList = '';
	
	// Save button
	$("#save").click(function(){
		
		chrome.storage.sync.set({'selectedPages': $("#saveList").val().split(',')}, function() {
			console.log ('List saved: ' + $("#saveList").val()); 
		});
		
	});
	
	// Show the pages that are currently selected
	chrome.storage.sync.get('selectedPages', function(result){
		
		selectedPages = result.selectedPages;
		
		// Display every page name with its own toggle switch
		selectedPages.forEach(function (value, i) {
			var div = document.createElement("div");
			div.className = 'pageList';
			
			var label = document.createElement("label");
			label.className = 'switch';
			label.id = 'lbl' + i;
			
			var input = document.createElement("input");
			input.type = 'checkbox';
			input.id = 'switch' + i;
			
			var span = document.createElement("span");
			span.className = 'slider round';
			
			var pageSpan = document.createElement("span");
			pageSpan.innerHTML = value;

			label.appendChild(input);
			label.appendChild(span);
			
			div.appendChild(pageSpan);
			div.appendChild(label);
			
			document.getElementById("saveListSelection").appendChild(div); 
		});	
	
		$("#saveList").val(pageList);
		
	});
	

});