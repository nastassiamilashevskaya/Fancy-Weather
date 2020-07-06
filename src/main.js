import './style.scss';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl';
import speechSynthesis from 'speech-synthesis';
import WeatherIcons from './WeatherIcons';
import WeekDays from './WeekDays';
import Description from './Description';
import Months from './Months';

const body = document.querySelector('#body');
const backgroundButton = document.querySelector('#background-button');
const currentCity = document.querySelector('#current-city');
const currentDate = document.querySelector('#current-date');
const currentDegrees = document.querySelector('#current-degrees');
const currentForecast = document.querySelector('#current-forecast');
const weatherIcon = document.querySelector('#weather-icon');
const weatherNextDays = document.querySelector('#weather-next');
const coordinates = document.querySelector('#coordinates');
const searchButton = document.querySelector('#search-button');
const searchInput = document.querySelector('#search-input');
const errors = document.querySelector('#errors');
const enButton = document.querySelector('#en-button');
const ruButton = document.querySelector('#ru-button');
const beButton = document.querySelector('#be-button');
const celButton = document.querySelector('#cel-button');
const farButton = document.querySelector('#far-button');
const celInput = document.querySelector('#cel-input');
const farInput = document.querySelector('#far-input');
const speechButton = document.querySelector('#speaker');
const playButton = document.querySelector('#play-button');
const preloader = document.querySelector('#preloader');

let curTimezone;
let previousCity;
const seasons = ['winter', 'spring', 'summer', 'autumn'];
const timesOfDay = ['night', 'morning', 'day', 'evening'];
if (localStorage.getItem('language') === null) localStorage.setItem('language', 'en');
if (localStorage.getItem('degrees') === null) localStorage.setItem('degrees', 'cel');

function getImg() {
  const backgroundImgUrl = `https://api.unsplash.com/photos/random?orientation=landscape&per_page=1&query={${localStorage.getItem('location')},`;
  const backgroundImgAccessKey = '}&client_id=zQ8SSdH9Ogj8nNvg1L-DtNUHR806apKAbHuGhKcrTXc';
  const today = new Date();
  const season = seasons[Math.floor((((new Date()).getMonth() + 1) % 12) / 3)];
  const timeOfDay = timesOfDay[Math.floor(((today.toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: localStorage.getItem('timezone') }) + 1) % 24) / 6)];
  return `${backgroundImgUrl}${timeOfDay},${season}${backgroundImgAccessKey}`;
}
const checkDegrees = () => {
  switch (localStorage.getItem('degrees')) {
    case 'cel':
      celButton.classList.add('active');
      celInput.checked = true;
      break;
    case 'far':
      farButton.classList.add('active');
      farInput.checked = true;
      break;
    default: break;
  }
};
async function getBackgroundImage() {
  try {
    // console.log(getImg());
    const response = await fetch(getImg());
    if (!response.ok) throw new Error('Ответ сети был не ok.');
    const data = await response.json();
    if (data.Response === 'False') throw new Error(data.Error);
    body.style.background = `url(${data.urls.full}) center no-repeat fixed`;
    body.style.backgroundSize = 'cover';
  } catch (error) {
    body.style.background = 'url(assets/standartBg.jpg) center no-repeat fixed';
    body.style.backgroundSize = 'cover';
    console.error(error);
  }
}

backgroundButton.addEventListener('click', () => getBackgroundImage());

const isCyrillic = (text) => (/[а-я]/i.test(text));

const celIntoFar = (number) => Math.ceil((number * 9) / 5 + 32);

const farIntoCel = (number) => Math.floor(((number - 32) * 5) / 9);
const setCurrentTime = () => {
  let dateLanguage = '';
  switch (localStorage.getItem('language')) {
    case 'en': dateLanguage = 'en-EN';
      break;
    case 'ru': dateLanguage = 'ru-RU';
      break;
    case 'be': dateLanguage = 'be-BE';
      break;
    default: break;
  }

  const date = new Date().toLocaleString(dateLanguage, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: curTimezone,
    hour12: false,
  });
  currentDate.childNodes[3].innerText = date.slice(-9);
};

