function getScrollPercent()
{
  let scrollRange = document.body.offsetHeight - window.innerHeight;
  return Math.max(0, Math.min(1, window.scrollY / scrollRange));
}

//background color change
function updateBackground() {
    let percent = getScrollPercent();
    document.body.style.backgroundColor = `rgba(7, 26, 55, ${0.7+0.3*percent})`;
  }
  
updateBackground();
window.addEventListener('scroll', updateBackground);

//star fall
function updateStarPosition() {
    let percent = getScrollPercent();
    let maxMove = window.innerHeight + 200; 
    let translateY = percent * maxMove ; 
    
    document.getElementById("star").style.transform = `translate(-50%, ${translateY}px)`;
}

window.addEventListener("scroll", updateStarPosition);
updateStarPosition(); 