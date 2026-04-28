// ── Navbar hide / show on scroll ──────────────────────────────────────────

var prevScrollpos = window.scrollY;
var navbar = document.getElementById("navbar");

window.onscroll = function () {
    var currentScrollPos = window.scrollY;
    if (prevScrollpos > currentScrollPos) {
        navbar.style.top = "0";
    } else {
        navbar.style.top = "-210px";
    }
    prevScrollpos = currentScrollPos;
};


// ── Timeline data ─────────────────────────────────────────────────────────
//
// Each entry is one marker (tick) on the timeline.
//
//   label    – string shown below the tick, or "" / omit for none
//   tall     – true = taller tick (good for major labels like years)
//   spacing  – pixels between THIS marker and the NEXT one (default 120)
//              omit on the last marker
//   future   – set true on the FIRST marker that is in the future.
//              The timeline line from this marker onward renders brighter/bolder.
//   bubble   – object with content for the pop-up. Only markers with a label
//              and a bubble are clickable. Properties:
//                text  – paragraph text shown in the bubble
//                image – (optional) path to an image shown above the text
//
const timelineMarkers = [
    {
        label: "A Stolen Life", tall: true, spacing: 250,
        bubble: {
            image: "",
            text: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus."
        }
    },
    { label: "", spacing: 150 },
    {
        label: "The Purge", spacing: 150,
        bubble: {
            image: "",
            text: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus."
        }
    },
    { label: "", spacing: 150 },
    {
        label: "The Great Abyss", spacing: 150,
        bubble: {
            image: "",
            text: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus."
        }
    },
    { label: "", spacing: 150 },
    {
        label: "The Second Wave", spacing: 150,
        bubble: {
            image: "",
            text: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus."
        }
    },
    { label: "", spacing: 150 },
    {
        label: "Mingurd's Quest", spacing: 150,
        bubble: {
            image: "",
            text: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus."
        }
    },
    { label: "", spacing: 150 },
    {
        label: "A Lost Time", spacing: 150,
        bubble: {
            image: "",
            text: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus."
        }
    },
    { label: "", spacing: 250 },
    {
        label: "Withering: Anemone<br>(You are here)", tall: true, spacing: 250,
        future: true,   // ← line becomes brighter AFTER this marker
        bubble: {
            image: "",
            text: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus."
        }
    },
    { label: "", spacing: 150 },
    { label: "", spacing: 150 },
];


// ── Build the timeline ────────────────────────────────────────────────────

function buildTimeline() {
    const bg = document.getElementById("timelineBackground");

    const track = document.createElement("div");
    track.id = "timelineTrack";

    // We'll build two line segments: past and future
    const linePast   = document.createElement("div");
    linePast.id      = "timelineLinePast";
    linePast.className = "timeline-line-segment";

    const lineFuture = document.createElement("div");
    lineFuture.id    = "timelineLineFuture";
    lineFuture.className = "timeline-line-segment future";

    track.appendChild(linePast);
    track.appendChild(lineFuture);

    let futureIndex   = null;
    let futureMarkerEl = null;

    timelineMarkers.forEach((marker, i) => {
        const el = document.createElement("div");
        el.className = "timeline-marker" + (marker.tall ? " tall" : "");

        if (marker.future) {
            el.classList.add("is-future-start");
            futureIndex   = i;
            futureMarkerEl = el;
        }

        // Clickable only if label + bubble defined
        if (marker.label && marker.bubble) {
            el.classList.add("clickable");
            el.setAttribute("data-index", i);
        }

        const spacing = (i < timelineMarkers.length - 1)
            ? (marker.spacing ?? 120)
            : 0;
        el.style.marginRight = spacing + "px";

        const label = marker.label ?? "";
        el.innerHTML =
            `<div class="tick"></div>` +
            (label ? `<span class="marker-label">${label}</span>` : "");

        track.appendChild(el);
    });

    bg.appendChild(track);

    // Wait for fonts + layout to fully settle before measuring.
    // rAF alone fires before custom fonts shift label widths.
    document.fonts.ready.then(() => {
        requestAnimationFrame(() => {
            positionLines(futureMarkerEl);
            centerOnMarker("is-future-start");
        });
    });
}

// ── Split the timeline line at the future marker ──────────────────────────