const setCurrentFullDate = () => {
  const date = new Date();
  let result = '';
  switch (localStorage.getItem('language')) {
    case 'en': result += `${WeekDays[date.getDay() % 7].en},`;
      break;
    case 'ru': result += `${WeekDays[date.getDay() % 7].ru},`;
      break;
    case 'be': result += `${WeekDays[date.getDay() % 7].be},`;
      break;
    default: break;
  }

  result += ` ${date.getDate()} `;

  switch (localStorage.getItem('language')) {
    case 'en': result += `${Months[date.getMonth() % 7].en},`;
      break;
    case 'ru': result += `${Months[date.getMonth() % 7].ru},`;
      break;
    case 'be': result += `${Months[date.getMonth() % 7].be},`;
      break;
    default: break;
  }
  currentDate.childNodes[1].innerText = result;
  preloader.classList.add('loaded');
  preloader.classList.remove('loaded_hiding');
};

setInterval(setCurrentTime, 1000);

const setCoordinates = (c1, c2) => {
  const coordinatesArray = [];
  coordinatesArray.push(c1);
  coordinatesArray.push(c2);
  return coordinatesArray;
};

const setCurrentWeather = (degrees, descriptionId, descriptionMain, feelsLike, wind, humidity) => {
  weatherIcon.innerHTML = WeatherIcons.get(descriptionMain);
  const deg = localStorage.getItem('degrees');
  currentDegrees.innerHTML = `<span class="span-to-change">${deg === 'far' ? celIntoFar(degrees) : degrees}</span><span>°</span>`;
  switch (localStorage.getItem('language')) {
    case 'en': currentForecast.innerHTML = `<p>${Description[descriptionId][0]}</p>
    <p>Feels like: <span class="span-to-change">${deg === 'far' ? celIntoFar(feelsLike) : feelsLike}</span><span>°</span></p>
    <p>Wind: <span>${wind}</span> m/s</p>
    <p>Humidity: <span>${humidity}</span>%</p>`;
      break;
    case 'ru': currentForecast.innerHTML = `<p>${Description[descriptionId][1]}</p>
    <p>Ощущается как: <span class="span-to-change">${deg === 'far' ? celIntoFar(feelsLike) : feelsLike}</span><span>°</span></p>
    <p>Скорость ветра: <span>${wind}</span> м/с</p>
    <p>Влажность: <span>${humidity}</span>%</p>`;
      break;
    case 'be': currentForecast.innerHTML = `<p>${Description[descriptionId][2]}</p>
    <p>Уяўная тэмпература: <span class="span-to-change">${deg === 'far' ? celIntoFar(feelsLike) : feelsLike}</span><span>°</span></p>
    <p>Хуткасць ветру: <span>${wind}</span> м/с</p>
    <p>Вільготнасць: <span>${humidity}</span>%</p>`;
      break;
    default: break;
  }
};

const setNextWeather = (day, degrees, description) => {
  const deg = localStorage.getItem('degrees');
  const nextDay = document.createElement('div');
  nextDay.classList.add('next-day');
  const dayTitle = document.createElement('div');
  dayTitle.classList.add('day-of-week');
  dayTitle.innerText = day;
  const nextDegrees = document.createElement('div');
  nextDegrees.classList.add('degrees-next');
  nextDegrees.innerHTML = `<span class="span-to-change">${deg === 'far' ? celIntoFar(degrees) : degrees}</span><span>°</span>`;
  const icon = document.createElement('div');
  icon.classList.add('weather-icon-sm');
  icon.innerHTML = WeatherIcons.get(description);
  nextDay.append(dayTitle, nextDegrees, icon);
  weatherNextDays.append(nextDay);
};

const createMap = (curCoordinates) => {
  mapboxgl.accessToken = 'pk.eyJ1IjoibmFzdGFzc2lhbmlzaCIsImEiOiJja2FxdjlqM3IwM2p3MzBtczNhc3lndHBnIn0.KZ6c7d5OlMn_wUFNvgFOPQ';
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: curCoordinates,
    zoom: 9,
  });
  const marker = new mapboxgl.Marker()
    .setLngLat(curCoordinates)
    .addTo(map);
};

