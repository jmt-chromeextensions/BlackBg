// Manage interaction with the popup and the selected pages list.

var selectedPages = '';
$( document ).ready(function() {
	
	// Add current page button
	$('#addBtn').click(function() {
		addNewSelectedPage();
	});
	
	// Show the pages that are currently selected
	chrome.storage.sync.get('selectedPages', function(result){
		
		if (result.selectedPages) {
		
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
				if (value.split('/blv_ck_bg/')[1].localeCompare('enabled') == 0)
					input.checked = true;
				
				var span = document.createElement("span");
				span.className = 'slider round';
				
				var pageSpan = document.createElement("span");
				pageSpan.className = 'pageName';
				pageSpan.innerHTML = value.split('/blv_ck_bg/')[0];
				
				var removeImg = document.createElement("input");
				removeImg.type = 'image';
				removeImg.src = "icons/delete.png"
				removeImg.id = 'remove' + i;

				label.appendChild(input);
				label.appendChild(span);
				
				div.appendChild(pageSpan);
				div.appendChild(label);
				div.appendChild(removeImg);
				
				document.getElementById("saveListSelection").appendChild(div); 
			});	
			
		} else {
			selectedPages = [];
		}
		
	});

});

function addNewSelectedPage() {
	
	var currentTabQuery = { active: true, currentWindow: true, 'windowId': chrome.windows.WINDOW_ID_CURRENT };
	chrome.tabs.query(currentTabQuery, getCurrentDomain);
  
}

function getCurrentDomain(tabs) {
	
	var domain = new URL(tabs[0].url).hostname;
	var currentPage = domain + '/blv_ck_bg/enabled';
	
	selectedPages.push(currentPage);
	chrome.storage.sync.set({'selectedPages': selectedPages}, function() { console.log (selectedPages); })
  
}














