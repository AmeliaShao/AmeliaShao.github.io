function getScrollPercent()
{
  let scrollRange = document.body.offsetHeight - window.innerHeight;
  //return window.scrollY / scrollRange;
  return Math.max(0, Math.min(1, window.scrollY / scrollRange));
}


function updateBackground() {
    let percent = getScrollPercent();
    document.body.style.backgroundColor = `rgba(7, 26, 55, ${0.7+0.3*percent})`;
  }
  
updateBackground();
window.addEventListener('scroll', updateBackground);

function updateStarPosition() {
    let percent = getScrollPercent();
    let maxMove = window.innerHeight + 200; // 让星星从顶部到底部
    let translateY = percent * maxMove ; // 计算垂直移动距离
    
    document.getElementById("star").style.transform = `translate(-50%, ${translateY}px)`;
}

window.addEventListener("scroll", updateStarPosition);
updateStarPosition(); 