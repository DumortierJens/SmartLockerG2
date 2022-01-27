let currentLockerID;
let registrationStarted = false;
let userToken;

// #region Overview

const showLockers = function(lockers) {
    console.log(lockers);

    let htmlString = ``;
    for (const locker of lockers) {
        let statusClass = '';
        if (locker.status == 'Beschikbaar')
            statusClass = 'svg-avaible';
        else if (locker.status == 'Bezet')
            statusClass = 'svg-unavaible';
        else if (locker.status == 'Buiten gebruik')
            statusClass = 'svg-outofuse';


        htmlString += `<g class="js-locker cursor_pointer" data-id="${
            locker.id
        }" transform="translate(${
            locker.iconLocation
        })">
            <g class="${statusClass}">
                <circle cx="18" cy="18" r="18" />
            </g>
            <g style="fill: url(#${locker.sport.toLowerCase()
            })" transform="translate(6 6)">
                <circle cx="12" cy="12" r="12" />
            </g>
        </g>`;
    }

    document.querySelector('.js-overview').innerHTML += htmlString;
    listenToLockerIcon();
};

const listenToLockerIcon = function() {
    const lockers = document.querySelectorAll('.js-locker');

    for (const locker of lockers) {
        locker.addEventListener('click', function () {
            window.location.href = `${
                location.origin
            }/locker${WEBEXTENTION}?lockerId=${
                this.dataset.id
            }`;
        });
    }
};

const getLockersOverview = function() {
    handleData(`${APIURI}/lockers`, showLockers, null, 'GET', null, userToken);
};

// #endregion

// #region Locker Detail

let htmlPopup,
    htmlPopUpOpen,
    htmlPopUpEndTimePicker,
    htmlEndHourEndTimePicker,
    htmlEndMinuteEndTimepicker,
    htmlPopUpCancel,
    htmlPopupMessage;
let htmlBackground,
    htmlStartRegistration,
    eventListenerExistsEndTimePicker,
    busy_timestamps_endTimePicker,
    htmlLockerSvg;

let ws = new WebSocket('wss://smartlocker.webpubsub.azure.com/client/hubs/SmartLockerHub');
ws.onmessage = (event) => {
    console.log(event.data.json());
    const data = JSON.parse(event.data);
    if (data.device.lockerId == currentLockerID && data.log.deviceId == "fc5a0661-20fc-4eb1-95d7-e27e19f211df" && data.log.value == 1) {
        console.log('test');
        htmlLockerSvg.innerHTML = getSvg('locker close');
    }
};

const showLockerDetail = function(locker) {
    console.log(locker);
    eventListenerExistsEndTimePicker = false;
    const htmlLockerTitle = document.querySelector('.js-locker-name');
    const htmlLockerDescription = document.querySelector('.js-locker-description');
    const htmlLockerStatus = document.querySelector('.js-locker-status');
    const htmlLockerInstructions = document.querySelector('.js-locker-instructions');
    const htmlLockerSvg = document.querySelector('.js-locker-svg');
    const htmlLockerReservate = document.querySelector('.js-locker-reservate');
    const htmlLockerPopupMessage = document.querySelector('.js-popup-message');
    htmlPopUpEndTimePicker = document.querySelector('.js-popup-endtimepicker');
    htmlEndHourEndTimePicker = document.querySelector('.js-end-hour-endtimepicker');
    htmlEndMinuteEndTimepicker = document.querySelector('.js-end-minute-endtimepicker');
    htmlStartRegistration = document.querySelector('.js-start-reg-btn');

    htmlLockerTitle.innerHTML = locker.name;
    htmlLockerDescription.innerHTML = locker.description;
    htmlLockerStatus.innerHTML = locker.status;

    if (locker.status == 'Beschikbaar' || registrationStarted) {
        htmlLockerInstructions.innerHTML = 'Tik op het slot om de locker te openen';
        htmlLockerStatus.classList.add('locker_detail_content_status_color_available');
        listenToLockerReservate(locker.id);

        // checken of registratie al gestart is van deze gebruiker
        // ==>ja: toon een button die de registratie kan afsluiten (onder het lock), als je hier op drukt komt er een pop up waar je een opmerking in kan toevoegen
        //        en je kan nog steeds de locker openen zolang de registratie bezig is
        // ==>nee: je kan de registratie starten door de locker te openen
        // reserveren van de locker kan je altijd
        if (registrationStarted) {
            htmlLockerStatus.innerHTML = 'Bezig';
            listenToClickToggleLocker(locker.id);
            htmlLockerPopupMessage.innerHTML = "Wil je de locker opnieuw openen?";
        } else {
            listenToClickToggleLockerEndTimePicker(locker.id);
            htmlLockerPopupMessage.innerHTML = "Je staat op het punt de registratie te starten. Kies een eindtijdstip";
            // listener van de registratie afsluit knop
            // andere htmlpopup met keuzemenu of alles in orde is
        }
    } else if (locker.status == 'Bezet') {
        htmlLockerInstructions.innerHTML = 'Deze locker is momenteel in gebruik';
        htmlLockerStatus.classList.add('locker_detail_content_status_color_unavailable');
        htmlLockerSvg.classList.add('locker_detail_content_toggleSvg_outofuse');
        listenToLockerReservate(locker.id);
    } else if (locker.status == 'Buiten gebruik') {
        htmlLockerInstructions.innerHTML = 'Deze locker is momenteel buiten gebruik';
        htmlLockerStatus.classList.add('locker_detail_content_status_color_outofuse');
        htmlLockerSvg.classList.add('locker_detail_content_toggleSvg_outofuse');
        htmlLockerReservate.style = 'display:none';
    }
};