async function getTime(city) {
  try {
    const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${city}&language=${localStorage.getItem('language')}&key=d4d31daabd1f486e955b6ea2fbe2588f`);
    if (!response.ok) throw new Error('Ответ сети не ок');
    const data = await response.json();
    if (data.Response === 'False') throw new Error(data.Error);
    curTimezone = data.results[0].annotations.timezone.name;
    localStorage.setItem('timezone', curTimezone);
    setCurrentTime();
    setCurrentFullDate();
    currentCity.innerText = data.results[0].formatted;
    const coordinatesArray = setCoordinates(data.results[0].geometry.lng,
      data.results[0].geometry.lat);
    createMap(coordinatesArray);
    coordinates.innerHTML = coordinatesArray[1] < 0 ? `<p>- ${data.results[0].annotations.DMS.lat}</p>` : `<p> ${data.results[0].annotations.DMS.lat}</p>`;
    coordinates.innerHTML += coordinatesArray[0] < 0 ? `<p>- ${data.results[0].annotations.DMS.lng}</p>` : `<p> ${data.results[0].annotations.DMS.lng}</p>`;
  } catch (error) {
    console.error(error);
  }
}

async function getWeather(city) {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&lang=be&units=metric&APPID=ee70ae8c5a4858367ea09299649deea7`);
    if (!response.ok) throw new Error('Ответ сети не ок');
    const data = await response.json();
    if (data.Response === 'False') throw new Error(data.Error);
    setCurrentWeather(Math.ceil(data.list[0].main.temp),
      data.list[0].weather[0].id,
      data.list[0].weather[0].main,
      Math.ceil(data.list[0].main.feels_like * 10) / 10,
      Math.ceil(data.list[0].wind.speed * 10) / 10,
      data.list[0].main.humidity);
    weatherNextDays.innerHTML = '';
    const index = (new Date()).getDay();
    let j = 8;
    for (let i = index + 1; i < index + 4; i += 1) {
      switch (localStorage.getItem('language')) {
        case 'en':
          setNextWeather(WeekDays[i % 7].en,
            Math.ceil(data.list[j].main.temp),
            data.list[j].weather[0].main);
          j += 8;
          break;
        case 'ru':
          setNextWeather(WeekDays[i % 7].ru,
            Math.ceil(data.list[j].main.temp),
            data.list[j].weather[0].main);
          j += 8;
          break;
        case 'be':
          setNextWeather(WeekDays[i % 7].be,
            Math.ceil(data.list[j].main.temp),
            data.list[j].weather[0].main);
          j += 8;
          break;
        default: break;
      }
    }
    getTime(previousCity);
    localStorage.setItem('location', previousCity);
  } catch (error) {
    preloader.classList.add('loaded');
    preloader.classList.remove('loaded_hiding');
    errors.innerText = 'Sorry, we didn`t find weather for this city. Please, try again';
    console.error(error);
  }
}


async function getLocation() {
  try {
    const response = await fetch('https://ipinfo.io/json?token=d3242d9267047a');
    if (!response.ok) throw new Error('Ответ сети не ок');
    const data = await response.json();
    if (data.Response === 'False') throw new Error(data.Error);
    previousCity = data.city;
    localStorage.setItem('location', previousCity);
    getWeather(previousCity);
  } catch (error) {
    preloader.classList.add('loaded');
    preloader.classList.remove('loaded_hiding');
    errors.innerText = 'Sorry, we didn`t find your location.';
    console.error(error);
  }
}

async function searchCyrillic(city) {
  try {
    const translateResponse = await fetch(`https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20200506T195217Z.e4f4e8eefb816ded.e4bef0a6426c3e22e73b3cd59b6b558bbea55909&text=${city}&lang=ru-en`);
    if (!translateResponse.ok) {
      errors.innerText = 'Sorry, some problems on the server.';
      throw new Error('Ответ сети был не ok.');
    }
    const translateData = await translateResponse.json();
    if (translateData.Response === 'False') {
      errors.innerText = 'Sorry, some problems on the server.';
      throw new Error(translateData.Error);
    }
    const newCity = String(translateData.text);
    previousCity = newCity;
    getWeather(previousCity);
  } catch (error) {
    errors.innerText = 'No results were found. Please, try again';
    console.error(error);
  }
}

