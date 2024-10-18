function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
}
// Function to show loading spinner
// Function to show loading spinner and hide weather data
function showSpinner() {
    document.getElementById('loading-spinner').style.display = 'block';
    
    // Hide all weather data elements
    document.getElementById('city-name').style.display = 'none';
    document.getElementById('weather-icon').style.display = 'none';
    document.getElementById('city-temp').style.display = 'none';
    document.getElementById('humidity-value').style.display = 'none';
    document.getElementById('wind-speed-value').style.display = 'none';
    document.getElementById('pressure-value').style.display = 'none';
}

// Function to hide loading spinner and show weather data
function hideSpinner() {
    document.getElementById('loading-spinner').style.display = 'none';
    
    // Show all weather data elements
    document.getElementById('city-name').style.display = 'block';
    document.getElementById('weather-icon').style.display = 'block';
    document.getElementById('city-temp').style.display = 'block';
    document.getElementById('humidity-value').style.display = 'block';
    document.getElementById('wind-speed-value').style.display = 'block';
    document.getElementById('pressure-value').style.display = 'block';
}

function getWeatherData(city) {
    showSpinner();  // Show spinner when the API call starts
    const apiKey = 'f46cf96a3a72845e83afefb220c37c9a';
    let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

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
            const temperature = data.main.temp;
            const weatherIcon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
            const humidity = data.main.humidity;
            const windSpeed = data.wind.speed;
            const pressure = data.main.pressure;
            const weatherCon = data.weather[0].main;

            // Update the UI with the fetched weather details
            updateWeather(cityName, temperature, weatherIcon, humidity, windSpeed, pressure, weatherCon);

            // Fetch forecast data for charts
            getForecastData(data.coord.lat, data.coord.lon);
        })
        .catch(error => {
            if (error.message === 'City not found') {
                showError('City not found. Please check the city name.');
            } else {
                console.error('There was an error fetching the weather data:', error);
                showError('Unable to fetch weather data. Please try again later.');
            }
        })
        .finally(() => {
            hideSpinner();  // Hide spinner when the API call completes (whether success or failure)
        });
}

function getForecastData(lat, lon) {
    const apiKey = 'f46cf96a3a72845e83afefb220c37c9a';
    let url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Extracting data for the next 5 days
            const dailyData = {};
            data.list.forEach(item => {
                const date = new Date(item.dt * 1000);
                const day = date.toLocaleDateString('en-US', { weekday: 'long' });

                // Group data by date
                if (!dailyData[day]) {
                    dailyData[day] = {
                        temperatures: [],
                        humidity: [],
                        weatherCondition: item.weather[0].main,
                    };
                }
                dailyData[day].temperatures.push(item.main.temp);
                dailyData[day].humidity.push(item.main.humidity);
            });

            // Prepare the data for display
            const weatherData = {
                labels: Object.keys(dailyData),
                temperatures: Object.values(dailyData).map(data => (data.temperatures.reduce((a, b) => a + b, 0) / data.temperatures.length).toFixed(1)),
                humidity: Object.values(dailyData).map(data => (data.humidity.reduce((a, b) => a + b, 0) / data.humidity.length).toFixed(1)),
                weatherConditions: Object.values(dailyData).map(data => data.weatherCondition),
            };

            // Update charts with new data
            updateCharts(weatherData);
        })
        .catch(error => {
            console.error('Error fetching forecast data:', error);
        })
        .finally(() => {
            hideSpinner(); 
        });
}

// Function to get weather data based on the user's location
function getWeatherByLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            fetchWeatherDataByCoords(latitude, longitude);
        }, () => {
            alert('Unable to retrieve your location. Please enable location services.');
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

// Function to fetch weather data based on coordinates
function fetchWeatherDataByCoords(lat, lon) {
    const apiKey = 'f46cf96a3a72845e83afefb220c37c9a';
    let url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const cityName = data.name;
            const temperature = data.main.temp;
            const weatherIcon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
            const humidity = data.main.humidity;
            const windSpeed = data.wind.speed;
            const pressure = data.main.pressure;
            const weatherCon = data.weather[0].main;

            // Update the UI with the fetched weather details
            updateWeather(cityName, temperature, weatherIcon, humidity, windSpeed, pressure, weatherCon);

            // Fetch forecast data for charts
            getForecastData(lat, lon);
        })
        .catch(error => {
            console.error('There was an error fetching the weather data:', error);
            showError('Unable to fetch weather data. Please try again later.');
        });
}


