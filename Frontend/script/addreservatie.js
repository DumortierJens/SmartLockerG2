let htmlSport;
let htmlStartHour;
let htmlStartMinute;
let htmlEnd;
let htmlConfirm;
let htmlDate;
let htmlStartTitle;
let htmlEndTitle;
let eventListenerExists = false;
let firstAction = "";
let busy_timestamps;
let currentlockerId;

function ListenToChangeDate() {
    htmlDate.addEventListener('change', function() {
        htmlStartHour.value = new Date().getHours();
        htmlEndHour.value = new Date().getHours();
        htmlStartMinute.value = 0;
        htmlEndMinute.value = 0;
        htmlStartTitle.style.color = "var(--blue-accent-color)";
        htmlEndTitle.style.color = "var(--blue-accent-color)";
        if (firstAction == "") {
            firstAction = "changedDate";
        }
        getReservations();
    });
}

function getBusyTimestamps(todaysReservations) {
    let dict_busy_timestamps = {};
    for (let i = 0; i < todaysReservations.length; i++) {
        let start = todaysReservations[i].slice(0, 8);
        let end = todaysReservations[i].slice(9, 17);
        let startHour = parseInt(start.slice(0, 2));
        let endHour = parseInt(end.slice(0, 2));
        let startMinute = parseInt(start.slice(3, 5));
        let endMinute = parseInt(end.slice(3, 5));
        // De uren zijn hetzelfde
        if (startHour == endHour) {
            if (!dict_busy_timestamps.hasOwnProperty(startHour)) {
                dict_busy_timestamps[startHour] = [];
            }
            for (let busyMinutes = startMinute; busyMinutes <= endMinute; busyMinutes++) {
                dict_busy_timestamps[startHour].push(busyMinutes);
            }
        } else {
            if (!dict_busy_timestamps.hasOwnProperty(startHour)) {
                dict_busy_timestamps[startHour] = [];
            }
            for (let busyMinutes = startMinute; busyMinutes <= 59; busyMinutes++) {
                dict_busy_timestamps[startHour].push(busyMinutes);
            }
            if (!dict_busy_timestamps.hasOwnProperty(endHour)) {
                dict_busy_timestamps[endHour] = [];
            }
            for (let busyMinutes = 0; busyMinutes <= endMinute; busyMinutes++) {
                dict_busy_timestamps[endHour].push(busyMinutes);
            }
        }
    }
    // Nu heb ik een array van alle tijdstippen die bezet zijn
    return dict_busy_timestamps;
}


function getTodaysReservations(jsonObject) {
    let arr_res_today = [];
    let chosenDateValue = htmlDate.value.toString();
    let chosenDate = new Date(chosenDateValue);
    for (let reservation of jsonObject) {
        let reservationStartDate = new Date(reservation.startTime);
        let reservationEndDate = new Date(reservation.endTime);
        if (chosenDate.toLocaleDateString() == reservationStartDate.toLocaleDateString()) {
            arr_res_today.push(reservationStartDate.toLocaleTimeString() + "-" + reservationEndDate.toLocaleTimeString());
        }
    }
    return arr_res_today;
}

