const result = document.getElementById('result');
const note = document.getElementById('note');
const questions = document.querySelectorAll('.question');
const Actions = document.getElementsByClassName('Action');
let resultText = "";
let resultColor = "";
let noteText = "";

function Onset(onset) {
    const now = new Date();
    const onsetDate = new Date(onset);
    const diffMs = now - onsetDate;
    return Math.round(diffMs / (10 * 60 * 60)) / 100; // Convert milliseconds to hours
}

function updateNote() {
    // Reset results
    resultText = "";
    resultColor = "";
    noteText = "";
    geenColor = '#66DE93';
    redColor = '#FF616D';
    const answers = {};

    // collect answers
    questions.forEach(q => {
        const name = q.dataset.id;
        const selected = document.querySelector(`input[name="${name}"]:checked`);
        if (selected) {
            answers[name] = selected.value;
        }
    });

    // check if any contraindication is present
    for (answer in answers) {
        if (answers[answer] === "false") {
            resultColor = redColor;
            resultText = "STOP (PATIENT IS NOT ELIGIBLE FOR rTPA)";
            displayresult();
            return
        }
    }

    // Begin Eligibility Checks
    if (answers.q1 !== "true" || answers.q2 !== "true" || answers.q3 !== "true") {
        resultColor = geenColor;
        resultText = "BEGIN WITH BASIC ELIGIBILITY";
        displayresult();
        return;
    }
    // calculate onset time warnings and other notes
    if (Onset(document.getElementById('LKW').value) > 4.5) {
        noteText = `<li>Are you sure about the onset time? It has been more than 4.5 hours since the time you entered</li>`;
    }
    if (document.getElementById('NIHSS').value && document.getElementById('NIHSS').value < 5) {
        noteText += `<li>NIHSS is Low, make sure the symptoms are disabling before proceeding</li>`;
    }
    if ((document.getElementById('SysBP').value && document.getElementById('SysBP').value > 185) ||
        (document.getElementById('DiaBP').value && document.getElementById('DiaBP').value > 110)) {
        noteText += `<li>This Bl. Pr. needs to be lowered</li>`;
    }
    if (document.getElementById('RBS').value && document.getElementById('RBS').value < 60) {
        noteText += `<li>RBS is too low, correct and asses again</li>`;
    }

    // check for NIHSS and Actions
    if (!document.getElementById('NIHSS').value) {
        resultColor = geenColor;
        resultText = "ASSESS NIHSS SCORE";
        displayresult();
        return;
    }
    if (!Actions[0].checked || !Actions[1].checked || !Actions[2].checked) {
        resultColor = geenColor;
        resultText = `DRAW BLOOD FOR LABS, SEND PATIENT FOR CT SCAN`;
        displayresult();
        return;
    }

    // Check for CT Scan imaging
    if (answers.q13 !== "true" || answers.q14 !== "true") {
        resultColor = geenColor;
        resultText = `ASSESS CT SCAN`;
        displayresult();
        return;
    }

    // Check for Vitals Corrections
    if (answers.q15 === "low") {
        document.getElementById('RBSCorrect').style.display = "block";
        noteText = noteText.replace(`<li>RBS is too low, correct and asses again</li>`, '');
    } else {
        document.getElementById('RBSCorrect').style.display = "none";
        document.querySelectorAll('input[name="q155"]').forEach(input => {
            input.checked = false;
        });
        answers.q155 = undefined;
    }
    if (answers.q16 === "hi") {
        document.getElementById('BPCorrect').style.display = "block";
        noteText = noteText.replace(`<li>This Bl. Pr. needs to be lowered</li>`, '');
    }else {
        document.getElementById('BPCorrect').style.display = "none";
        document.querySelectorAll('input[name="q165"]').forEach(input => {
            input.checked = false;
        });
        answers.q165 = undefined;
    }
    if (answers.q155 === "not") {
        resultColor = redColor;
        resultText = "STOP (NO rTPA. TREAT AS STROKE MIMIC)";
        noteText = "";
        displayresult();
        return
    }
    if (answers.q165 === "not") {
        resultColor = redColor;
        resultText = "STOP (NO rTPA UNTIL BP IS CONTROLLED)";
        noteText = "";
        displayresult();
        return
    }
    if ((answers.q15 !== "hi" && answers.q155 !== "yes") || (answers.q16 !== "low" && answers.q165 !== "yes")) {
        resultColor = geenColor;
        resultText = `ASSESS VITALS AND BEDSIDE CORRECTIONS`;
        displayresult();
        return;
    }

    // Check for Absolute Contraindications
    if (answers.q17 !== "true" || answers.q18 !== "true" || answers.q19 !== "true" ||
        answers.q20 !== "true" || answers.q21 !== "true" || answers.q22 !== "true" ||
        answers.q23 !== "true" || answers.q24 !== "true" || answers.q25 !== "true" ||
        answers.q26 !== "true" || answers.q27 !== "true" || answers.q28 !== "true") 
    {
        resultColor = geenColor;
        resultText = `ASSESS FOR CONTRAINDICATIONS`;
        displayresult();
        return;
    }

    // Check for Relative Contraindications
    let RC = false;
    document.querySelectorAll('input[name="RC"]').forEach(input => {
        if (input.checked) {
            RC = true;
        }
    });
    if (RC) {
        noteText += `<li style="color: Crimson">Relative Cntraindications present. Obtain consultant opinion</li>`;
    }

    // Check for Bleeding Risks
    if (answers.qB === "yes") {
        document.getElementById('Bleeding').style.display = "block";
    } else {
        document.getElementById('Bleeding').style.display = "none";
        document.querySelectorAll('input[name="q29"], input[name="q30"], input[name="q31"], input[name="q32"]').forEach(input => {
            input.checked = false;
        });
        answers.q29 = undefined; 
        answers.q30 = undefined;
        answers.q31 = undefined;
        answers.q32 = undefined;
    }
    if (answers.q29 === "not" || answers.q30 === "not" || answers.q31 === "not" || answers.q32 === "not") {
        resultColor = redColor;
        resultText = "STOP (NO rTPA. HIGH BLEEDING RISK)";
        noteText = "";
        displayresult();
        return
    }
    if (answers.qB !== "not" && (answers.q29 !== "yes" || answers.q30 !== "yes" || answers.q31 !== "yes" || answers.q32 !== "yes")) {
        resultColor = geenColor;
        resultText = "ASSESS FOR BLEEDING RISKS";
        displayresult();
        return
    }

    // Final GO checks
    let GO = true;
    document.querySelectorAll('input[name="Go"]').forEach(input => {
        if (!input.checked) {
            GO = false;
        }
    });
    if (!GO) {
        resultColor = geenColor;
        resultText = 'REVISE ALL THE FINAL "GO" CHECKS';
        displayresult();
        return
    }

    if (!answers.qF) {
        resultColor = geenColor;
        resultText = "CHOOSE THE THROMBOLYTIC AGENT";
        displayresult();
        return
    }
    
    // Calculate Dose
    let weight = document.getElementById('Weight').value;
    weight = (weight > 100) ? 100 : weight;
    if (answers.qF === "rTPA") {
        resultText = "Total Dose: 0.9 mg/kg (Max 90 mg)<br>";
        let dose = (0.9 * weight).toFixed(1);
        let bolus = (0.1 * dose).toFixed(1);
        let infusion = (0.9 * dose).toFixed(1);
        resultText += `Calculated Dose: ${dose} mg<br>`;
        resultText += `Bolus: ${bolus} mg IV over 2 minute<br>`;
        resultText += `Infusion: ${infusion} mg IV over 1 hour`;
    }else if (answers.qF === "TNK") {
        resultText = "Total Dose: 0.25 mg/kg (Max 25 mg)<br>";
        let dose = (0.25 * weight).toFixed(1);
        resultText += `Calculated Dose: ${dose} mg IV bolus over 5 - 10 seconds`;
    }

    noteText = "";
    resultColor = geenColor;
    displayresult();
}

function displayresult() {
    if (resultText.length > 0) {
        result.style.display = 'block';
        result.style.backgroundColor = resultColor;
        result.innerHTML = resultText;
    } else {
        result.style.display = 'none';
    }
    if (noteText.length > 0) {
        note.style.display = 'block';
        note.innerHTML = noteText;
    } else {
        note.style.display = 'none';
    }
}

document.querySelectorAll('input[type="radio"]').forEach(input => {
    input.addEventListener('change', updateNote);
});
document.querySelectorAll('input[type="checkbox"]').forEach(input => {
    input.addEventListener('change', updateNote);
});