// Function to update the weather display
function updateWeather(city, temperature, iconURL, humidity, windSpeed, pressure, weatherCon) {
    document.getElementById('city-name').textContent = city;
    document.getElementById('city-temp').textContent = `${Math.round(temperature)}°C`;  // Rounded temperature
    document.getElementById('weather-icon').src = iconURL;
    document.querySelector('.card-bg:nth-child(2) p').textContent = `${humidity}%`;  // Humidity
    document.querySelector('.card-bg:nth-child(3) p').textContent = `${windSpeed} km/h`;  // Wind Speed
    document.querySelector('.card-bg:nth-child(4) p').textContent = `${pressure} hPa`;  // Pressure

    // Get references to the elements once
    const contentWrapper = document.querySelector('.content-wrapper');
    const weatherInfoDiv = document.querySelector('.weatherInfoDiv');
    const chartDiv1 = document.querySelector('.ChartDiv1');
    const chartDiv2 = document.querySelector('.ChartDiv2');
    const chartDiv3 = document.querySelector('.ChartDiv3');

    // Function to set text color based on background color for readability
    function setTextColor(backgroundColor) {
        // Simple logic to determine if the text color should be black or white based on brightness
        const rgb = backgroundColor.match(/\d+/g).map(Number);
        const brightness = Math.round(((rgb[0] * 299) + (rgb[1] * 587) + (rgb[2] * 114)) / 1000);
        return brightness < 128 ? 'white' : 'black'; // Choose white text for dark backgrounds, black for light backgrounds
    }

    let backgroundColor = '';
    switch (weatherCon) {
        case "Clouds":
            contentWrapper.style.backgroundImage = 'url("./Asset/cloudy.jpg")';
            backgroundColor = 'rgba(128, 128, 128, 0.8)'; // Solid gray for clouds
            break;
        case "Clear":
            contentWrapper.style.backgroundImage = 'url("./Asset/sunny.jpg")';
            backgroundColor = 'rgba(0, 153, 255, 0.8)'; // Solid blue for sunny
            break;
        case "Rain":
        case "Thunderstorm":
        case "Squall":
            contentWrapper.style.backgroundImage = 'url("./Asset/rain.jpg")'; // Use the same background for rain, thunderstorm, and squall
            backgroundColor = weatherCon === "Rain" ? 'rgba(0, 0, 139, 0.8)' : weatherCon === "Thunderstorm" ? 'rgba(50, 50, 50, 0.8)' : 'rgba(0, 0, 128, 0.8)'; // Appropriate colors
            break;
        case "Snow":
            contentWrapper.style.backgroundImage = 'url("./Asset/snow.webp")';
            backgroundColor = 'rgba(255, 255, 255, 0.8)'; // Semi-transparent white for snow
            break;
        case "Mist":
        case "Smoke":
        case "Haze":
        case "Fog":
        case "Dust":
        case "Sand":
        case "Ash":
            contentWrapper.style.backgroundImage = 'url("./Asset/mist.webp")'; // Use the same background for mist, smoke, haze, fog, dust, sand, and ash
            backgroundColor = weatherCon === "Mist" ? 'rgba(169, 169, 169, 0.8)' :
                             weatherCon === "Smoke" ? 'rgba(80, 80, 80, 0.8)' :
                             weatherCon === "Haze" ? 'rgba(150, 150, 150, 0.8)' :
                             weatherCon === "Fog" ? 'rgba(160, 160, 160, 0.8)' :
                             weatherCon === "Dust" ? 'rgba(210, 180, 140, 0.8)' :
                             weatherCon === "Sand" ? 'rgba(210, 180, 140, 0.8)' :
                             'rgba(120, 120, 120, 0.8)'; // For ash
            break;
        case "Tornado":
            contentWrapper.style.backgroundImage = 'url("./Asset/tornado.webp")';
            backgroundColor = 'rgba(128, 0, 0, 0.8)'; // Solid red for tornado
            break;
        default:
            contentWrapper.style.backgroundImage = ''; // Optional: set default background
            backgroundColor = 'rgba(255, 255, 255, 0.8)'; // Optional: default to semi-transparent white
    }
    

    // Set the background color
    weatherInfoDiv.style.background = backgroundColor;

    // Set text color for readability
    const textColor = setTextColor(backgroundColor);
    weatherInfoDiv.style.color = textColor;

    // Ensure all nested elements inside weatherInfoDiv have the appropriate text color
    let weatherInfoTextElements = weatherInfoDiv.querySelectorAll('*');
    weatherInfoTextElements.forEach(element => {
        element.style.color = textColor;
    });

    // Set the background for charts
    chartDiv1.style.background = backgroundColor;
    chartDiv2.style.background = backgroundColor;
    chartDiv3.style.background = backgroundColor;
}


// Function to display error messages
function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';  // Display the error message
}

// Function for handling Enter key press
function SearchEvent(event) {
    if (event.key === 'Enter') {
        const city = searchInput.value.trim();
        if (city) {
            getWeatherData(city);
            document.getElementById('error-message').style.display = 'none';  // Hide error if previously shown
        } else {
            showError('Please enter a city name.');
        }
    }
}

