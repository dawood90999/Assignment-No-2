let ForecastData; // To hold the forecast data
let currentCity='Islamabad'; // To hold the current city name
const GeminiApi = 'AIzaSyDY9U0RmuLqudas1_efkVyXf3Ix-DWZK8A'; 
const ModelName = 'gemini-1.5-flash-latest';
let originalForecastData; 
// Pagination variables
const rowsPerPage = 10;
let currentPage = 1;
let isCelsius = true; // Keep track of the current unit (Celsius/Fahrenheit)
let chatbotinput=document.querySelector('#chatbotInput');
let  chatbotResponse=document.getElementById('chatbotResponse');
let chatbotinputMob=document.querySelector('#chatbotInputMobile');
let  chatbotResponseMob=document.getElementById('chatbotResponseMobile');

const searchInput = document.querySelector('input[type="text"]');

function showLoading()
{
    document.getElementById('loading-spinner').style.display = 'block';
    document.getElementById('mainTable').style.display = 'none';
}
function hideLoading()
{
    document.getElementById('loading-spinner').style.display = 'none';
    document.getElementById('mainTable').style.display = 'block';
}
async function FetchGeminiResponse(chatinput) {


    const requestBody = {
        contents: [
            {
                parts: [
                    {
                        text: chatinput
                    }
                ]
            }
        ]
    };

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${ModelName}:generateContent?key=${GeminiApi}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to fetch response');
        }

        const data = await response.json();
        if (data.candidates && data.candidates.length > 0) {
            return (data.candidates[0].content.parts[0].text);
        } else {
            throw new Error('Unexpected response structure: No candidates found');
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

function SearchEvent(event) {
    if (event.key === 'Enter') {
        const city = searchInput.value.trim();
        if (city) {
            getWeatherData(city);
        } else {
            showError('Please enter a city name.');
        }
    }
}

// Function for handling button click
function SearchByClick() {
    const city = searchInput.value.trim();
    if (city) {
        currentCity=city;
        getWeatherData(city);
    } else {
        showError('Please enter a city name.');
    }
}

// Function to fetch current weather data
function getWeatherData(city) {
showLoading();
    const apiKey = 'f46cf96a3a72845e83afefb220c37c9a';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    
    fetch(url)
        .then(response => {
            if (response.status === 404) {
                throw new Error('City not found');
            } else if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const cityName = data.name;
            // Fetch forecast data for the next 5 days
            getForecastData(data.coord.lat, data.coord.lon);
        })
        .catch(error => {
            if (error.message === 'City not found') {
                showError('City not found. Please check the city name.');
            } else {
                console.error('Error fetching weather data:', error);
                showError('Unable to fetch weather data. Please try again later.');
            }
        }).finally(() => {
            hideLoading();
        });
}

function getForecastData(lat, lon) {
    const apiKey = 'f46cf96a3a72845e83afefb220c37c9a';
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            ForecastData = data; 
            originalForecastData = JSON.parse(JSON.stringify(data)); // Deep copy the original data
            renderTable(1); // Render the first page of the table
        })
        .catch(error => {
            console.error('Error fetching forecast data:', error);
            showError('Unable to fetch forecast data. Please try again later.');
        }).finally(() => {
            hideLoading();
        });
}

function getWeatherByLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            getForecastData(latitude, longitude);
        }, () => {
            alert('Unable to retrieve your location. Please enable location services.');
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
}

function GetGeminiResponse(){
const GeminiapiKey = 'AIzaSyDY9U0RmuLqudas1_efkVyXf3Ix-DWZK8A';
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

const requestBody = {
  prompt: {
    text: "Write a short story about a robot learning to be human."
  }
};

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(requestBody),
})
  .then(response => response.json())
  .then(data => {
    console.log("Generated content:", data);
  })
  .catch(error => {
    console.error("Error:", error);
  });
}

function renderTable(page) {
    const tableBody = document.getElementById('tableBody');
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    // Clear previous table data
    tableBody.innerHTML = '';

    // Check if ForecastData is available
    if (!ForecastData || !ForecastData.list) {
        return;
    }

    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = ForecastData.list.slice(start, end);

    pageData.forEach(entry => {
        const row = document.createElement('tr');
        const date = new Date(entry.dt_txt);

        row.innerHTML = `
            <td class=" py-2 px-3 border-b border-gray-700 text-sm">${date.toLocaleDateString('en-US', { weekday: 'long' })}</td>
            <td class=" py-2 px-3 border-b border-gray-700 text-sm">${date.toLocaleDateString()}</td>
            <td class="Tempdata py-2 px-3 border-b border-gray-700 text-sm">${entry.main.temp_max.toFixed(2)} °C</td>
            <td class="Tempdata py-2 px-3 border-b border-gray-700 text-sm">${entry.main.temp_min.toFixed(2)} °C</td>
            <td class=" py-2 px-3 border-b border-gray-700 text-sm">${entry.weather[0].description}</td>
        `;
        tableBody.appendChild(row);
    });

    const totalPages = Math.ceil(ForecastData.list.length / rowsPerPage);
    pageInfo.innerText = `Page ${page} of ${totalPages}`;
    
    prevBtn.disabled = page === 1;
    nextBtn.disabled = page === totalPages;

    prevBtn.onclick = () => changePage(page - 1);
    nextBtn.onclick = () => changePage(page + 1);
}
function sortAsc() {
    if (ForecastData && ForecastData.list) {
        ForecastData.list.sort((a, b) => a.main.temp_max - b.main.temp_max);
        renderTable(1);
    }
}