function CheckIfValidReservation() { // Waarden die voorlopig ingevuld staan ophalen
    let startHour = parseInt(htmlStartHour.value);
    let startMinute = parseInt(htmlStartMinute.value);
    let endHour = parseInt(htmlEndHour.value);
    let endMinute = parseInt(htmlEndMinute.value);
    htmlEndTitle.style.color = 'var(--blue-accent-color)';
    htmlStartTitle.style.color = 'var(--blue-accent-color)';
    let hourNow = new Date().getHours();
    let minuteNow = new Date().getMinutes();
    let Day = new Date().getDate();
    let chosenDay = new Date(htmlDate.value).getDate();

    if (startHour < hourNow && Day == chosenDay) {
        console.log("starttijdstip ligt in het verleden");
        window.alert("Starttijdstip ligt in het verleden");
        htmlStartTitle.style.color = 'var(--red-verlopen)';
        return;
    }

    if (startHour == hourNow && startMinute < minuteNow && Day == chosenDay) {
        console.log("starttijdstip ligt in het verleden");
        window.alert("Starttijdstip ligt in het verleden");
        htmlStartTitle.style.color = 'var(--red-verlopen)';
        return;
    }
    if (startHour == endHour && startMinute > endMinute || startHour > endHour) {
        console.log("Eindtijdstip moet later liggen dan starttijdstip");
        window.alert("Eindtijdstip moet later liggen dan starttijdstip");
        htmlEndTitle.style.color = 'var(--red-verlopen)';
        return;
    }

    if (startHour == endHour && startMinute == endMinute) {
        console.log("Beide tijdstippen zijn hetzelfde");
        window.alert("Beide tijdstippen zijn hetzelfde");
        htmlEndTitle.style.color = 'var(--red-verlopen)';
        htmlStartTitle.style.color = 'var(--red-verlopen)';
        return;
    }

    // Kijken of het niet overlapt met een bestaande reservatie
    let inputString = `${addZero(htmlStartHour.value)
        }:${addZero(htmlStartMinute.value)
        }:00-${addZero(htmlEndHour.value)
        }:${addZero(htmlEndMinute.value)
        }:00`;
    let inputArray = [];
    inputArray.push(inputString);
    console.log("inputarray", inputArray);
    let new_busy_timestamps = getBusyTimestamps(inputArray);
    console.log("busy_timestamps", busy_timestamps);
    console.log("new_busy_timestamps", new_busy_timestamps);
    for (let key1 in busy_timestamps) {
        for (let key2 in new_busy_timestamps) {
            if (key1 == key2) {
                for (let minutes1 of busy_timestamps[key1]) {
                    for (let minutes2 of new_busy_timestamps[key2]) {
                        if (minutes1 == minutes2) {
                            console.log("Tijdstip overlapt met een bestaande reservatie");
                            window.alert("Tijdstip overlapt met een bestaande reservatie");
                            htmlEndTitle.style.color = 'var(--red-verlopen)';
                            htmlStartTitle.style.color = 'var(--red-verlopen)';
                            return;
                        }
                    }
                }
            }
        }
    }

    // Kijken of er niet wordt gestart voor de reservatie en geëindigd na de reservatie
    let startPoint = Object.keys(new_busy_timestamps)[0];
    let endPoint = Object.keys(new_busy_timestamps)[Object.keys(new_busy_timestamps).length - 1];
    console.log("startpoint ", startPoint, " endpoint ", endPoint);

    for (let reservationsHour in busy_timestamps) {
        if (startPoint < parseInt(reservationsHour) && endPoint > parseInt(reservationsHour)) {
            console.log("Tijdstip overlapt met een bestaande reservatie");
            window.alert("Tijdstip overlapt met een bestaande reservatie");
            return;
        }
    }

    // Kijken of een slot niet langer dan 90 minuten duurt
    let start = new Date("2022-01-01 " + inputString.slice(0, 8));
    let end = new Date("2022-01-01 " + inputString.slice(9, 18));
    var diff = Math.abs(end - start);
    var minutes = Math.floor((diff / 1000) / 60);
    if (minutes > 90) {
        console.log("Je kan slechts maximum 90 minuten reserveren !");
        window.alert("Je kan slechts maximum 90 minuten reserveren !");
        return;
    }
    console.log("Dit tijdstip is in orde, sla de reservatie op");
    let startTime = htmlDate.value + "T" + addZero(parseInt(htmlStartHour.value)) + ":" + addZero(parseInt(htmlStartMinute.value)) + ":00+01:00";
    let endTime = htmlDate.value + "T" + addZero(parseInt(htmlEndHour.value)) + ":" + addZero(parseInt(htmlEndMinute.value)) + ":00+01:00";
    const body = {

        "lockerId": `${currentlockerId}`,

        "startTime": startTime,

        "endTime": endTime
    };
    console.log(body);
    console.log("Wordt opgeslagen");
    handleData(`${APIURI}/reservations/users/me`, cbAddRegistration, null, 'POST', JSON.stringify(body), userToken);
}

function cbAddRegistration(){
    window.history.back()
}

function disableBusyHours(busy_timestamps) {
    for (const [key, value] of Object.entries(busy_timestamps)) {
        if (busy_timestamps[key].includes(0) && busy_timestamps[key].includes(10) && busy_timestamps[key].includes(20) && busy_timestamps[key].includes(30) && busy_timestamps[key].includes(40) && busy_timestamps[key].includes(50)) {
            for (let option of htmlStartHour) {
                let optionValue = parseInt(option.value);
                if (optionValue == key) {
                    option.disabled = true;
                }
            }
            for (let option of htmlEndHour) {
                let optionValue = parseInt(option.value);
                if (optionValue == key) {
                    option.disabled = true;
                }
            }
        }
    }
}

