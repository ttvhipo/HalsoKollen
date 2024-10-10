function showSection() {
    const hash = window.location.hash;
    const sections = document.querySelectorAll('.tool-section');
    sections.forEach(section => {
        section.style.display = 'none';
        section.style.opacity = 0;
    });
    if (hash) {
        const currentSection = document.querySelector(hash);
        currentSection.style.display = 'block';
        setTimeout(() => currentSection.style.opacity = 1, 100); // Delay for fade-in
    }
}

window.addEventListener('load', showSection);
window.addEventListener('hashchange', showSection);

function calculateBMI() {
    const height = document.getElementById("height").value / 100;
    const weight = document.getElementById("weight").value;
    const bmi = (weight / (height * height)).toFixed(2);
    const bmiResult = document.getElementById("bmiResult");

    let message;
    if (bmi < 18.5) {
        message = `Ditt BMI är ${bmi}. Du är underviktig.`;
        bmiResult.className = "alert";
    } else if (bmi >= 18.5 && bmi < 24.9) {
        message = `Ditt BMI är ${bmi}. Du har normalvikt.`;
        bmiResult.className = "normal";
    } else {
        message = `Ditt BMI är ${bmi}. Du är överviktig.`;
        bmiResult.className = "alert";
    }

    bmiResult.innerHTML = message;
    localStorage.setItem('bmi', bmi);
}

function trackSteps() {
    const steps = document.getElementById("steps").value;
    const stepsResult = document.getElementById("stepsResult");

    let message = steps < 10000 
        ? "Försök att öka din dagliga aktivitet."
        : "Bra jobbat, du har nått ditt steg-mål för dagen!";
    stepsResult.innerHTML = message;
    localStorage.setItem('steps', steps);
}

function trackCalories() {
    const calories = document.getElementById("calories").value;
    document.getElementById("caloriesResult").innerHTML = `Du har ätit ${calories} kalorier idag.`;
    localStorage.setItem('calories', calories);
}
