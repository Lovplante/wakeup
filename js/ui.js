const hourWheel = document.getElementById("hourWheel");
const minuteWheel = document.getElementById("minuteWheel");

// How many ghost items to add before/after
const paddingItems = 1; // one blank above/below for center

function createWheel(wheel, start, end) {
    wheel.innerHTML = "";
    // top padding
    for (let i = 0; i < paddingItems; i++) {
        wheel.appendChild(document.createElement("div"));
    }

    // vlalues
    for (let i = start; i <= end; i++) {
        const div = document.createElement("div");
        div.textContent = String(i).padStart(2, "0");
        wheel.appendChild(div);
    }

    // bottom padding
    for (let i = 0; i < paddingItems; i++) {
        wheel.appendChild(document.createElement("div"));
    }
}

// populate hours and minutes
createWheel(hourWheel, 0, 23);
createWheel(minuteWheel, 0, 59);

// Item height errechnen
function getItemHeight(wheel) {
    const item = wheel.querySelector("div");
    return item.getBoundingClientRect().height;
}

const hourItemHeight = getItemHeight(hourWheel);
const minuteItemHeight = getItemHeight(minuteWheel);

// initial position
hourWheel.scrollTop = paddingItems * hourItemHeight;
minuteWheel.scrollTop = paddingItems * minuteItemHeight;


// Snap-Logik
function enableSnap(wheel, itemHeight) {
    let timeout;

    wheel.addEventListener('scroll', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            const index = Math.round(wheel.scrollTop / itemHeight);
            wheel.scrollTo({ top: index * itemHeight, behavior: 'smooth' });
        }, 80);
    });
}

enableSnap(hourWheel, hourItemHeight);
enableSnap(minuteWheel, minuteItemHeight);

// Get selected number
function getSelectedValue(wheel, itemHeight) {
    const index = Math.round(wheel.scrollTop / itemHeight);
    const el = wheel.children[index + paddingItems];
    return el ? el.textContent : null;
}

export function setTime() {
    let hours = getSelectedValue(hourWheel, hourItemHeight);
    let minutes = getSelectedValue(minuteWheel, minuteItemHeight);

    return [hours, minutes];
}


// step navigation

export function goToStep(currentId, nextId) {
const current = document.getElementById(currentId);
const next = document.getElementById(nextId);

    if (current) {
        current.classList.remove("step-active");
    };

    if (next) {
        next.classList.add("step-active");
    };
}


// function enableWheelDamping(wheel, factor = 0.25) {
//     wheel.addEventListener("wheel", (e) => {
//         // Only affect real mouse wheels
//         if (e.deltaMode === WheelEvent.DOM_DELTA_LINE) {
//             e.preventDefault();
//             wheel.scrollTop += e.deltaY * factor;
//         }
//     }, { passive: false });
// }

// enableWheelDamping(hourWheel);
// enableWheelDamping(minuteWheel);
