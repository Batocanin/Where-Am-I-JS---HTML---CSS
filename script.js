'use strict';

const countryContainer = document.querySelector('.countryContainer');

const inputCordinates = document.querySelectorAll('.cordinate');
const inputErrorText = document.querySelector('.inputError');
const inputErrorTextCountry = document.querySelector('.inputErrorCountry');
const whatCountry = document.querySelector('.header__h1');
const countryIcon = document.querySelector('.country-icon');
const countryInfoContainer = document.querySelector('.country--info');

const btnFind = document.querySelector('.btn-findCountry');
const btnMyLocation = document.querySelector('.btn-myLocation');
const btnResetLocation = document.querySelector('.btn-resetLocation');
const btnRandomLocation = document.querySelector('.btn-randomLocation');
const btnFindCountryByName = document.querySelector('.btn-findCountryByName');
const latitudeInput = document.querySelector('.cord-latitude');
const longitudeInput = document.querySelector('.cord-longitude');
const countryNameInput = document.querySelector('.countryNameInput');

// getLocation function
const getLocalCoordinates = function () {
  return new Promise(function (resolve) {
    navigator.geolocation.getCurrentPosition(resolve, function () {
      inputErrorText.textContent = `Please enable location!`;
    });
  });
};

const getMyLocationJSON = async function (apiURL) {
  const response = await fetch(apiURL);
  if (!response.ok) throw new Error(`ERROR: ${response.status}`);
  return await response.json();
};

const getCountryJSON = async function (apiURL) {
  const response = await fetch(apiURL);
  if (!response.ok) throw new Error(`ERROR: Country not found! Try Again!`);
  return await response.json();
};

const checkCoordinates = async function (lat, lng) {
  const data = await getMyLocationJSON(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
  if (!data.continent) {
    throw new Error(`You are in the middle of ${data.locality}. Please try again!`);
  } else {
    inputErrorText.textContent = ``;
  }
};

const renderMyNeighbors = async function (neighbors) {
  neighbors.forEach(async function () {
    const data = await fetch(`https://restcountries.com/v3.1/alpha/${neighbors}`);
    console.log(data);
  });
};

const renderMyLocation = function (countryData) {
  let language = Object.values(countryData.languages);
  let currency = Object.values(countryData.currencies);
  const render = `
    <article class="country" id="country">
        <img class="country__img" src="${countryData.flags.png}" />
        <div class="country__data">
        <h3 class="country__name">${countryData.name.common}</h3>
        <h4 class="country__region">${countryData.region}</h4>
        <p class="country__row"><span>👫</span>${(+countryData.population / 1000000).toFixed(1)}M population</p>
        <p class="country__row"><span>🗣️</span>${language[0]}</p>
        <p class="country__row"><span>💰</span>${currency[0].name}</p>
        </div>
    </article>
    `;
  countryContainer.insertAdjacentHTML('beforeend', render);

  whatCountry.textContent = `You are in ${countryData.name.common} `;
  countryIcon.src = countryData.flags.png;
  countryInfoContainer.style.opacity = 1;
  countryContainer.style.opacity = 1;

  //   Render Neighborrs
  const neighbours = countryData.borders;
  if (!neighbours) throw new Error('Country has not neighbours');
  neighbours.forEach(async function (neighbor) {
    const [neighboursForRender] = await getMyLocationJSON(`https://restcountries.com/v3.1/alpha/${neighbor}`);
    language = Object.values(neighboursForRender.languages);
    currency = Object.values(neighboursForRender.currencies);
    const render = `
    <article class="country neighbour" id="country">
        <img class="country__img" src="${neighboursForRender.flags.png}" />
        <div class="country__data">
        <h3 class="country__name">${neighboursForRender.name.common}</h3>
        <h4 class="country__region">${neighboursForRender.region}</h4>
        <p class="country__row"><span>👫</span>${(+neighboursForRender.population / 1000000).toFixed(1)} population</p>
        <p class="country__row"><span>🗣️</span>${language[0]}</p>
        <p class="country__row"><span>💰</span>${currency[0].name}</p>
        </div>
    </article>
    `;

    countryContainer.insertAdjacentHTML('beforeend', render);
    countryContainer.style.opacity = 1;
    countryContainer.scrollIntoView({ behavior: 'smooth' });
    inputErrorText.textContent = '';
    inputErrorTextCountry.textContent = '';
  });
};

// Reset Country Container
const resetCountryContainer = function () {
  countryContainer.style.opacity = 0;
  countryContainer.innerHTML = '';
  countryInfoContainer.style.opacity = 0;
  whatCountry.textContent = '';
  inputErrorTextCountry.textContent = '';
  inputErrorText.textContent = '';
};
// Find dugme Click Handler
btnFind.addEventListener('click', async function (e) {
  e.preventDefault();
  resetCountryContainer();
  try {
    if (!Number(latitudeInput.value)) throw new Error(`Input for latitude has to be number!`);
    if (!Number(longitudeInput.value)) throw new Error(`Input for longitude has to be number!`);
    if (Number(latitudeInput.value) < -90 || Number(latitudeInput.value) > 90) throw new Error('Input latitude need to be higher than -90 and less than 90');
    if (Number(longitudeInput.value) < -180 || Number(longitudeInput.value) > 180) throw new Error('Input longitude need to be higher than -180 and less than 180');
    const lat = Number(latitudeInput.value);
    const lng = Number(longitudeInput.value);
    await checkCoordinates(lat, lng);
    const countryCode = await getMyLocationJSON(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
    if (!countryCode) throw new Error('Country not found, try again!');
    const [country] = await getMyLocationJSON(`https://restcountries.com/v3.1/alpha/${countryCode.countryCode}`);
    if (!country) throw new Error('Country not found, try again!');
    renderMyLocation(country);
    latitudeInput.value = '';
    longitudeInput.value = '';
  } catch (err) {
    inputErrorText.textContent = `${err.message}`;
  }
});
btnMyLocation.addEventListener('click', async function () {
  try {
    resetCountryContainer();
    const location = await getLocalCoordinates();
    const { latitude: lat, longitude: lng } = location.coords;
    const countryCode = await getMyLocationJSON(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
    const [country] = await getMyLocationJSON(`https://restcountries.com/v3.1/alpha/${countryCode.countryCode}`);
    renderMyLocation(country);
  } catch (err) {
    inputErrorText.textContent = `${err.message}`;
  }
});
btnResetLocation.addEventListener('click', function () {
  resetCountryContainer();
  latitudeInput.value = '';
  longitudeInput.value = '';
  countryNameInput.value = '';
  setTimeout(function () {
    countryIcon.src = '';
  }, 1000);
});
btnRandomLocation.addEventListener('click', async function () {
  try {
    const lat = Math.floor(Math.random() * (90 - -90 + 1) + -90);
    const lng = Math.floor(Math.random() * (180 - -180 + 1) + -180);
    latitudeInput.value = lat;
    longitudeInput.value = lng;
    await checkCoordinates(lat, lng);
    countryContainer.style.opacity = 0;
  } catch (err) {
    inputErrorText.textContent = `${err.message}`;
  }
});
btnFindCountryByName.addEventListener('click', async function (e) {
  e.preventDefault();
  resetCountryContainer();
  try {
    const countryName = countryNameInput.value;
    const [country] = await getCountryJSON(`https://restcountries.com/v3.1/name/${countryName}?fullText=true`);
    renderMyLocation(country);
    countryNameInput.value = '';
  } catch (err) {
    inputErrorTextCountry.textContent = err.message;
  }
});
