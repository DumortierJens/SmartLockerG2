'use strict';

let htmlStatus, htmlDescription, htmlSport, htmlId, htmlName;

const showLocker = function (jsonObject) {
    console.log(jsonObject);
    for (var i of jsonObject) {
        htmlStatus = i['status']
        htmlDescription = i['description']
        htmlSport = i['sport']
        htmlId = i["id"]
        htmlName = i["name"]
    }
    console.log(htmlStatus, htmlDescription, htmlSport, htmlId, htmlName)
};

const start = function () {
    handleData(`https://smartlockerfunctions.azurewebsites.net/api/lockers`, showLocker);
};

document.addEventListener('DOMContentLoaded', function () {
    console.info('DOM geladen');
    start();
});