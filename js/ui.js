const hourWheel = document.getElementById("hourWheel");
const minuteWheel = document.getElementById("minuteWheel");

const itemHeight = window.innerHeight * 0.1;

// How many ghost items to add before/after
const paddingItems = 1; // one blank above/below for center

function createWheel(wheel, start, end) {
    // top padding
    for (let i = 0; i < paddingItems; i++) {
        const div = document.createElement("div");
        div.textContent = "";
        wheel.appendChild(div);
    }

    // real numbers
    for (let i = start; i <= end; i++) {
        const div = document.createElement("div");
        div.textContent = String(i).padStart(2, "0");
        wheel.appendChild(div);
    }

    // bottom padding
    for (let i = 0; i < paddingItems; i++) {
        const div = document.createElement("div");
        div.textContent = "";
        wheel.appendChild(div);
    }
}

// populate hours and minutes
createWheel(hourWheel, 0, 23);
createWheel(minuteWheel, 0, 60);

// initial center
hourWheel.scrollTop = itemHeight * paddingItems;
minuteWheel.scrollTop = itemHeight * paddingItems;


// Snap-to-center after scroll
function enableSnap(wheel) {
    let isScrolling;
    wheel.addEventListener('scroll', () => {
        window.clearTimeout(isScrolling);
        isScrolling = setTimeout(() => {
            const index = Math.round(wheel.scrollTop / itemHeight);
            wheel.scrollTo({ top: index * itemHeight, behavior: 'smooth' });
        }, 100);
    });
}

enableSnap(hourWheel);
enableSnap(minuteWheel);

// Get selected number
function getSelectedValue(wheel) {
    const index = Math.round(wheel.scrollTop / itemHeight) + paddingItems;
    return wheel.children[index].textContent;
};

export function setTime() {
    let hours = getSelectedValue(hourWheel);
    let minutes = getSelectedValue(minuteWheel);

    return [hours, minutes];
}

export function goToStep(currentId, nextId) {
const current = document.getElementById(currentId);
const next = document.getElementById(nextId);

    if (current) {
        current.classList.remove("step-active");
        current.classList.add("step");
    };

    if (next) {
        next.classList.remove("step");
        next.classList.add("step-active");
    };
}