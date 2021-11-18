import { convertDate } from "./utils";

import 'regenerator-runtime/runtime';
import axios from 'axios';
import cloudy from '../img/cloudy.png'
import rain from '../img/rain.png'
import snow from '../img/snow.png'
import sunny from '../img/sunny.png'

//Constants
const BASELOACTIONURL = 'https://se-weather-api.herokuapp.com/api/v1/geo';
const BASEFORCASTURL = 'https://se-weather-api.herokuapp.com/api/v1/forecast';

const weekday = new Array(7);
weekday[0] = "Sunday";
weekday[1] = "Monday";
weekday[2] = "Tuesday";
weekday[3] = "Wednesday";
weekday[4] = "Thursday";
weekday[5] = "Friday";
weekday[6] = "Saturday";

//When Page loads go fetch our data from the apis
window.addEventListener('load', fetchLocation());

async function fetchLocation(){
    /*
    Function fetches location data for zip code given
    NOTE: Right now this is hard coded to Provo, UT as that is where I live, but this could easily be changed to work for any zip code by
    adding an input box on the main screen for users to input thier own zip code
    */
    try{
        const loactionResponse = await axios.get(`${BASELOACTIONURL}?zip_code=84606`)
        console.log(loactionResponse.data)
        fetchForcast(loactionResponse.data)
    }
    catch(err){
        console.log(err)
    }
}

async function fetchForcast(locationData){
    /*
    Function fetches forcast for the given location data and the current day
    */
    try{
        const date = new Date()
        const forcastResponse = await axios.get(`${BASEFORCASTURL}?latitude=${locationData.latitude}&longitude=${locationData.longitude}&date=${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`)
        console.log(forcastResponse.data)
        bodyLoaded(locationData, forcastResponse.data)
    }   
    catch(err){
        console.log(err)
    }
}

function getDayOfWeek(date){
    /*
    Function return the day of the week for display. Uses the weekday constant array to change number of week to name of week. Returns Today if the day is the current day.
    */
    const d = new Date(convertDate(date))
    const today = new Date()

    if(d.getDay() === today.getDay()){
        return "Today:"
    }
    else{
        return `${weekday[d.getDay()]}:`
    }
}

function getImage(img){
    /*
    Function takes in the icon name from the forcast data and returns the correct image to be displayed
    */

    let image
    switch(img){
        case 'cloudy':
            image = cloudy
            break;
        case 'rain':
            image = rain
            break;
        case 'snow': 
            image = snow
            break;
        case 'sunny':
            image = sunny
            break;
        default:
            image = sunny
            break;
        
    }

    return image
}

function bodyLoaded(locationData, forcastData){
    /*
    Function handles dynamically filling in HTML component with api data
    NOTE: A future optimization that could be made to make this application more dynamic would be to dynamically render the forcast html components 
    in this function for each day. That would then make it easier to display a 5 day forcast or a 4 day forcast and could even allow the user to possibly select
    how many days they would like in the forcast.
    */

    //Fill header with correct name of location
    document.getElementById('title').innerText = `WEATHER FORCAST FOR ${locationData.city.toUpperCase()}, ${locationData.regionCode.toUpperCase()}`


    //Fill in the next 3 days of forcast info
    for(let i = 0; i < 3; i++){
        let forcastNum = `forcast${i+1}`
        
        //Add Day
        document.getElementById(`${forcastNum}Header`).innerText = getDayOfWeek(forcastData.daily.data[i].time)
        
        //Add image
        let img = document.createElement("img")
        img.id = `${forcastNum}Image`
        img.src = getImage(forcastData.daily.data[i].icon)
        img.alt = forcastData.daily.data[i].icon

        var iconDiv = document.getElementById(`${forcastNum}Icon`)
        iconDiv.appendChild(img);

        //Add summary
        document.getElementById(`${forcastNum}Forcast`).innerText = forcastData.daily.data[i].summary

        //Add High and Low
        document.getElementById(`${forcastNum}TempHigh`).innerText = `${Math.round(forcastData.daily.data[i].temperatureHigh)}\xB0 F `
        document.getElementById(`${forcastNum}TempLow`).innerText = `/ ${Math.round(forcastData.daily.data[i].temperatureLow)}\xB0 F`
    }
}