const searchListener = () => {
  errors.innerText = '';
  if (searchInput.value !== '') {
    preloader.classList.add('loaded_hiding');
    preloader.classList.remove('loaded');
    if (isCyrillic(searchInput.value)) {
      searchCyrillic(searchInput.value);
      getBackgroundImage();
    } else {
      previousCity = searchInput.value;
      getWeather(previousCity);
      getBackgroundImage();
    }
  }
};

searchButton.addEventListener('click', () => searchListener());

searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') searchListener();
});

enButton.addEventListener('click', () => {
  preloader.classList.add('loaded_hiding');
  preloader.classList.remove('loaded');
  localStorage.setItem('language', 'en');
  getWeather(previousCity);
});

ruButton.addEventListener('click', () => {
  preloader.classList.add('loaded_hiding');
  preloader.classList.remove('loaded');
  localStorage.setItem('language', 'ru');
  getWeather(previousCity);
});

beButton.addEventListener('click', () => {
  preloader.classList.add('loaded_hiding');
  preloader.classList.remove('loaded');
  localStorage.setItem('language', 'be');
  getWeather(previousCity);
});

celButton.addEventListener('click', () => {
  if (localStorage.getItem('degrees') === 'far') {
    [...document.querySelectorAll('.span-to-change')].forEach((el) => {
      el.innerText = farIntoCel(Number(el.innerText));
    });
    localStorage.setItem('degrees', 'cel');
  }
});

farButton.addEventListener('click', () => {
  if (localStorage.getItem('degrees') === 'cel') {
    [...document.querySelectorAll('.span-to-change')].forEach((el) => {
      el.innerText = celIntoFar(Number(el.innerText));
    });
    localStorage.setItem('degrees', 'far');
  }
});

function speechWeather() {
  let voices = [];
  const synth = window.speechSynthesis;
  voices = synth.getVoices();
  let text = (localStorage.getItem('language') === 'en') ? 'Today there are ' : 'Температура сейчас ';
  text += `${
    document.querySelector('#current-degrees').innerText
  }. ${document.querySelector('#current-forecast').innerText}`;
  const utterThis = new SpeechSynthesisUtterance(text);
  utterThis.voice = localStorage.getItem('language') === 'en' ? voices[2] : voices[0];
  utterThis.volume = 0.5;
  synth.speak(utterThis);
  return utterThis;
}

document.addEventListener('click', (event) => {
  if (event.target.id === 'play') {
    speechWeather();
  }
});

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new window.SpeechRecognition();
recognition.interimResults = true;

speechButton.addEventListener('click', () => {
  recognition.start();
});

recognition.addEventListener('end', () => {
  if (searchInput.value !== '') {
    if (searchInput.value === 'weather') {
      speechWeather();
    } else if (searchInput.value === 'louder') {
      speechWeather().volume += 0.5;
    } else if (searchInput.value === 'quieter') {
      speechWeather().volume -= 0.4;
    } else {
      searchListener();
    }
  }
  speechButton.checked = false;
});

recognition.addEventListener('result', (e) => {
  const transcript = Array.from(e.results).map((result) => result[0]).map((result) => result.transcript).join('');
  searchInput.value = transcript;
});

window.onload = () => {
  preloader.classList.add('loaded_hiding');
  preloader.classList.remove('loaded');
  checkDegrees();
  getLocation();
  getBackgroundImage();
  enButton.offsetParent.classList.remove('active');
  ruButton.offsetParent.classList.remove('active');
  beButton.offsetParent.classList.remove('active');
  switch (localStorage.getItem('language')) {
    case 'en': enButton.offsetParent.classList.add('active');
      break;
    case 'ru': ruButton.offsetParent.classList.add('active');
      break;
    case 'be': beButton.offsetParent.classList.add('active');
      break;
    default: break;
  }
};