function positionLines(futureMarkerEl) {
    const track      = document.getElementById("timelineTrack");
    const linePast   = document.getElementById("timelineLinePast");
    const lineFuture = document.getElementById("timelineLineFuture");
    const trackW     = track.scrollWidth;

    if (!futureMarkerEl) {
        // No future marker — just one full past line
        linePast.style.left  = "0";
        linePast.style.width = trackW + "px";
        return;
    }

    // Markers have width:0, so offsetLeft is exactly the tick centre.
    const splitX = futureMarkerEl.offsetLeft;

    // Blend zone width (px each side of the split point)
    const blend = 60;

    linePast.style.left  = "0";
    linePast.style.width = (splitX + blend) + "px";

    lineFuture.style.left  = (splitX - blend) + "px";
    lineFuture.style.width = (trackW - splitX + blend) + "px";
}


// ── Centre a specific marker ──────────────────────────────────────────────

function centerOnMarker(className) {
    const bg     = document.getElementById("timelineBackground");
    const marker = bg.querySelector("." + className) || bg.querySelector(".timeline-marker");
    if (!marker) return;
    // Markers have width:0, so offsetLeft is exactly the tick centre.
    bg.scrollLeft = marker.offsetLeft - bg.clientWidth / 2;
}


// ── Bubble system ─────────────────────────────────────────────────────────

let activeBubble = null;
let activeMarker = null;

function openBubble(markerEl, markerData) {
    // Close existing bubble
    closeBubble();

    const bubble = document.createElement("div");
    bubble.className = "timeline-bubble";

    let inner = "";

    if (markerData.bubble.image) {
        inner += `<img class="bubble-image" src="${markerData.bubble.image}" alt="${markerData.label}">`;
    }

    inner += `
        <div class="bubble-title">${markerData.label}</div>
        <div class="bubble-text">${markerData.bubble.text}</div>
        <button class="bubble-close" aria-label="Close">✕</button>
        <div class="bubble-arrow"></div>
    `;

    bubble.innerHTML = inner;

    // Position: above the marker
    markerEl.style.position = "relative";
    markerEl.appendChild(bubble);

    // Close button
    bubble.querySelector(".bubble-close").addEventListener("click", (e) => {
        e.stopPropagation();
        closeBubble();
    });

    activeBubble = bubble;
    activeMarker = markerEl;

    // Animate in
    requestAnimationFrame(() => bubble.classList.add("open"));
}

function closeBubble() {
    if (!activeBubble) return;
    activeBubble.classList.remove("open");
    const b = activeBubble;
    b.addEventListener("transitionend", () => b.remove(), { once: true });
    activeBubble = null;
    activeMarker = null;
}

// Wire up clicks on the track (event delegation)
document.getElementById("timelineBackground").addEventListener("click", (e) => {
    const markerEl = e.target.closest(".timeline-marker.clickable");

    if (!markerEl) {
        closeBubble();
        return;
    }

    // Toggle: clicking the same marker closes it
    if (markerEl === activeMarker) {
        closeBubble();
        return;
    }

    const idx    = parseInt(markerEl.getAttribute("data-index"), 10);
    const data   = timelineMarkers[idx];
    openBubble(markerEl, data);
});

buildTimeline();


// ── Drag-to-scroll ────────────────────────────────────────────────────────

(function () {
    const el = document.getElementById("timelineBackground");
    let isDown = false;
    let startX, scrollLeft;
    let didDrag = false;

    el.addEventListener("mousedown", (e) => {
        isDown   = true;
        didDrag  = false;
        startX   = e.pageX - el.offsetLeft;
        scrollLeft = el.scrollLeft;
    });

    el.addEventListener("mouseleave", () => { isDown = false; });
    el.addEventListener("mouseup",    () => { isDown = false; });

    el.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        didDrag = true;
        const x    = e.pageX - el.offsetLeft;
        const walk = (x - startX) * 1.2;
        el.scrollLeft = scrollLeft - walk;
    });

    // Prevent click from firing after a drag
    el.addEventListener("click", (e) => {
        if (didDrag) { e.stopPropagation(); didDrag = false; }
    }, true);

    // Touch
    let touchStartX, touchScrollLeft;

    el.addEventListener("touchstart", (e) => {
        touchStartX     = e.touches[0].pageX;
        touchScrollLeft = el.scrollLeft;
    }, { passive: true });

    el.addEventListener("touchmove", (e) => {
        const x    = e.touches[0].pageX;
        const walk = touchStartX - x;
        el.scrollLeft = touchScrollLeft + walk;
    }, { passive: true });
})();