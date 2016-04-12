// Code to handle dictionary load and provide definitions

var once = false; // only load the dictionary on starting chrome
window.addEventListener("load", function () {
    if ( once == true ) { return; }
	loadDictionary();	
    once = true;
}, false);

function loadDictionary() {
	var dictionaryData = []; // array of objects of words and definitions
	var dictionaryPath = chrome.extension.getURL('cedict_ts.u8');
	
	$.get(dictionaryPath, function(data) {
			var match;
			var regex_dict = /(\S+) (\S+) \133([^\135]+)\135 \057([^\057]+)/g; // need to get additional definitions
			while ( match = regex_dict.exec(data) ) {
				dictionaryData.push({
					traditional: match[1],
					simplified: match[2],
					pinyin: match[3],
					english: match[4]
				});
			}				
			sortDictionaryData(dictionaryData); // sort so longest words first

			// request listener for dictionary
			chrome.runtime.onMessage.addListener(
			  function(request, sender, sendResponse) {
				  if (request.greeting == "i want the dictionary") {
					  sendResponse(dictionaryData);
				  }
			  });
	},'text');
}
// function to sort dictionary into largest words first
function sortDictionaryData(dictionary) {
	dictionary.sort(function(a, b){
		return b.simplified.length - a.simplified.length; // DESC -> b - a
	});
}