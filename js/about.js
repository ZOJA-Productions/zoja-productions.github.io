var prevScrollpos = window.scrollY;
var navbar = document.getElementById("navbar");


// Navbar hide and show when scrolling down
window.onscroll = function() {
  var currentScrollPos = window.scrollY;
  if (prevScrollpos > currentScrollPos) {
    navbar.style.top = "0";
  } else {
    navbar.style.top = "-210px";
  }
  prevScrollpos = currentScrollPos;
}
