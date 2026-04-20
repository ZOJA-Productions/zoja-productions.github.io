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

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {

      const elements = entry.target.querySelectorAll(".reveal, .reveal-ui");

      // Special treatment for header (hero section)
      const baseDelay = entry.target.id === "header" ? 300 : 0;

      elements.forEach((el, index) => {
        const isUI = el.classList.contains("reveal-ui");
        const isTextLike = el.classList.contains("reveal-as-text"); // paragraph-like delay for storeLink header

        let extraDelay = 0;

        if (isTextLike) {
          extraDelay = 40;
        }

        if (isUI && !isTextLike) {
          extraDelay = 80;
        }

        setTimeout(() => {
          el.classList.add("show");
        }, baseDelay + index * 120 + extraDelay);
      });

      observer.unobserve(entry.target); // animate only once
    }
  });
}, {
  threshold: 0.25,
  rootMargin: "0px 0px -50px 0px"
});

// Observe sections instead of individual text elements
document.querySelectorAll("#header, .row, #footer").forEach(section => {
  observer.observe(section);
});