function sortDesc() {
    if (ForecastData && ForecastData.list) {
        ForecastData.list.sort((a, b) => b.main.temp_max - a.main.temp_max);
        renderTable(1);
    }
}

function filterRain() {
    if (ForecastData && ForecastData.list) {
        const rainyDays = originalForecastData.list.filter(entry => entry.weather[0].description.toLowerCase().includes('rain'));
        ForecastData.list = rainyDays;  // Update ForecastData with filtered data
        renderTable(1); // Re-render the table with filtered data
    }
}

function toggleRainFilter() {
    const filterRainBtn = document.getElementById('filterRainBtn');
    
    // Toggle the active class
    filterRainBtn.classList.toggle('active');
    
    if (filterRainBtn.classList.contains('active')) {
        filterRain(); // Apply the rain filter
    } else {
        ForecastData = JSON.parse(JSON.stringify(originalForecastData)); // Restore original data
        renderTable(1); // Re-render the table with original data
    }
}

function findMaxTemp() {
    if (ForecastData && ForecastData.list) {
        const maxTempEntry = ForecastData.list.reduce((max, entry) => entry.main.temp_max > max.main.temp_max ? entry : max);
        alert(`Max Temperature: ${maxTempEntry.main.temp_max.toFixed(2)} °C on ${maxTempEntry.dt_txt}`);
    }
}

function changePage(page) {
    currentPage = page;
    renderTable(currentPage);
}

function toggleUnit() {
    const toggleButton = document.getElementById('toggleUnitBtn');
    const tempElements = document.querySelectorAll('.Tempdata'); // Select all temperature elements

    tempElements.forEach(tempElement => {
        const currentTemp = parseFloat(tempElement.innerText); // Get current temperature

        if (isCelsius) {
            const fahrenheit = (currentTemp * 9 / 5) + 32; // Convert Celsius to Fahrenheit
            tempElement.innerText = fahrenheit.toFixed(0) + '°F'; // Update each temperature to Fahrenheit
        } else {
            const celsius = (currentTemp - 32) * 5 / 9; // Convert Fahrenheit to Celsius
            tempElement.innerText = celsius.toFixed(0) + '°C'; // Update each temperature to Celsius
        }
    });

    // Toggle button text between Celsius and Fahrenheit
    toggleButton.innerText = isCelsius ? '°F' : '°C';
    isCelsius = !isCelsius; // Toggle the state
}

function openChatbot() {
    document.getElementById('chatbotPopup').classList.remove('hidden');
}

function closeChatbot() {
    document.getElementById('chatbotPopup').classList.add('hidden');
}

 function appendUserMessage(message) {
    const userMessage = document.createElement('p');
    userMessage.className = 'my-1 bg-blue-500 text-white rounded-2xl px-4 py-2 inline-block max-w-xs break-words shadow-md float-right clear-both';
    userMessage.textContent = message;
    chatbotResponse.appendChild(userMessage);
    chatbotResponse.scrollTop = chatbotResponse.scrollHeight;
}

function appendChatbotMessage(message) {
    const chatbotMessage = document.createElement('p');
    chatbotMessage.className = 'my-1 bg-green-500 text-white rounded-2xl px-4 py-2 inline-block max-w-xs break-words shadow-md float-left clear-both';
    chatbotMessage.textContent = message;
    chatbotResponse.appendChild(chatbotMessage);
    chatbotResponse.scrollTop = chatbotResponse.scrollHeight;

}

function appendUserMessageMob(message) {
    const userMessage = document.createElement('p');
    userMessage.className = 'my-1 bg-blue-500 text-white rounded-2xl px-4 py-2 inline-block max-w-xs break-words shadow-md float-right clear-both';
    userMessage.textContent = message;
    chatbotResponseMob.appendChild(userMessage);
    chatbotResponseMob.scrollTop = chatbotResponse.scrollHeight;
}

