// Build groups once
const groups = [...new Set(
    Array.from(document.querySelectorAll('input[type="radio"]')).map(r => r.name)
)];

// function to collect answers from each selected radio button
function collectAnswers() {
    const answers = {};
    groups.forEach(name => {
        const selected = document.querySelector(`input[name="${name}"]:checked`);
        answers[name] = selected ? selected.value : null;
    });
    return answers;
}

//function to check if all questions are answered
function allAnswered(answers) {
    if (answers.verbal && answers.comprehension && answers.repetition) {
        return true;
    }else{
        return false;
    }
}

//function to assess the answers and return a result based on the criteria
function assess(answers) {
    // when the pt is not fluent
    if (answers.verbal === 'false' && answers.comprehension === 'false' && answers.repetition === 'false') {
        return '<b>GLOBAL APHASIA</b><br>with the lesion likely involves Frontal, Temporal, and Parietal operculum';
    } else if (answers.verbal === 'false' && answers.comprehension === 'false' && answers.repetition === 'true') {
        return '<b>MIXED TRANSCORTICAL APHASIA</b><br>The lesion mostly involves Frontal and Parietal Convexity';
    }else if (answers.verbal === 'false' && answers.comprehension === 'true' && answers.repetition === 'false') {
        return '<b>BROCA\'S APHASIA</b><br>The lesion mostly involves Frontal Operculum';
    }else if (answers.verbal === 'false' && answers.comprehension === 'true' && answers.repetition === 'true') {
        return '<b>TRANSCORTICAL MOTOR APHASIA</b><br>The lesion mostly involves Frontal Convexity';
    }
    // when the pt is fluent
    else if (answers.verbal === 'true' && answers.comprehension === 'false' && answers.repetition === 'false') {
        return '<b>WERNICKE\'S APHASIA</b><br>The lesion mostly involves Posterior part of Superior Temporal Gyrus';
    }else if (answers.verbal === 'true' && answers.comprehension === 'false' && answers.repetition === 'true') {
        return '<b>TRANSCORTICAL SENSORY APHASIA</b><br>The lesion mostly involves Temporoparietal Convexity';
    }else if (answers.verbal === 'true' && answers.comprehension === 'true' && answers.repetition === 'false') {
        return '<b>CONDUCTION APHASIA</b><br>The lesion mostly involves Arcuate Fasciculus';
    }else if (answers.verbal === 'true' && answers.comprehension === 'true' && answers.repetition === 'true') {
        /* when the pt is fluent and has no impairment in comprehension and repetition, 
           we can assess for naming, reading, and writing */
        if ((!answers.naming && !answers.reading && !answers.writing) || (answers.naming === 'false')) {
            return '<b>ANOMIC APHASIA</b><br>The lesion mostly involves Angular and Supramarginal Gyri';
        }else if (answers.writing === 'false' && answers.reading === 'false') {
            return '<b>MIXED AGRAPHIA & ALEXIA</b><br>The lesion mostly involves Angular and Supramarginal Gyri';
        }else if (answers.writing === 'false' /*&& (answers.reading === 'true' || answers.reading === null)*/){
            return '<b>AGRAPHIA</b><br>The lesion mostly involves Exner\'s Area';
        } else if (answers.reading === 'false' /*&& (answers.writing === 'true' || answers.writing === null)*/) {
            return '<b>ALEXIA</b><br>The lesion mostly involves Visual Association area';
        } else {
            return 'It seems your patient does not have language impairment.<br> consider other causes of Cognitive impairment.';
        }
    }
}

// Real-time update
document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
        const answers = collectAnswers();
        let result = '';
        let resultsDiv = document.getElementById('result');
        if (!allAnswered(answers)) {
            resultsDiv.style.display = 'none';
            return;
        }
        result = assess(answers);
        resultsDiv.style.display = 'block';
        resultsDiv.innerHTML = result;
    });
});

// Reset button functionality
function startOver() {
    document.querySelectorAll('input[type="radio"]').forEach(radio => radio.checked = false);
    document.getElementById('result').style.display = 'none';
}