////////////////////////////////////// display panels ///////////////////////////////////////////////////////
const tabs = document.querySelector('.tabs');
const tabButtons = tabs.querySelectorAll('[role="tab"]');
const tabPanels = Array.from(tabs.querySelectorAll('[role="tabpanel"]'));

function handleTabClick(event) {
  // hide all tab panels
  tabPanels.forEach(panel => {
    panel.hidden = true;
  });
  // mark all tabs as unselected
  tabButtons.forEach(tab => {
    tab.setAttribute('aria-selected', false);
  });
  // mark the clicked tab as selected
  event.currentTarget.setAttribute('aria-selected', true);
  // find the associated tabPanel and show it!
  const { id } = event.currentTarget;

  /*
    METHOD 1
  const tabPanel = tabs.querySelector(`[aria-labelledby="${id}"]`);
  tabPanel.hidden = false;
  */

  // METHOD 2 - find in the array of tabPanels
  const tabPanel = tabPanels.find(
    panel => panel.getAttribute('aria-labelledby') === id
  );
  tabPanel.hidden = false;
}

tabButtons.forEach(button => button.addEventListener('click', handleTabClick));


////////////////////////////////// initialize data /////////////////////////////////////////////////////////

const continents = ['Asia', 'Europe', 'Africa', 'Americas'];
let ContsArr = [];
let dataContsArr = [ world = [], asia = [], europe = [], africa = [], america = []];


async function init() {
  let canvasClass, i;
  for (let i =0; i< continents.length;i++) {
    await createContsArr(continents[i]);
  }
  await addWorldArr();
  console.log(ContsArr);
  await createDataContsArr();
  

  for( i=0;i<dataContsArr.length;i++){
    switch(i){
      case 0:
        canvasClass = document.querySelector('.world');
        createCountries('worldCountries',i);
        break;
      case 1:
        canvasClass = document.querySelector('.asia');
        createCountries('asiaCountries',i);
        break;
      case 2:
        canvasClass = document.querySelector('.europe');
        createCountries('europeCountries',i);
        break;
      case 3:
        canvasClass = document.querySelector('.africa');
        createCountries('africaCountries',i);
        break;
      case 4:
        canvasClass = document.querySelector('.america');
        createCountries('americaCountries',i);
        break;
      case 5:
        canvasClass = document.querySelector('.australia');
        break;
    }
    displayGraph(canvasClass, i, 'confirmed');
  } 

  addTypeEvents();
  // addCountryEvents();
  console.log('done');
}
init();



async function createContsArr(continent) {
  // const baseEndpoint = `https://cors-anywhere.herokuapp.com/restcountries.herokuapp.com/api/v1/region/${continent}`;
  const baseEndpoint = `https://restcountries.herokuapp.com/api/v1/region/${continent}`;
  const res = await fetch(`${baseEndpoint}`);
  const data = await res.json();
  ContsArr.push(data);
}

async function infoApi(code) {
  const baseUrl = `https://corona-api.com/countries/${code}`;
  const res = await fetch(`${baseUrl}`);
  const data = await res.json();
  return data;
}

async function addWorldArr() {
  const baseUrl = `https://corona-api.com/countries`;
  const res = await fetch(`${baseUrl}`);
  const data = await res.json();
  ContsArr.unshift(data.data);
}

async function createDataContsArr() {
  let data;
  for (let i = 0; i < ContsArr.length; i++) {  
    for (let j = 0; j < ContsArr[i].length; j++) {
        if (ContsArr[i][j].cca2 === 'XK') {
            continue;
        }
        if (i === 0){
            data = await infoApi(ContsArr[i][j].code);
        }else{
            data = await infoApi(ContsArr[i][j].cca2);
        }        
        let objData = {};
        objData.name = data['data']['name'];
        objData.confirmed = data['data']['latest_data']['confirmed'];
        objData.critical = data['data']['latest_data']['critical'];
        objData.deaths = data['data']['latest_data']['deaths'];
        objData.recovered = data['data']['latest_data']['recovered'];
       
        dataContsArr[i].push(objData);
    }
  }
  dataContsArr.push(dataContsArr[0][10]); //adding Australia

  console.log(dataContsArr);
}


function createCountries(countries,i){
  let countriesDiv = document.querySelector(`.${countries}`);
  for(let j=0; j< dataContsArr[i].length; j++){
    let button = document.createElement('button');
    button.textContent = dataContsArr[i][j].name;
    button.classList.add('country');
    countriesDiv.appendChild(button);
  }
}



function displayGraph(canvasClass, i, type){
  let ctx = canvasClass.getContext('2d'); 
  let labels = [], data = [];

  // console.log('data',i,dataContsArr[i]);
  // console.log(dataContsArr[i].length);

  for(let k=0; k< dataContsArr[i].length;k++){
    labels.push(dataContsArr[i][k].name);
    data.push(dataContsArr[i][k][`${type}`]);
  }

  if (i=== 5){  // in case of Australia: one element in the array
    labels = dataContsArr[i].name;
    data = dataContsArr[i][`${type}`];
    // displayCountry();
    return;
  }

  let chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'bar',

    // The data for our dataset
    data: {
        labels: labels,
        datasets: [{
            label: 'confirmed',
            backgroundColor: '#674FBC',
            borderColor: '#674FBC',
            data: data
        }]
    },

    options: {
        responsive: true,
        animation: {
          animateRotate: false,
          animateScale: true
        },
        legend:{
          display: true,
          labels:{
            fontColor: '#674FBC'
          }
        }
    }
  });

}

function addTypeEvents(){
  document.querySelectorAll('.infoTypeBtn').forEach(el => el.addEventListener('click',function(e){
    canvasClass = e.currentTarget.parentElement.previousElementSibling.lastElementChild.classList[0];
    
    
    // console.log(e.currentTarget.parentElement.previousElementSibling.lastElementChild.classList[0]);
  }));
}