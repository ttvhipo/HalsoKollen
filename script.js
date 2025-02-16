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

const QWEN_API_KEY = "sk-b64c72e192e54d51a39ecfd63e329bed";
const QWEN_API_URL = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions";

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
    halsCoachChatDiv.scrollTop = halsCoachChatDiv.scrollHeight;
}

// Hide loading spinner
function hideLoadingSpinner() {
    const loadingMessage = halsCoachChatDiv.querySelector(".loading-message");
    if (loadingMessage) {
        loadingMessage.remove();
    }
}

// Function to simulate typing effect
async function typeMessage(message, element) {
    const words = message.split(' ');
    let currentText = '';
    
    for (let word of words) {
        currentText += word + ' ';
        element.textContent = currentText;
        element.scrollIntoView({ behavior: 'smooth' });
        await new Promise(resolve => setTimeout(resolve, 200)); // 0.2 second delay between words
    }
}

// Display chat history with typing effect for new messages
async function displayHalsoCoachChat(newMessage = false) {
    // Display all previous messages instantly
    const chatHTML = halsCoachChatHistory.slice(0, -1).map(msg => `
        <div class="mb-4">
            <div class="${msg.role === "user" ? "text-right" : "text-left"}">
                <span class="${msg.role === "user" ? "message-user" : "message-ai"}">
                    ${msg.content}
                </span>
            </div>
        </div>
    `).join("");

    halsCoachChatDiv.innerHTML = chatHTML;

    // If there's a new message, add it with typing effect
    if (newMessage && halsCoachChatHistory.length > 0) {
        const lastMessage = halsCoachChatHistory[halsCoachChatHistory.length - 1];
        const messageDiv = document.createElement('div');
        messageDiv.className = 'mb-4';
        
        const alignDiv = document.createElement('div');
        alignDiv.className = lastMessage.role === "user" ? "text-right" : "text-left";
        
        const messageSpan = document.createElement('span');
        messageSpan.className = lastMessage.role === "user" ? "message-user" : "message-ai";
        
        alignDiv.appendChild(messageSpan);
        messageDiv.appendChild(alignDiv);
        halsCoachChatDiv.appendChild(messageDiv);

        if (lastMessage.role === "assistant") {
            await typeMessage(lastMessage.content, messageSpan);
        } else {
            messageSpan.textContent = lastMessage.content;
        }
    }

    halsCoachChatDiv.scrollTop = halsCoachChatDiv.scrollHeight;
}

// Send message to Qwen API
async function sendHalsoCoachMessage(message) {
    if (message.trim() === '') return;
    
    showLoadingSpinner();

    // Add user message to chat
    halsCoachChatHistory.push({ role: "user", content: message });
    await displayHalsoCoachChat(true);

    try {
        const response = await fetch(QWEN_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${QWEN_API_KEY}`
            },
            body: JSON.stringify({
                model: "qwen-turbo",
                messages: [
                    {
                        role: "system",
                        content: "Du är en hjälpsam hälsocoach. Ditt namn är Hälso Coach. Ge hälsorelaterade råd och vägledning på svenska. Du beffiner dig på hemsidan Hälsokollen.xyz. Hemsidan är gjord av Shant Ramzi. Hemsidan är en projekt för skolan. I hemsidan finns BMI kalkylator, Stegräknare och Kaloriräknare. Det finns också en informertial om hemsidan."
                    },
                    { role: "user", content: message }
                ]
            })
        });

        const data = await response.json();
        
        hideLoadingSpinner();

        if (data.choices && data.choices[0].message) {
            const aiResponse = data.choices[0].message.content;
            halsCoachChatHistory.push({ role: "assistant", content: aiResponse });
            localStorage.setItem("halsCoachChatHistory", JSON.stringify(halsCoachChatHistory));
            await displayHalsoCoachChat(true);
        } else {
            throw new Error('Invalid API response');
        }

    } catch (error) {
        console.error("Error:", error);
        hideLoadingSpinner();
        halsCoachChatHistory.push({ 
            role: "assistant", 
            content: "Ett fel uppstod vid behandling av din förfrågan." 
        });
        await displayHalsoCoachChat(true);
    }
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

// Add event listener
halsCoachInputField.addEventListener("keypress", handleHalsoCoachKeyPress);
