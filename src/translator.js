function init() {
	console.log("Chinese being prepared");		
	
	// get dictionary
	chrome.runtime.sendMessage({greeting: "i want the dictionary"}, function(response) {
		// callback
		var currT = new Date() - t1;
		console.log("Received dictionary", currT/1000);
		addTextSpans(response); // got data, can now add spans to text nodes
	});
}

// find text on page, and add text spans
function addTextSpans(dictionaryData) {
	// get all text nodes
	var $textNodes = $(":not(script,style,textarea)").contents().filter(function() {
		return (this.nodeType === 3 && $.trim(this.nodeValue) !== ''); //Node.TEXT_NODE and not white space
	});
	prevText = [];
	$textNodes.each(function() {
		var $this = $(this);
		if ($.inArray($this.text(), prevText) < 0) { // avoid adding spans to duplicate text nodes
			prevText.push($this.text());
			$this.replaceWith("<span class='textNode'>"+$this.text()+"</span>"); 
		}		
	});
	$('.textNode').hover(function(){
		addSpans(dictionaryData, $(this)); // on hover, add chinese spans on characters
	},function(){ 
		// hover out
	});
	var currT = new Date() - t1;
	console.log("Text spans added", currT/1000); // finished
}

// remove spans, for switching off extension
function removeSpans() {
	$('div span[class="textNode"], div span[class="chinese_span"]').each(function(index) {
		var text = $(this).text();//get span content
		$(this).replaceWith(text);//replace all span with just content
	});
	console.log("spans removed");
}

// add spans to words in dictionary
function addSpans(dictionaryData, $this) {
	var text = $this.text();	

	for (var i = 0; i < dictionaryData.length; i++){
			obj = dictionaryData[i];
			if( text.indexOf(obj.simplified) != -1 ) { // if text contains dict entry add spans 
				text = text.replace(new RegExp(obj.simplified, 'g'), "<span class='chinese_span'>"+obj.simplified+"</span>");
			}
	}
	
	$this.replaceWith(text); // update text (must happen after all spans added). also removes text node tag		

	// remove child spans
	$('div span[class="chinese_span"]').find("span").each(function(index) {
		var text = $(this).text();//get span content
		$(this).replaceWith(text);//replace all span with just content
	});
	
	// only affect our created spans
	var $words = $('div span[class="chinese_span"]'); 
	$words.hover(
		function() { 
			$(this).css('background-color','#ffff66');
		},
		function() { 
			$(this).css('background-color','');
		}
	);	
	// qtip on created span
	$words.qtip({
		content: {
			text: function(){return wordLookup(dictionaryData, $(this).html())}
		},
		show: 'mouseover',
		hide: 'mouseout'
	});
}

// look up word in dictionary
function wordLookup(dictionaryData, word){
	var definition = "couldn't find definition";
	var pinyin = "no pinyin";
	$.map(dictionaryData, function(obj) {
		if(obj.simplified == word) {
			if (definition == "couldn't find definition") {
				definition = obj.english; // add english definition
			} else {
				definition += ",<br>"+obj.english; // alternate definitions
			}
			pinyin = obj.pinyin; // add pinyin definition
		}
	});
	return "<b>"+pinyin+"</b>"+",<br>"+definition;
}

// global time var
var t1;
$(document).ready(function(){	
	t1 = new Date();
	
	// first check if we want to activate extension
	chrome.runtime.sendMessage({greeting: "shall we translate chinese"}, function(response) {
		// callback
		var currT = new Date() - t1;
		console.log("Check if extension on, response", response, currT/1000);
		if (response) {
			init();
		}
	});
	
	// check for further messages to switch on/off
	chrome.runtime.onMessage.addListener(
	  function(request, sender, sendResponse) {
		  if (request.greeting == "switch on extension") {
			  t1 = new Date(); // reset timer
			  init();
		  } else if (request.greeting == "switch off extension") {
			  removeSpans();
		  }
	  });
}); 
