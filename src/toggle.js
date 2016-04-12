// Code to switch extension on and off

var toggle = false;
chrome.browserAction.onClicked.addListener(function(tab) {
  toggle = !toggle;
  if(toggle){
	  chrome.browserAction.setTitle({title :"Disable Chinese Tooltip"});
	  chrome.browserAction.setIcon({path: "icon-on.png"});
	  switchExtension("switch on extension");
  }
  else {
	  chrome.browserAction.setTitle({title :"Enable Chinese Tooltip"});
	  chrome.browserAction.setIcon({path: "icon-off.png"});
	  switchExtension("switch off extension");  }
});

// for other scripts to check if we are active
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
	  if (request.greeting == "shall we translate chinese") {
		  sendResponse(toggle);
	  }
  });
  
function switchExtension(message) {
	 //send message to all tabs
	chrome.tabs.query({}, function(tabs){ 
		for (var i=0; i<tabs.length; ++i) {
			chrome.tabs.sendMessage(tabs[i].id, {greeting: message}, function(response) { });
		}
	});
 }