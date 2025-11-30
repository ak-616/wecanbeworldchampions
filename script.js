// CONSTANTS – you can adjust if needed
const GAP_TO_MAX = 12;   // Lando is +12 vs Max
const GAP_TO_OSCAR = 16; // Lando is +16 vs Oscar

// F1 race points (no sprint, no fastest lap)
// 11 = "No points / DNF"
const racePoints = {
    1: 25,
    2: 18,
    3: 15,
    4: 12,
    5: 10,
    6: 8,
    7: 6,
    8: 4,
    9: 2,
    10: 1,
    11: 0
};

// Create list of positions P1–P10 + "No points"
const positionsData = [
    { value: 1, label: "P1" },
    { value: 2, label: "P2" },
    { value: 3, label: "P3" },
    { value: 4, label: "P4" },
    { value: 5, label: "P5" },
    { value: 6, label: "P6" },
    { value: 7, label: "P7" },
    { value: 8, label: "P8" },
    { value: 9, label: "P9" },
    { value: 10, label: "P10" },
    { value: 11, label: "No points / DNF" }
];

const maxContainer = document.getElementById("max-positions");
const oscarContainer = document.getElementById("oscar-positions");
const calcButton = document.getElementById("calculate-btn");
const resultBox = document.getElementById("result");

function buildPositionOptions(container, namePrefix) {
    positionsData.forEach(pos => {
        const id = `${namePrefix}-${pos.value}`;

        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = namePrefix; // ensures only 1 selected per driver
        radio.value = String(pos.value);
        radio.id = id;

        const label = document.createElement("label");
        label.className = "pos-box";
        label.setAttribute("for", id);

        const inner = document.createElement("div");
        inner.className = "pos-label-text";

        const badge = document.createElement("span");
        badge.className = "pos-badge";
        badge.textContent = pos.label;

        const pointsText = document.createElement("span");
        pointsText.textContent =
            pos.value === 11
                ? "(0 pts)"
                : `(${racePoints[pos.value]} pts)`;

        inner.appendChild(badge);
        inner.appendChild(pointsText);
        label.appendChild(inner);

        container.appendChild(radio);
        container.appendChild(label);
    });
}

// Build the 2 columns
buildPositionOptions(maxContainer, "maxPos");
buildPositionOptions(oscarContainer, "oscarPos");

// Helper: get currently selected values
function getSelectedValue(groupName) {
    const checked = document.querySelector(`input[name="${groupName}"]:checked`);
    return checked ? Number(checked.value) : null;
}

// Disable same position on the other side
function updateDisabledStates() {
    const maxSelected = getSelectedValue("maxPos");
    const oscarSelected = getSelectedValue("oscarPos");

    const maxRadios = document.querySelectorAll('input[name="maxPos"]');
    const oscarRadios = document.querySelectorAll('input[name="oscarPos"]');

    maxRadios.forEach(r => {
        if (oscarSelected !== null && Number(r.value) === oscarSelected) {
            r.disabled = true;
            // If this one is checked and must be disabled, uncheck it
            if (r.checked) r.checked = false;
        } else {
            r.disabled = false;
        }
    });

    oscarRadios.forEach(r => {
        if (maxSelected !== null && Number(r.value) === maxSelected) {
            r.disabled = true;
            if (r.checked) r.checked = false;
        } else {
            r.disabled = false;
        }
    });
}

// Add change listeners for both groups
document.addEventListener("change", event => {
    if (event.target.name === "maxPos" || event.target.name === "oscarPos") {
        updateDisabledStates();
    }
});

// Calculate Lando's minimum required position
function calculateLandoMinimum() {
    const maxPos = getSelectedValue("maxPos");
    const oscarPos = getSelectedValue("oscarPos");

    if (maxPos === null || oscarPos === null) {
        resultBox.textContent = "Please select a position for both Max and Oscar.";
        return;
    }

    // We work with relative points:
    // Lando: 0
    // Max: -GAP_TO_MAX
    // Oscar: -GAP_TO_OSCAR
    const maxFinalBase = -GAP_TO_MAX + racePoints[maxPos];
    const oscarFinalBase = -GAP_TO_OSCAR + racePoints[oscarPos];

    let minLandoPos = null;

    // Find the lowest position (largest number) that still gives him the title.
    // IMPORTANT: We use strict ">" instead of ">=" to avoid tie-break complications.
    for (let pos = 11; pos >= 1; pos--) {
        const landoFinal = racePoints[pos];
        const beatsMax = landoFinal > maxFinalBase;
        const beatsOscar = landoFinal > oscarFinalBase;

        if (beatsMax && beatsOscar) {
            minLandoPos = pos;
            break;
        }
    }

    const posLabel = (pos) => {
        if (pos === 11) return "No points / DNF";
        return `P${pos}`;
    };

    const maxLabel = posLabel(maxPos);
    const oscarLabel = posLabel(oscarPos);

    let text = `Max: ${maxLabel}\nOscar: ${oscarLabel}\n\n`;

    if (minLandoPos === null) {
        text += "Even with a P1, Lando cannot guarantee the title with these results.";
    } else {
        text += `Lando needs at least: `;
        text += `\n• `;
        text += `\u00AB<span class="result-highlight">${posLabel(minLandoPos)}</span>\u00BB or better.`;
    }

    // Because of the <span> we must use innerHTML, not textContent
    resultBox.innerHTML = text;
}

calcButton.addEventListener("click", calculateLandoMinimum);
