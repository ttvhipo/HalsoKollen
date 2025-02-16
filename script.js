// Existing JavaScript Code
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
        setTimeout(() => currentSection.style.opacity = 1, 100);
    }
}

window.addEventListener('load', () => {
    showSection();
    checkCookieConsent();
    loadSteps();
    loadCalories();
    displayHalsoCoachChat();
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

    let stepsData = getCookie("stepsData") ? JSON.parse(getCookie("stepsData")) : [];
    stepsData.push({ date: new Date().toLocaleDateString(), steps });
    setCookie("stepsData", JSON.stringify(stepsData), 30);

    stepsInput.value = "";
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

    let caloriesData = getCookie("caloriesData") ? JSON.parse(getCookie("caloriesData")) : [];
    caloriesData.push({ date: new Date().toLocaleDateString(), calories });
    setCookie("caloriesData", JSON.stringify(caloriesData), 30);

    caloriesInput.value = "";
    displayCalories(caloriesData);
}

function displaySteps(stepsData) {
    const stepsList = document.getElementById("stepsList");
    stepsList.innerHTML = "";

    stepsData.forEach(entry => {
        const feedback = entry.steps < 10000 ? "Försök att öka din dagliga aktivitet." : "Bra jobbat, du har nått ditt steg-mål för dagen!";
        stepsList.innerHTML += `<p>${entry.date}: ${entry.steps} steg. ${feedback}</p>`;
    });
}

function displayCalories(caloriesData) {
    const caloriesList = document.getElementById("caloriesList");
    caloriesList.innerHTML = "";

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

// Hälso Coach Chat Script
const HALS_COACH_API_KEY = "sk-b64c72e192e54d51a39ecfd63e329bed"; // Your DeepSeek API key
const HALS_COACH_API_URL = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions"; // API endpoint

const halsCoachChatDiv = document.getElementById("halsocoach-chat");
const halsCoachInputField = document.getElementById("halsocoach-input");

let halsCoachChatHistory = JSON.parse(localStorage.getItem("halsCoachChatHistory")) || [];

// Show loading spinner
function showLoadingSpinner() {
    const loadingMessage = document.createElement("div");
    loadingMessage.classList.add("loading-message");
    loadingMessage.innerHTML = `
        <div class="loading-spinner"></div>
    `;
    halsCoachChatDiv.appendChild(loadingMessage);
    halsCoachChatDiv.scrollTop = halsCoachChatDiv.scrollHeight; // Auto-scroll
}

// Hide loading spinner
function hideLoadingSpinner() {
    const loadingMessage = halsCoachChatDiv.querySelector(".loading-message");
    if (loadingMessage) {
        loadingMessage.remove();
    }
}

// Format AI response
function formatHalsoCoachResponse(response) {
    response = response.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
        return `
            <div class="code-block">
                <pre><code class="language-${language || 'plaintext'}">${code.trim()}</code></pre>
            </div>
        `;
    });

    response = response.replace(/### (.*)/g, "<h3>$1</h3>");
    response = response.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    response = response.replace(/^- (.*)/gm, "<li>$1</li>");
    response = response.replace(/(<li>.*<\/li>)/g, "<ul>$1</ul>");
    response = response.replace(/\n/g, "<br>");

    return response;
}

// Display chat history
function displayHalsoCoachChat() {
    halsCoachChatDiv.innerHTML = halsCoachChatHistory
        .map(msg => `
            <div class="mb-4">
                <div class="${msg.role === "user" ? "text-right" : "text-left"}">
                    <span class="${msg.role === "user" ? "message-user" : "message-ai"}">
                        <strong>${msg.role === "user" ? "You" : "Hälso Coach"}:</strong> ${msg.role === "user" ? msg.content : formatHalsoCoachResponse(msg.content)}
                    </span>
                </div>
            </div>
        `)
        .join("");

    halsCoachChatDiv.scrollTop = halsCoachChatDiv.scrollHeight;
}

// Send message to DeepSeek API
async function sendHalsoCoachMessage(message) {
    showLoadingSpinner(); // Show loading spinner

    halsCoachChatHistory.push({ role: "user", content: message });
    displayHalsoCoachChat();

    const response = await fetch(HALS_COACH_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${HALS_COACH_API_KEY}`
        },
        body: JSON.stringify({
            model: "qwen-turbo",
            messages: [
                { role: "system", content: "Du är en hjälpsam hälsocoach. Ditt namn är Hälso Coach. Ge hälsorelaterade råd och vägledning på svenska. Du beffiner dig på hemsidan Hälsokollen.xyz. Hemsidan är gjord av Shant Ramzi. Hemsidan är en projekt för skolan. I hemsidan finns BMI kalkylator, Stegräknare och Kaloriräknare. Det finns också en informertial om hemsidan." },
                ...halsCoachChatHistory,
            ],
            stream: false
        })
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    halsCoachChatHistory.push({ role: "assistant", content: aiResponse });
    localStorage.setItem("halsCoachChatHistory", JSON.stringify(halsCoachChatHistory));

    displayHalsoCoachChat();
    hideLoadingSpinner(); // Hide loading spinner
}

// Handle Enter key press
function handleHalsoCoachKeyPress(event) {
    if (event.key === "Enter") {
        const message = halsCoachInputField.value.trim();
        if (message) {
            sendHalsoCoachMessage(message);
            halsCoachInputField.value = "";
        }
    }
}
