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

window.addEventListener('load', () => {
    showSection();
    checkCookieConsent();
    loadSteps();
    loadCalories();
});

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
}

function trackSteps() {
    const stepsInput = document.getElementById("steps");
    const steps = parseInt(stepsInput.value);
    const stepsList = document.getElementById("stepsList");

    if (!steps) {
        alert("Vänligen ange antalet steg.");
        return;
    }

    // Save steps to cookies
    let stepsData = getCookie("stepsData") ? JSON.parse(getCookie("stepsData")) : [];
    stepsData.push({ date: new Date().toLocaleDateString(), steps });
    setCookie("stepsData", JSON.stringify(stepsData), 30); // Save for 30 days

    // Clear input
    stepsInput.value = "";

    // Update the displayed list
    displaySteps(stepsData);
}

function trackCalories() {
    const caloriesInput = document.getElementById("calories");
    const calories = parseInt(caloriesInput.value);
    const caloriesList = document.getElementById("caloriesList");

    if (!calories) {
        alert("Vänligen ange kalorier.");
        return;
    }

    // Save calories to cookies
    let caloriesData = getCookie("caloriesData") ? JSON.parse(getCookie("caloriesData")) : [];
    caloriesData.push({ date: new Date().toLocaleDateString(), calories });
    setCookie("caloriesData", JSON.stringify(caloriesData), 30); // Save for 30 days

    // Clear input
    caloriesInput.value = "";

    // Update the displayed list
    displayCalories(caloriesData);
}

function displaySteps(stepsData) {
    const stepsList = document.getElementById("stepsList");
    stepsList.innerHTML = ""; // Clear existing list

    stepsData.forEach(entry => {
        const feedback = entry.steps < 10000 ? "Försök att öka din dagliga aktivitet." : "Bra jobbat, du har nått ditt steg-mål för dagen!";
        stepsList.innerHTML += `<p>${entry.date}: ${entry.steps} steg. ${feedback}</p>`;
    });
}

function displayCalories(caloriesData) {
    const caloriesList = document.getElementById("caloriesList");
    caloriesList.innerHTML = ""; // Clear existing list

    caloriesData.forEach(entry => {
        caloriesList.innerHTML += `<p>${entry.date}: ${entry.calories} kalorier.</p>`;
    });
}

function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function getCookie(name) {
    return document.cookie.split('; ').reduce((prev, current) => {
        const [key, value] = current.split('=');
        return key === name ? decodeURIComponent(value) : prev;
    }, '');
}

function checkCookieConsent() {
    const cookiePopup = document.getElementById("cookiePopup");
    if (!getCookie("cookiesAccepted")) {
        cookiePopup.classList.remove("hidden");
    }
}

function acceptCookies() {
    setCookie("cookiesAccepted", "true", 30);
    document.getElementById("cookiePopup").classList.add("hidden");
}

function toggleCredits() {
    const creditsPopup = document.getElementById("creditsPopup");
    creditsPopup.classList.toggle("hidden");
}
// Toggle the side menu
function toggleMenu() {
    var sideMenu = document.getElementById('side-menu');
    sideMenu.classList.toggle('open');
}

