// An array of stories as strings
let stories = [
	'Hello! I am a special fish under the sea',
	'My tail is transparent, so I always want to find the best color to fit my tail.',
	'WaIt! What is this?!',
	'This is the best color I have ever seen!!',
    'What a happy day!!'
];

function scrollPage(){
	// this keyword returns the HTML element that triggered the event (in this case, click event)
	// Check id of this HTML element
	// If id name is 'third-page'
	if(this.id === 'third-page'){
		window.scrollTo({
			// Scroll twice the height of window height
  			top: window.innerHeight * 2,
  			left: 0,
  			// Setting behavior to 'smooth' will animate the scroll
  			behavior: 'smooth'
		});
	}
    // If id name is 'fourth-page'
	if(this.id === 'fourth-page'){
		window.scrollTo({
			// Scroll three times the height of window height
  			top: window.innerHeight * 3,
  			left: 0,
  			behavior: 'smooth'
		});
	}
}

let fishDiv = document.getElementById('fish-div');
let fishText = document.getElementById('fish-text');
// Add scroll event for the whole HTLM document and set changeText function as callback
document.addEventListener('scroll', changeText);

// changeText function runs whenever scroll happens on the web page
function changeText(){
	// Uncomment line below to see scrollY position change
	 //console.log(window.scrollY);

	// pos saves current scrollY position
	let pos = window.scrollY;
	// width saves current web page width
	let width = window.innerWidth;
	// height saves current web page height
	let height = window.innerHeight;
	// Calculate which section the user has scrolled to
	// parseInt() function used to ignore decimals
	let sectionNum = parseInt(pos / height);

	// Set the text of fish-text element depending on which section the user has currently scrolled to
	fishText.innerHTML = stories[sectionNum];
	// Map vertical scroll position to the horizontal position of the fish
	fishDiv.style.right = pos / (height * 5) * width + 'px';
}