function listenToClickToggleLocker(lockerId) {
    htmlLockerSvg.addEventListener('click', function() {
        htmlPopUp.style = 'display:block';
        htmlPopUp.style.animation = 'fadein 0.5s';
        htmlBackground.style = 'filter: blur(8px);';
        listenToOpenLockerPopupContinue(lockerId);
        listenToOpenLockerPopupCancel();
    });
}

function getTodaysReservationsEndTimePicker(jsonObject) {
    let arr_res_today = [];
    for (let reservation of jsonObject) {
        let reservationStartDate = new Date(reservation.startTime);
        let reservationEndDate = new Date(reservation.endTime);
        if (new Date().toLocaleDateString() == reservationStartDate.toLocaleDateString()) {
            arr_res_today.push(reservationStartDate.toLocaleTimeString() + "-" + reservationEndDate.toLocaleTimeString());
        }
    }
    return arr_res_today;
}

function getBusyTimestamps(todaysReservations) {
    let dict_busy_timestamps = {};
    for (let i = 0; i < todaysReservations.length; i++) {
        let start = todaysReservations[i].slice(0, 8)
        let end = todaysReservations[i].slice(9, 17)
        let startHour = parseInt(start.slice(0, 2))
        let endHour = parseInt(end.slice(0, 2))
        let startMinute = parseInt(start.slice(3, 5))
        let endMinute = parseInt(end.slice(3, 5))
        // De uren zijn hetzelfde
        if (startHour == endHour) {
            if (! dict_busy_timestamps.hasOwnProperty(startHour)) {
                dict_busy_timestamps[startHour] = []
            }
            for (let busyMinutes = startMinute; busyMinutes <= endMinute; busyMinutes++) {
                dict_busy_timestamps[startHour].push(busyMinutes);
            }
        } else {
            if (! dict_busy_timestamps.hasOwnProperty(startHour)) {
                dict_busy_timestamps[startHour] = []
            }
            for (let busyMinutes = startMinute; busyMinutes <= 59; busyMinutes++) {
                dict_busy_timestamps[startHour].push(busyMinutes);
            }
            if (! dict_busy_timestamps.hasOwnProperty(endHour)) {
                dict_busy_timestamps[endHour] = []
            }
            for (let busyMinutes = 0; busyMinutes <= endMinute; busyMinutes++) {
                dict_busy_timestamps[endHour].push(busyMinutes);
            }
        }
    }
    // Nu heb ik een array van alle tijdstippen die bezet zijn
    return dict_busy_timestamps;
}