// Function for handling button click
function SearchByClick() {
    const city = searchInput.value.trim();
    if (city) {
        getWeatherData(city);
        document.getElementById('error-message').style.display = 'none';  // Hide error if previously shown
    } else {
        showError('Please enter a city name.');
    }
}

// Global chart instances
let verticalBarChart = null;
let doughnutChart = null;
let lineChart = null;

// Function to update charts with new data
function updateCharts(weatherData) {
    // Destroy existing charts if they already exist
    if (verticalBarChart) {
        verticalBarChart.destroy();
    }
    if (doughnutChart) {
        doughnutChart.destroy();
    }
    if (lineChart) {
        lineChart.destroy();
    }

    // Vertical Bar Chart
    const ctxBar = document.getElementById('verticalBarChart').getContext('2d');
    verticalBarChart = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: weatherData.labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: weatherData.temperatures,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }]
        },
        options: {
            scales: {
                x: {
                    ticks: {
                        color: 'black' // Change x-axis label color to white
                    },
                    title: {
                        color: 'black' // Change x-axis title color to white
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'black' // Change y-axis label color to white
                    },
                    title: {
                        color: 'black' // Change y-axis title color to white
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'black' // Change legend label color to white
                    }
                }
            }
        }
    });
console.log(weatherData);
   // Doughnut Chart
   const ctxDoughnut = document.getElementById('doughnutChart').getContext('2d');

   const uniqueConditions = [...new Set(weatherData.weatherConditions)]; // Get unique weather conditions
   const conditionCount = uniqueConditions.map(condition => weatherData.weatherConditions.filter(c => c === condition).length); // Count each condition

   doughnutChart = new Chart(ctxDoughnut, {
       type: 'doughnut',
       data: {
           labels: uniqueConditions, // Display unique weather conditions
           datasets: [{
               label: 'Weather Conditions for 5 Days',
               data: conditionCount, // Number of times each condition appears over 5 days
               backgroundColor: [
                   'rgba(255, 99, 132, 0.2)',
                   'rgba(54, 162, 235, 0.2)',
                   'rgba(255, 206, 86, 0.2)',
                   'rgba(75, 192, 192, 0.2)',
                   'rgba(153, 102, 255, 0.2)',
                   'rgba(255, 159, 64, 0.2)'
               ],
               borderColor: [
                   'rgba(255, 99, 132, 1)',
                   'rgba(54, 162, 235, 1)',
                   'rgba(255, 206, 86, 1)',
                   'rgba(75, 192, 192, 1)',
                   'rgba(153, 102, 255, 1)',
                   'rgba(255, 159, 64, 1)'
               ],
               borderWidth: 1,
           }]
       },
       options: {
           plugins: {
               legend: {
                   labels: {
                       color: 'black' // Set legend text color to black for readability
                   }
               }
           }
       }
   });
    // Line Chart
    const ctxLine = document.getElementById('lineChart').getContext('2d');
    lineChart = new Chart(ctxLine, {
        type: 'line',
        data: {
            labels: weatherData.labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: weatherData.temperatures,
                fill: false,
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.1,
            }]
        },
        options: {
            scales: {
                x: {
                    ticks: {
                        color: 'black' 
                    },
                    title: {
                        color: 'black' 
                    }
                },
                y: {
                    ticks: {
                        color: 'black' 
                    },
                    title: {
                        color: 'black' 
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'black' 
                    }
                }
            }
        }
    });
}
// Function to toggle between Celsius and Fahrenheit
let isCelsius = true; // Keep track of the current state

function toggleUnit() {
    const toggleButton = document.getElementById('toggleUnitBtn');
    const tempElement = document.getElementById('city-temp');
    const currentTemp = parseFloat(tempElement.innerText); // Assuming temperature is displayed somewhere with this ID

    if (isCelsius) {
        const fahrenheit = (currentTemp * 9 / 5) + 32; // Convert Celsius to Fahrenheit
        tempElement.innerText = fahrenheit.toFixed(0)+'°F'; // Update the displayed temperature
        toggleButton.innerText = '°F'; // Change button text to Fahrenheit
    } else {
        const celsius = (currentTemp - 32) * 5 / 9; // Convert Fahrenheit to Celsius
        tempElement.innerText = celsius.toFixed(0)+'°C'; // Update the displayed temperature
        toggleButton.innerText = '°C'; // Change button text to Celsius
    }

    isCelsius = !isCelsius; // Toggle the state
}

// Event listener for the button click
document.getElementById('toggleUnitBtn').addEventListener('click', toggleUnit);



const searchInput = document.querySelector('input[type="text"]');
searchInput.addEventListener('keypress', SearchEvent);

document.querySelector("#searchBtn").addEventListener('click', SearchByClick);


getWeatherData('Islamabad');