function setNewMinutes() {
    console.log("Change endhour");
    let chosenStartHour = parseInt(htmlStartHour.value);
    let chosenEndHour = parseInt(htmlEndHour.value);
    // Als er voor het gekozen uur bezette minuten zijn, disable ze dan:
    if (busy_timestamps[chosenStartHour]) {
        for (let option of htmlStartMinute) {
            let optionValue = parseInt(option.value);
            if (busy_timestamps[chosenStartHour].includes(optionValue)) {
                option.disabled = true;
            } else {
                option.disabled = false;
            }
        }
    }
    if(busy_timestamps[chosenEndHour]){
        for (let option of htmlEndMinute) {
            let optionValue = parseInt(option.value);
            if (busy_timestamps[chosenEndHour].includes(optionValue)) {
                option.disabled = true;
            } else {
                option.disabled = false;
            }
        }
    }
    if (new Date().getHours() == htmlStartHour.value && !busy_timestamps[chosenStartHour]) {
        for (let option of htmlStartMinute) {
            let optionValue = parseInt(option.value);
            if (optionValue <= new Date().getMinutes()) {
                option.disabled = true;
            }
        }
    } 
    else {
        for (let option of htmlStartMinute) {
            option.disabled = false;
        }
    }
    if (new Date().getHours() == htmlEndHour.value && !busy_timestamps[chosenEndHour]) {
        for (let option of htmlEndMinute) {
            let optionValue = parseInt(option.value);
            if (optionValue <= new Date().getMinutes()) {
                option.disabled = true;
            }
        }
    } 
    else {
        for (let option of htmlEndMinute) {
            option.disabled = false;
        }
    }
    // selecteer automatisch eerst beschikbare minuten
    $('.js-end-minute').children('option:enabled').eq(1).prop('selected', true);
    $('.js-start-minute').children('option:enabled').eq(0).prop('selected', true);
}

function disablePast() {
    for (let option of htmlStartHour) {
        let optionValue = parseInt(option.value);
        if (optionValue < new Date().getHours()) {
            option.disabled = true;
        }
        for (let option of htmlStartMinute) {
            let optionValue = parseInt(option.value);
            if (optionValue <= new Date().getMinutes()) {
                option.disabled = true;
            }
        }
        let disabled = $('.js-start-minute option:not(:enabled)');
        $('.js-start-hour').children('option:enabled').eq(0).prop('selected', true);
        $('.js-start-minute').children('option:enabled').eq(-0).prop('selected', true);
        // Als alle minute options zijn gedisabled, toon volgend uur
        if (disabled.length == 6 && parseInt(htmlStartHour.value) < 21) {
            $('.js-start-hour').children('option:enabled').eq(1).prop('selected', true);
            setNewMinutes();
        }
    }
    for (let option of htmlEndHour) {
        let optionValue = parseInt(option.value);
        if (optionValue < new Date().getHours()) {
            option.disabled = true;
        }
        for (let option of htmlEndMinute) {
            let optionValue = parseInt(option.value);
            if (optionValue <= new Date().getMinutes()) {
                option.disabled = true;
            }
        }
        let disabled = $('.js-end-minute option:not(:enabled)');
        $('.js-end-hour').children('option:enabled').eq(0).prop('selected', true);
        $('.js-end-minute').children('option:enabled').eq(1).prop('selected', true);
        // Als alle minute options zijn gedisabled, toon volgend uur
        if (disabled.length == 6 && parseInt(htmlStartHour.value) < 21) {
            $('.js-end-hour').children('option:enabled').eq(1).prop('selected', true);
            setNewMinutes();
        }
    }

    if(parseInt(htmlStartMinute.value) == 50 && htmlStartHour.value == htmlEndHour.value){
        htmlEndHour.value = parseInt(htmlEndHour.value)+1
        setNewMinutes()
    }
}

