// Get the canvas element and set up the context for drawing
const canvas = document.getElementById('meteorCanvas');
const ctx = canvas.getContext('2d');

// Set the canvas size to match the window size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Meteor class to define each meteor's properties and behavior
class Meteor {
  constructor() {
    this.reset();  // Initialize meteor properties
  }

  // Reset meteor position and properties
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * -canvas.height;
    this.length = Math.random() * 80 + 10;
    this.speed = Math.random() * 4 + 4;
    this.angle = Math.PI / 4;
    this.alpha = Math.random() * 0.5 + 0.3;
  }

  // Update meteor position
  update() {
    this.x += this.speed * Math.cos(this.angle);
    this.y += this.speed * Math.sin(this.angle);
    if (this.y > canvas.height || this.x > canvas.width) this.reset();  // Reset if out of bounds
  }

  // Draw the meteor on the canvas
  draw() {
    ctx.strokeStyle = `rgba(255, 255, 255, ${this.alpha})`;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(
      this.x - this.length * Math.cos(this.angle),
      this.y - this.length * Math.sin(this.angle)
    );
    ctx.stroke();
  }
}

// Create an array of 50 meteors
const meteors = Array.from({ length: 50 }, () => new Meteor());

// Animate the meteors
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear canvas for the next frame
  meteors.forEach((meteor) => {
    meteor.update();
    meteor.draw();
  });
  requestAnimationFrame(animate);  // Request the next animation frame
}

// Start the animation loop
animate();