function disablePast() {
    for (let option of htmlEndHourEndTimePicker) {
        let optionValue = parseInt(option.value);
        if (optionValue < new Date().getHours()) {
            option.disabled = true;
        }
        for (let option of htmlEndMinuteEndTimepicker) {
            let optionValue = parseInt(option.value);
            if (optionValue <= new Date().getMinutes()) {
                option.disabled = true;
            }
        }
        let disabled = $('.js-end-minute-endtimepicker option:not(:enabled)');
        $('.js-end-hour-endtimepicker').children('option:enabled').eq(0).prop('selected', true);
        $('.js-end-minute-endtimepicker').children('option:enabled').eq(-0).prop('selected', true);
        // Als alle minute options zijn gedisabled, toon volgend uur
        if (disabled.length == 6 && parseInt(htmlEndHourEndTimePicker.value) < 21) {
            $('.js-end-hour-endtimepicker').children('option:enabled').eq(1).prop('selected', true);
            setNewMinutes();
        }
    }
}

function setNewMinutes() {
    console.log("Change endhour");
    let chosenHour = parseInt(htmlEndHourEndTimePicker.value);
    // Als er voor het gekozen uur bezette minuten zijn, disable ze dan:
    if (busy_timestamps_endTimePicker[chosenHour]) {
        for (let option of htmlEndMinuteEndTimepicker) {
            let optionValue = parseInt(option.value);
            if (busy_timestamps_endTimePicker[chosenHour].includes(optionValue)) {
                option.disabled = true;
            } else {
                option.disabled = false;
            }
        }
    } else if (new Date().getHours() == htmlEndHourEndTimePicker.value) {
        for (let option of htmlEndMinuteEndTimepicker) {
            let optionValue = parseInt(option.value);
            if (optionValue <= new Date().getMinutes()) {
                option.disabled = true;
            }
        }
    } else {
        for (let option of htmlEndMinuteEndTimepicker) {
            option.disabled = false;
        }
    }

    // selecteer automatisch eerst beschikbare minuten
    $('.js-end-minute-endtimepicker').children('option:enabled').eq(0).prop('selected', true);
}

function disableBusyHours(busy_timestamps_endTimePicker) {
    for (const [key, value] of Object.entries(busy_timestamps_endTimePicker)) {
        if (busy_timestamps_endTimePicker[key].includes(0) && busy_timestamps_endTimePicker[key].includes(10) && busy_timestamps_endTimePicker[key].includes(20) && busy_timestamps_endTimePicker[key].includes(30) && busy_timestamps_endTimePicker[key].includes(40) && busy_timestamps_endTimePicker[key].includes(50)) {
            for (let option of htmlEndHourEndTimePicker) {
                let optionValue = parseInt(option.value);
                if (optionValue == key) {
                    option.disabled = true;
                }
            }
        }
    }
}

function addZero(value) {
    if (value < 10) {
        return "0" + value;
    } else {
        return value;
    }
}