function SetReservationTime(jsonObject) {
    let todaysReservations = getTodaysReservations(jsonObject);
    console.log(todaysReservations);
    busy_timestamps = getBusyTimestamps(todaysReservations);
    console.log("busy_timestamps", busy_timestamps);
    disableBusyHours(busy_timestamps)
    disablePast();
    // Uren en minuten van in het verleden disabelen als je date == vandaag
    let date = new Date(htmlDate.value).getDate();
    htmlStartHour.value = new Date().getHours();
    htmlEndHour.value = new Date().getHours();
    // htmlStartHour.addEventListener('change', function() {
    //     let chosenStartHour = parseInt(htmlStartHour.value);
    //     // Als er voor het gekozen uur bezette minuten zijn, disable ze dan:
    //     if (busy_timestamps[chosenStartHour]) {
    //         for (let option of htmlStartMinute) {
    //             let optionValue = parseInt(option.value);
    //             if (busy_timestamps[chosenStartHour].includes(optionValue)) {
    //                 option.disabled = true;
    //             } else {
    //                 option.disabled = false;
    //             }
    //         }
    //     } else {
    //         for (let option of htmlStartMinute) {
    //             option.disabled = false;

    //         }
    //     }
    // });
    // htmlEndHour.addEventListener('change', function() {
    //     let chosenStartHour = parseInt(htmlEndHour.value);
    //     // Als er voor het gekozen uur bezette minuten zijn, disable ze dan:
    //     if (busy_timestamps[chosenStartHour]) {
    //         for (let option of htmlEndMinute) {
    //             let optionValue = parseInt(option.value);
    //             if (busy_timestamps[chosenStartHour].includes(optionValue)) {
    //                 option.disabled = true;
    //             } else {
    //                 option.disabled = false;
    //             }
    //         }
    //     } else {
    //         for (let option of htmlEndMinute) {
    //             option.disabled = false;
    //         }
    //     }
    // });
    htmlStartHour.addEventListener('change', setNewMinutes);
    htmlEndHour.addEventListener('change', setNewMinutes);
    ListenToChangeDate();
    ListenToConfirmRegistration();
}

function FillOptionsSelect() {
    for (let hour = 5; hour < 23; hour++) {
        htmlStartHour.innerHTML += `<option value="${hour}">${hour}</option>`;
        htmlEndHour.innerHTML += `<option value="${hour}">${hour}</option>`;

    }
    for (let minute = 0; minute < 60; minute += 10) {
        if (minute < 10) {
            htmlStartMinute.innerHTML += `<option value="${minute}">0${minute}</option>`;
            htmlEndMinute.innerHTML += `<option value="${minute}">0${minute}</option>`;
        } else {
            htmlStartMinute.innerHTML += `<option value="${minute}">${minute}</option>`;
            htmlEndMinute.innerHTML += `<option value="${minute}">${minute}</option>`;
        }

    }
}

const showLockerReservation = function(jsonObject) {
    htmlName.innerHTML = jsonObject.name;
    console.log(jsonObject);
    FillOptionsSelect();
    getReservations();
};

const getReservations = function() {
    handleData(`${APIURI}/reservations/lockers/${currentlockerId}`, SetReservationTime, null, 'GET', null, userToken);
};

function addZero(value) {
    if (value < 10) {
        return "0" + value;
    } else {
        return value;
    }
}

function ListenToConfirmRegistration() {
    if (!eventListenerExists && firstAction != 'changedDate') {
        htmlConfirm.addEventListener('click', function() {
            eventListenerExists = true;
            CheckIfValidReservation();
        });
    }
}

const getLockerReservation = function() {
    handleData(`${APIURI}/lockers/${currentlockerId}`, showLockerReservation, null, 'GET', null, userToken);
};

document.addEventListener('DOMContentLoaded', function() {
    htmlName = document.querySelector('.js-name');
    htmlStartHour = document.querySelector('.js-start-hour');
    htmlStartMinute = document.querySelector('.js-start-minute');
    htmlEndHour = document.querySelector('.js-end-hour');
    htmlEndMinute = document.querySelector('.js-end-minute');
    htmlConfirm = document.querySelector('.js-addreg_confirm');
    htmlDate = document.querySelector('.js-addreg_date');
    htmlStartTitle = document.querySelector('.js-start-title');
    htmlEndTitle = document.querySelector('.js-end-title');
    let todayDate = new Date();
    htmlDate.value = todayDate.getFullYear() + "-" + todayDate.getMonth() + 1 + "-" + todayDate.getDate();
    htmlDate.setAttribute("min", todayDate.getFullYear() + "-" + todayDate.getMonth() + 1 + "-" + todayDate.getDate());
    if (userTokenPayload.role == "Admin") showHamburger();
    const urlParams = new URLSearchParams(window.location.search);
    currentlockerId = urlParams.get('lockerId');
    getLockerReservation(); // later nog met id meesturen

});