function appendChatbotMessageMob(message) {
    const chatbotMessage = document.createElement('p');
    chatbotMessage.className = 'my-1 bg-green-500 text-white rounded-2xl px-4 py-2 inline-block max-w-xs break-words shadow-md float-left clear-both';
    chatbotMessage.textContent = message;
    chatbotResponseMob.appendChild(chatbotMessage);
    chatbotResponseMob.scrollTop = chatbotResponse.scrollHeight;

}

function findMinTemperature(data) {
    return Math.min(...data.list.map(entry => entry.main.temp_min));
  }
  
  function findMaxTemperature(data) {
    return Math.max(...data.list.map(entry => entry.main.temp_max));
  }
  
  function calculateAverageTemperature(data) {
    const totalTemp = data.list.reduce((sum, entry) => sum + entry.main.temp, 0);
    return totalTemp / data.list.length;
  }
  
  function findFirstWeatherCondition(data) {
    return data.list[0].weather[0].main;
  }

  async function sendMessage() {
    let message;
    if (chatbotinputMob.value) {
        message = chatbotinputMob.value;
    } else if (chatbotinput.value) {
        message = chatbotinput.value;
    } else {
        return;
    }

    appendUserMessage(message);
    appendUserMessageMob(message);
    message = message.toLowerCase();

    // Weather-related queries
    if (message.includes('max temp') || message.includes('maximum temperature') || message.includes('hottest')) {
        appendChatbotMessage(`The maximum temperature in ${currentCity} is ${findMaxTemperature(ForecastData)} °C.`);
        appendChatbotMessageMob(`The maximum temperature in ${currentCity} is ${findMaxTemperature(ForecastData)} °C.`);
    }
    else if (message.includes('min temp') || message.includes('minimum temperature') || message.includes('coldest')) {
        appendChatbotMessage(`The minimum temperature in ${currentCity} is ${findMinTemperature(ForecastData)} °C.`);
        appendChatbotMessageMob(`The minimum temperature in ${currentCity} is ${findMinTemperature(ForecastData)} °C.`);
    }
    else if (message.includes('avg temp') || message.includes('average temperature') || message.includes('mean temp')) {
        appendChatbotMessage(`The average temperature in ${currentCity} is ${calculateAverageTemperature(ForecastData)} °C.`);
        appendChatbotMessageMob(`The average temperature in ${currentCity} is ${calculateAverageTemperature(ForecastData)} °C.`);
    }
    else if (message.includes('current condition') || message.includes('condition') || message.includes('today')) {
        appendChatbotMessage(`The current weather in ${currentCity} condition is: ${findFirstWeatherCondition(ForecastData)}.`);
        appendChatbotMessageMob(`The current weather in ${currentCity} condition is: ${findFirstWeatherCondition(ForecastData)}.`);
    }
    // Handle day-specific weather queries
    else if (message.includes('weather on') || message.includes('weather like')) {
        const dayOfWeek = extractDayFromMessage(message); // Extract the day from the message
        if (dayOfWeek) {
            const forecast = findWeatherForDay(ForecastData, dayOfWeek); // Find the forecast for that day
            if (forecast) {
                appendChatbotMessage(`The weather on ${dayOfWeek} in ${currentCity} is: ${forecast.condition} with a temperature of ${forecast.temperature} °C.`);
                appendChatbotMessageMob(`The weather on ${dayOfWeek} in ${currentCity} is: ${forecast.condition} with a temperature of ${forecast.temperature} °C.`);
            } else {
                appendChatbotMessage(`Sorry, I couldn't find the weather forecast for ${dayOfWeek}.`);
                appendChatbotMessageMob(`Sorry, I couldn't find the weather forecast for ${dayOfWeek}.`);
            }
        } else {
            appendChatbotMessage("Please specify a valid day of the week.");
            appendChatbotMessageMob("Please specify a valid day of the week.");
        }
    }
    // Fallback to fetching a response from Gemini if no match
    else {
        FetchGeminiResponse(message).then((resp) => {
            appendChatbotMessage(resp);
            appendChatbotMessageMob(resp);
        }).catch((error) => {
            console.error("Error fetching Gemini response:", error);
        });
    }

    chatbotinput.value = '';
    chatbotinputMob.value = '';
}

function extractDayFromMessage(message) {
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (const day of daysOfWeek) {
        if (message.includes(day)) {
            return day;
        }
    }
    return null;
}

function findWeatherForDay(ForecastData, dayOfWeek) {
    const forecast = ForecastData.list.find(entry => {
        const date = new Date(entry.dt_txt);
        return date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() === dayOfWeek;
    });

    if (forecast) {
        return {
            condition: forecast.weather[0].description,
            temperature: forecast.main.temp
        };
    } else {
        return null;
    }
}


searchInput.addEventListener('keypress', SearchEvent);
document.querySelector("#searchBtn").addEventListener('click', SearchByClick);
document.querySelector("#sendBtn").addEventListener('click', sendMessage);
getWeatherData('Islamabad'); 