function CheckIfValidReservationEndTimePicker() { // Waarden die voorlopig ingevuld staan ophalen
    let startHour = new Date().getHours();
    console.log("Startuur", startHour);
    let startMinute = new Date().getMinutes();
    console.log("Startminuut", startMinute);
    let endHour = parseInt(htmlEndHourEndTimePicker.value);
    let endMinute = parseInt(htmlEndMinuteEndTimepicker.value);
    let hourNow = new Date().getHours();
    let minuteNow = new Date().getMinutes();
    let Day = new Date().getDate();
    let chosenDay = new Date().getDate();

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
    let inputString = `${addZero(new Date().getHours())
        }:${addZero(new Date().getMinutes())
        }:00-${addZero(htmlEndHourEndTimePicker.value)
        }:${addZero(htmlEndMinuteEndTimepicker.value)
        }:00`;
    let inputArray = [];
    inputArray.push(inputString);
    console.log("inputarray", inputArray);
    let new_busy_timestamps = getBusyTimestamps(inputArray);
    console.log("busy_timestamps", busy_timestamps_endTimePicker);
    console.log("new_busy_timestamps", new_busy_timestamps);
    for (let key1 in busy_timestamps_endTimePicker) {
        for (let key2 in new_busy_timestamps) {
            if (key1 == key2) {
                for (let minutes1 of busy_timestamps_endTimePicker[key1]) {
                    for (let minutes2 of new_busy_timestamps[key2]) {
                        if (minutes1 == minutes2) {
                            console.log("Tijdstip overlapt met een bestaande reservatie");
                            window.alert("Tijdstip overlapt met een bestaande reservatie");
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

    for (let reservationsHour in busy_timestamps_endTimePicker) {
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
    let todayString = new Date().getFullYear() + "-" + addZero((parseInt(new Date().getMonth()) + 1).toString()) + "-" + addZero(new Date().getDate());
    let startTime = todayString + "T" + addZero(new Date().getHours()) + ":" + addZero(new Date().getMinutes()) + ":00+01:00";
    let endTime = todayString + "T" + addZero(parseInt(htmlEndHourEndTimePicker.value)) + ":" + addZero(parseInt(htmlEndMinuteEndTimepicker.value)) + ":00+01:00";
    const body = {

        "lockerId": "11cf21d4-03ef-4e0a-8a17-27c26ae80abd",

        "startTime": startTime,

        "endTime": endTime
    };
    console.log(body);
    console.log("Wordt opgeslagen");
    handleData(`${APIURI}/reservations/users/me`, null, null, 'POST', JSON.stringify(body), userToken);
}

function ListenToConfirmRegistrationEndTimePicker() {
    if (! eventListenerExistsEndTimePicker) {
        htmlStartRegistration.addEventListener('click', function () {
            eventListenerExistsEndTimePicker = true;
            CheckIfValidReservationEndTimePicker();
        });
    }
}

function setReservationEndTimePicker(jsonObject) {
    let todaysReservations = getTodaysReservationsEndTimePicker(jsonObject);
    console.log(todaysReservations);
    busy_timestamps_endTimePicker = getBusyTimestamps(todaysReservations);
    console.log("busy_timestamps", busy_timestamps_endTimePicker);
    disableBusyHours(busy_timestamps_endTimePicker);
    disablePast();
    htmlEndHourEndTimePicker.addEventListener('change', setNewMinutes);
    ListenToConfirmRegistrationEndTimePicker();
}

const getReservationsEndTimePicker = function() {
    handleData(`${APIURI}/reservations/lockers/11cf21d4-03ef-4e0a-8a17-27c26ae80abd`, setReservationEndTimePicker, null, 'GET', null, userToken);
};

function fillOptionsSelectEndTimePicker() {
    for (let hour = 5; hour < 23; hour++) {
        htmlEndHourEndTimePicker.innerHTML += `<option value="${hour}">${hour}</option>`;

    }
    for (let minute = 0; minute < 60; minute += 10) {
        if (minute < 10) {
            htmlEndMinuteEndTimepicker.innerHTML += `<option value="${minute}">0${minute}</option>`;
        } else {
            htmlEndMinuteEndTimepicker.innerHTML += `<option value="${minute}">${minute}</option>`;
        }

    }
}

function DisplayNoneEndTimePicker() {
    htmlPopUpEndTimePicker.style = "display: none";
}

function listenToClickCancelEndTimePicker() {
    let htmlTerug = document.querySelector('.js-cancel-reg-btn')
    htmlTerug.addEventListener('click', function () {
        htmlBackground.style = '';
        htmlPopUpEndTimePicker.style.animation = "fadeout 0.3s";
        setTimeout(DisplayNoneEndTimePicker, 300);
    });
}

function listenToClickToggleLockerEndTimePicker(lockerid) {
    htmlLockerSvg.addEventListener('click', function() {
        htmlBackground.style = 'filter: blur(8px);';
        console.log("Timepicker verschijnt");
        htmlPopUpEndTimePicker.style = "display: block;";
        htmlPopUpEndTimePicker.style.animation = "fadein 0.3s";
        fillOptionsSelectEndTimePicker();
        getReservationsEndTimePicker();
        listenToClickCancelEndTimePicker();
    });
}

function listenToOpenLockerPopupContinue(lockerId) {
    htmlPopUpOpen.addEventListener('click', function() {
        setTimeout(DisplayNone, 300);
        const endTimeReservation = new Date();
        endTimeReservation.setMinutes(endTimeReservation.getMinutes() + 60);
        handleData(`${APIURI}/registrations/start`, callbackOpenLocker, null, 'POST', JSON.stringify({ lockerId, endTimeReservation }), userToken);
    });
}

function callbackOpenLocker(registration) {
    console.log("Open locker");
    htmlBackground.style = '';
    htmlLockerSvg.innerHTML = getSvg('locker open');
    document.querySelector('.js-locker-instructions').innerHTML = 'Vergeet de locker niet manueel te sluiten';
    htmlPopUp.style.animation = 'fadeout 0.3s';
    handleData(`${APIURI}/lockers/${registration.lockerId
        }/open`, null, null, 'POST', null, userToken);
}

function listenToOpenLockerPopupCancel() {
    htmlPopUpCancel.addEventListener('click', function() {
        htmlPopUp.style.animation = 'fadeout 0.3s';
        htmlBackground.style = '';
        setTimeout(DisplayNone, 300);
    });
}

function DisplayNone() {
    htmlPopUp.style = 'display: none;';
}

function listenToLockerReservate(lockerId) {
    document.querySelector('.js-locker-reservate').addEventListener('click', function () {
        window.location.href = `${
            location.origin
        }/reservatie_toevoegen${WEBEXTENTION}?lockerId=${lockerId}`;
    });
}

const getLockerDetail = function(lockerId) {
    handleData(`${APIURI}/lockers/${lockerId}`, showLockerDetail, null, 'GET', null, userToken);
};

// #endregion

// #region Profile Page

const showUserProfile = function(user) {
    console.log(user);

    document.querySelector(".js-profile-picture").src = user.picture;
    document.querySelector(".js-name").innerHTML = user.name;
    document.querySelector(".js-email").innerHTML = user.email;
    document.querySelector(".js-created").innerHTML = new Date(user.userCreated).toLocaleDateString("nl-BE");

    ListenToUserLogout();
    ListenToUserReservations();
};

function ListenToUserLogout() {
    document.querySelector('.js-logout').addEventListener('click', function() {
        console.log("popup om te bevestigen, Afmelden van zichzelf via usertoken en ga naar index.html");
        sessionStorage.removeItem('usertoken');
        window.location.reload();
    });
}

function ListenToUserReservations() {
    document.querySelector('.js-reservations').addEventListener('click', function () {
        window.location.href = `${
            location.origin
        }/profielreservatie${WEBEXTENTION}`;
        console.log('Ga naar profielreservatie.html en toont reservaties van zichzelf via usertoken');
    });
}

const getUserProfile = function() {
    handleData(`${APIURI}/users/me`, showUserProfile, null, 'GET', null, userToken);
};

// #endregion

// #region Navigation

let htmlBackButton,
    htmlProfileButton;

function listenToBackBtn() {
    htmlBackButton.addEventListener('click', function() {
        window.history.back();
    });
}

function listenToMenuBtn() {
    htmlMenuButton.addEventListener('click', function() {
        window.location.href = `${location.origin}/adminmenu${WEBEXTENTION}`;
    });
}

function listenToProfileBtn() {
    htmlProfileButton.addEventListener('click', function () {
        window.location.href = `${
            location.origin
        }/profiel${WEBEXTENTION}`;
    });
}

// #endregion

document.addEventListener('DOMContentLoaded', function () { // Authentication
    userToken = sessionStorage.getItem("usertoken");
    if (userToken == null) 
        window.location.href = location.origin;
    


    // Navigation
    htmlBackButton = document.querySelector('.js-back');
    htmlProfileButton = document.querySelector('.js-profile');
    htmlMenuButton = document.querySelector('.js-menu');

    // Locker detail
    htmlLockerSvg = document.querySelector('.js-locker-svg');
    htmlBackground = document.querySelector('.js-background');
    htmlPopUp = document.querySelector('.js-popup');
    htmlPopUpCancel = document.querySelector('.js-popup-cancel');
    htmlPopUpOpen = document.querySelector('.js-popup-open');
    htmlPopUpMessage = document.querySelector('.js-popup-message');

    // Nav buttons
    if (htmlBackButton)
        listenToBackBtn();


    if (htmlProfileButton) 
        listenToProfileBtn();


    // Pages
    const htmlPageOverview = document.querySelector('.js-overview-page');
    const htmlPageLocker = document.querySelector('.js-locker-page');
    const htmlPageProfile = document.querySelector('.js-profile-page');
    const htmlPageGebruiker = document.querySelector('.js-gebruiker-page');

    if (htmlPageOverview) {
        getLockersOverview();
    }

    if (htmlPageLocker) {
        const urlParams = new URLSearchParams(window.location.search);
        const lockerId = urlParams.get('lockerId');
        currentLockerID = lockerId;
        getLockerDetail(lockerId);
    }

    if (htmlPageProfile) {
        getUserProfile();
    }

});