const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const errWindow = document.querySelector("[data-errorWindow]");


//initially variables need???

let currentTab = userTab;
let API_KEY = '09d5daa34e5e20587a887ff17f209de5';
currentTab.classList.add("current-tab");
getfromSessionStorage();



function switchTab(clickedTab){

    if(clickedTab !== currentTab){
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");
    }

    if(!searchForm.classList.contains("active")){
        // kya searchform main container is invisible, if yes then make it visible
        userInfoContainer.classList.remove("active");
        grantAccessContainer.classList.remove("active");
        searchForm.classList.add("active");
    }

    else{
        //main pehle search wale tab pr tha , ab your weather tab visible karna hai
        userInfoContainer.classList.remove("active");
        grantAccessContainer.classList.remove("active");
        searchForm.classList.remove("active");
        //ab main your weather tab me aagya h, toh weather bhi display karna padega, so let's check local storage first
        // for coordinates, if we haved saved them there.
        getfromSessionStorage();
    }
}

userTab.addEventListener("click", () => {
    //pass clicked tab as input parameter
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    //pass clicked tab as input parameter
    switchTab(searchTab);
});


//check if coordinates are already present in session storage
function getfromSessionStorage(){

    const localCoordinates = sessionStorage.getItem("user-coordinates");

    if(!localCoordinates){
        //agar local coordinates nahi mile
        grantAccessContainer.classList.add("active");
    }
    else{
        //JSON.parse => ye ek string ko javascript objects m convert kr deta hai
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates){

    const{lat,lon} = coordinates;
    //make grantcontainer invisible
    grantAccessContainer.classList.remove("active");
    //make loader visible
    loadingScreen.classList.add("active");

    //API CALL
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        ); 

        const data = await response.json();

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } 
    catch (error) {
        loadingScreen.classList.remove("active");
        
    }
}

function renderWeatherInfo(weatherInfo){
    //firstly, we have to fetch the elements
     
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherdesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    console.log(temp);
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const clouds = document.querySelector("[data-clouds]");

    //fetch values from weatherInfo objects and put it in UI elements
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `https://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp.toFixed(2)} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity} %`;
    clouds.innerHTML = `${weatherInfo?.clouds?.all} %`;
}


function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        //hw - show an alert for no geolocation support available

    }
}

function showPosition(position){
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates" , JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}



const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);

const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault(); //preventDefault() helps us to stop default action of the browser
    let cityName = searchInput.value;

    if(cityName === "")
    return;
    else
        fetchSearchWeatherInfo(cityName);
})

async function fetchSearchWeatherInfo(city){
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
            const data = await response.json();
            if(!data.name){
                throw new Error("City Not available")
            }
            loadingScreen.classList.remove("active");
            userInfoContainer.classList.add("active");
            errWindow.classList.remove("active");
            renderWeatherInfo(data);

    } catch (error) {
        
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.remove("active");
        errWindow.classList.add("active");
    }
}

