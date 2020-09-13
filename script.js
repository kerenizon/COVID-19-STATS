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
let dataContsArr = {world: [], asia: [], europe: [], africa: [], america: []};
let countries = {};


async function init() {
  let canvasClass, i;
  for (let i =0; i< continents.length;i++) {
    await createContsArr(continents[i]);
    console.log(Object.keys(dataContsArr)[i]);
  }
  await addWorldArr();
  console.log(ContsArr);
  await createDataContsArr();
  createCountries();
  for(let i=0;i<Object.keys(dataContsArr).length;i++){ 
    let canvasClass = document.querySelector(`.${Object.keys(dataContsArr)[i]}`);
    console.log(canvasClass);
    displayGraph(canvasClass,'confirmed',Object.keys(dataContsArr)[i]);
  }
  
  addTypeEvents();
  addCountryEvents();
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

        let obj = {};
        obj.totalCases = data['data']['latest_data']['confirmed'];
        obj.newCases = data['data']['today']['confirmed'];
        obj.totalDeaths = data['data']['latest_data']['deaths'];
        obj.newDeaths = data['data']['today']['deaths'];
        obj.totalRecovered = data['data']['latest_data']['recovered'];
        obj.critical = data['data']['latest_data']['critical'];

        countries[`${data['data']['name']}`] = obj;
       
        dataContsArr[Object.keys(dataContsArr)[i]].push(objData);
    }
  }
  dataContsArr.australia = dataContsArr.world[10]; //adding Australia

}


function createCountries(){
  console.log(Object.keys(dataContsArr));
  for(let i=0;i < Object.keys(dataContsArr).length; i++){
    countriesDiv = (document.querySelector(`.${Object.keys(dataContsArr)[i]}Countries`));
    for(let j=0; j<dataContsArr[Object.keys(dataContsArr)[i]].length;j++){
      let button = document.createElement('button');
      // button.textContent = dataContsArr[i][j].name;
      button.textContent = dataContsArr[Object.keys(dataContsArr)[i]][j].name;
      button.classList.add('country');
      countriesDiv.appendChild(button);
    }
  }
}



function displayGraph(canvasClass,type,region){
    let labels = [], data = [], ctx;  
    ctx = canvasClass.getContext('2d');
    console.log(region); 
    if(region === 'australia'){
      displayDoughnut(canvasClass,'Australia');
      return;
    }
    for(let k=0; k < dataContsArr[region].length; k++){
      labels.push(dataContsArr[region][k].name);
      data.push(dataContsArr[region][k][`${type}`]);
    }
    let chart = new Chart(ctx, {
      // The type of chart we want to create
      type: 'bar',
  
      // The data for our dataset
      data: {
          labels: labels,
          datasets: [{
              label: type,
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

function displayDoughnut(canvasClass,country){
  let labels = [], data = [], ctx;  
    ctx = canvasClass.getContext('2d'); 
    for(let k=0; k < Object.keys(countries[`${country}`]).length; k++){
      console.log(Object.keys(countries[`${country}`])[k]);
      labels.push(Object.keys(countries[`${country}`])[k]);
      data.push(countries[`${country}`][Object.keys(countries[`${country}`])[k]]);
    }
    console.log(data);
    let chart = new Chart(ctx, {
      // The type of chart we want to create
      type: 'doughnut',
  
      // The data for our dataset
      data: {
          labels: labels,
          datasets: [{
              label: 'cases',
              data: data,
              backgroundColor: [
                '#36A2EB',
                '#b0cbdd',
                '#FF6384',
                '#bd98a0',
                '#5e923f',
                '#FFCD56'
              ],
              borderColor: [
                '#36A2EB',
                '#b0cbdd',
                '#FF6384',
                '#bd98a0',
                '#5e923f',
                '#FFCD56'
              ],
              borderWidth: 1
          }]
      },
  
      options: {
          responsive: false,
          legend : {
            display: true,
        }
      }
    });  
}

function addTypeEvents(){
  document.querySelectorAll('.infoTypeBtn').forEach(el => el.addEventListener('click',function(e){
    let region = e.currentTarget.parentElement.previousElementSibling.lastElementChild.classList[0];
    let type = e.currentTarget.classList[1];
    let canvasClass = document.querySelector(`.${region}`);
    displayGraph(canvasClass,type,region);
  }));
}

function addCountryEvents(){
  document.querySelectorAll('.country').forEach(el => el.addEventListener('click',function(e){
    let country = e.currentTarget.textContent;
    let canvasClass = e.currentTarget.parentElement.previousElementSibling.lastElementChild;
    displayDoughnut(canvasClass,country);
  }));
}