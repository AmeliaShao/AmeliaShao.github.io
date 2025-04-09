document.addEventListener("DOMContentLoaded", function () {
    const arrow = document.getElementById("arrow-image");
    const section2 = document.getElementById("section2");

    arrow.addEventListener("click", function () {
        section2.scrollIntoView({ behavior: "smooth" });
    });
});


// glowing text element
const glowingText = document.querySelector('.overlay span');

//variables for controlling the glow effect
let glowIntensity = 1; // blur radius (reduced for subtle effect)
let increasing = true; // direction of the glow

// animate the glow effect
function animateGlow() {
    // pudate the blur radius based on the direction
    if (increasing) {
        glowIntensity += 0.05; //  increase intensity
        if (glowIntensity >= 2) increasing = false; // reverse direction at max intensity
    } else {
        glowIntensity -= 0.05; //  decrease intensity
        if (glowIntensity <= 1) increasing = true; // reverse direction at min intensity
    }

    // apply the updated text-shadow style to create a subtle glow effect
    glowingText.style.textShadow = `
        0 0 ${glowIntensity}px #FFD700,
        0 0 ${glowIntensity * 1.5}px #FFD700,
        0 0 ${glowIntensity * 2}px #FFA500`;

    // Request the next animation frame
    requestAnimationFrame(animateGlow);
}

// start the animation
animateGlow();


// Select the arrow element
const arrow = document.getElementById('arrow-image');

// Add a scroll event listener to the window
window.addEventListener('scroll', () => {
    // Check if the user has scrolled past bgimage1
    const bgImage1Height = document.querySelector('.bgimage1').offsetHeight;

    if (window.scrollY > bgImage1Height - 50) { // Adjust threshold as needed
        arrow.classList.add('hidden'); // Hide the arrow by adding the "hidden" class
    } else {
        arrow.classList.remove('hidden'); // Show the arrow if scrolled back up
    }
});




//progress bar 
const audio = document.getElementById("audio");
const progressBar = document.getElementById("progress-bar");
const progressContainer = document.querySelector(".progress-container");
const playButton = document.querySelector(".play-button");

// update progress as audio plays
audio.addEventListener("timeupdate", function () {
    if (audio.duration) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = progressPercent + "%";
        
        // Control glow intensity based on progress
        updateGlowIntensity(progressPercent);
    }
});

// can click anywhere on the progress bar to seek
progressContainer.addEventListener("click", function (e) {
    const clickPosition = e.offsetX / this.offsetWidth;
    const seekTime = clickPosition * audio.duration;
    audio.currentTime = seekTime;
});

// Play/pause toggle
playButton.addEventListener("click", function () {
    if (audio.paused) {
        audio.play();
        playButton.innerHTML = "&#10074;&#10074;";
        document.querySelector('.glow-container').classList.add('active');
    } else {
        audio.pause();
        playButton.innerHTML = "&#9658;";
        document.querySelector('.glow-container').classList.remove('active');
    }
});

// Add this to your existing JavaScript
/*document.querySelector('.w3-button').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('about').scrollIntoView({ 
        behavior: 'smooth' 
    });
});*/
// Add this to your existing JavaScript
document.addEventListener("DOMContentLoaded", function() {
    const leftText = document.querySelector('.left-text');
    const rightText = document.querySelector('.right-text');
    
    // Make the text more dynamic with mouse movement
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        leftText.style.setProperty('--tx', `${(x - 0.5) * 10}px`);
        rightText.style.setProperty('--tx', `${(x - 0.5) * 10}px`);
        leftText.style.transform = `translateY(${(y - 0.5) * 10}px) translateX(-100%)`;
        rightText.style.transform = `translateY(${(y - 0.5) * 10}px) translateX(100%)`;
    });
});
function updateGlowIntensity(progress) {
    const glowContainer = document.querySelector('.glow-container');
    const baseIntensity = 80; // Base glow size
    const intensityFactor = progress / 100 * 90; // Additional glow based on progress
    
    if (progress > 0) {
        glowContainer.classList.add('active');
        glowContainer.style.setProperty('--glow-intensity', `${baseIntensity + intensityFactor}px`);
    } else {
        glowContainer.classList.remove('active');
    }
}

// Add this to your DOMContentLoaded event
document.addEventListener("DOMContentLoaded", function() {
    // Initialize glow intensity
    updateGlowIntensity(0);
    
    // Add audio ended event to reset glow
    audio.addEventListener("ended", function() {
        document.querySelector('.glow-container').classList.remove('active');
        updateGlowIntensity(0);
    });
});

// More precise version with animation sync
let hasTriggered = false;

// Add this to your Script1.js
const textTimings = {
    tomorrow: 117.5, // 1:57 for "tomorrow"
    isNow: 118.25    // 2:02 for "is now" (5 seconds after)
};

audio.addEventListener('timeupdate', function() {
    const leftText = document.querySelector('.left-text');
    const rightText = document.querySelector('.right-text');
    
    // Show "tomorrow" at first timing
    if (audio.currentTime >= textTimings.tomorrow && 
        audio.currentTime < textTimings.isNow) {
        leftText.style.opacity = '1';
        leftText.style.visibility = 'visible';
        rightText.style.opacity = '0';
        rightText.style.visibility = 'hidden';
    }
    // Show both at second timing
    else if (audio.currentTime >= textTimings.isNow) {
        leftText.style.opacity = '1';
        leftText.style.visibility = 'visible';
        rightText.style.opacity = '1';
        rightText.style.visibility = 'visible';
    }
    // Hide both if before first timing
    else {
        leftText.style.opacity = '0';
        leftText.style.visibility = 'hidden';
        rightText.style.opacity = '0';
        rightText.style.visibility = 'hidden';
    }
});

// Reset when audio restarts
audio.addEventListener('play', function() {
    if (audio.currentTime < textTimings.tomorrow) {
        const sphereTexts = document.querySelectorAll('.sphere-text');
        sphereTexts.forEach(text => {
            text.style.opacity = '0';
            text.style.visibility = 'hidden';
        });
    }
});

