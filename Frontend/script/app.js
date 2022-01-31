let currentLockerID, currentReservation;
let currentRegistrationID;
let userToken;
let urlParams, userTokenPayload;

// #region Overview

const showLockers = function (lockers) {
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


        htmlString += `<g class="js-locker cursor_pointer" data-id="${locker.id
            }" transform="translate(${locker.iconLocation
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

const listenToLockerIcon = function () {
    const lockers = document.querySelectorAll('.js-locker');

    for (const locker of lockers) {
        locker.addEventListener('click', function () {
            window.location.href = `${location.origin
                }/locker${WEBEXTENTION}?lockerId=${this.dataset.id
                }`;

        });
    }
};

const getLockersOverview = function () {
    handleData(`${APIURI}/lockers`, showLockers, null, 'GET', null, userToken);
};

// #endregion

// #region Locker Detail

let htmlPopup,
    htmlPopUpOk,
    htmlPopUpEndTimePicker,
    htmlEndHourEndTimePicker,
    htmlEndMinuteEndTimepicker,
    htmlPopUpCancel,
    htmlPopupMessage,
    htmlMenuButton;
let htmlBackground,
    htmlStopRegBack,
    htmlStopRegConfirm,
    htmlStartRegistration,
    eventListenerExistsEndTimePicker,
    busy_timestamps_endTimePicker,
    htmlLockerSvg,
    htmlstopRegistrationBtn,
    eventListenerStopRegExists = false;

const listenToChangeLockerState = function () {
    ws = new WebSocket('wss://smartlocker.webpubsub.azure.com/client/hubs/SmartLockerHub');
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log(data);
        if (data.device.lockerId == currentLockerID && data.log.deviceId == "fc5a0661-20fc-4eb1-95d7-e27e19f211df" && data.log.value == 1) {
            htmlLockerSvg.innerHTML = getSvg('locker close');
        }
    };
};

const showHamburger = function () {
    htmlMenuButton.style = "display:flex";
};

const showLockerDetail = function (locker) {
    console.log(locker);

    eventListenerExistsEndTimePicker = false;
    eventListenerStopRegBack = false;
    eventListenerStopRegConfirm = false;
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
    htmlstopRegistrationBtn = document.querySelector('.js-locker-stop-registration');

    htmlLockerTitle.innerHTML = locker.name;
    htmlLockerDescription.innerHTML = locker.description;
    htmlLockerStatus.innerHTML = locker.status;
    htmlLockerSvg.innerHTML = getSvg('locker close');

    console.log("Reservation:", currentReservation);
    console.log("Registration id:", currentRegistrationID);

    if (currentRegistrationID) {
        console.log("Activiteit bezig");

        htmlLockerInstructions.innerHTML = 'Tik op het slot om de locker opnieuw te openen';
        htmlLockerStatus.classList.add('locker_detail_content_status_color_unavailable');

        htmlLockerStatus.innerHTML = 'Bezig';
        htmlstopRegistrationBtn.style = "display: flex";
        htmlLockerPopupMessage.innerHTML = "Wil je de locker opnieuw openen?";
        listenToClickToggleLocker();
        listenToLockerStopRegistration();
    } else if (locker.status == 'Beschikbaar' || currentReservation) {
        console.log("Activiteit starten");

        htmlLockerInstructions.innerHTML = 'Tik op het slot om een activiteit te starten';
        htmlLockerStatus.classList.add('locker_detail_content_status_color_available');

        if (currentReservation) {
            console.log("Reservatie");
            htmlLockerStatus.innerHTML = 'Gereserveerd';
            document.querySelector('.js-popup-message-start').innerHTML = `Je staat op het punt om een activiteit te starten, deze activiteit is gereserveerd tot ${new Date(currentReservation.endTime).toLocaleTimeString("nl-BE", { hour: '2-digit', minute: '2-digit' })}. <br /><b>Waarschuwing: Als je de activiteit start open je de locker. Deze kan enkel manueel gesloten worden.</b>`;
            document.querySelector('.js-end-holder').style.display = 'none';
        } else {
            console.log("Geen reservatie");
            document.querySelector('.js-popup-message-start').innerHTML = "Je staat op het punt om een activiteit te starten, selecteer het tijdstip tot wanneer je wil reserveren. <br /><b>Waarschuwing: Als je de activiteit start open je de locker. Deze kan enkel manueel gesloten worden.</b>";
            document.querySelector('.js-end-holder').style.display = 'flex';
        }

        listenToClickToggleLockerEndTimePicker(locker.id);
    } else if (locker.status == 'Bezet') {
        console.log("Locker bezet");
        htmlLockerInstructions.innerHTML = 'Deze locker is momenteel in gebruik';
        htmlLockerStatus.classList.add('locker_detail_content_status_color_unavailable');
        htmlLockerSvg.classList.add('locker_detail_content_toggleSvg_outofuse');
    } else if (locker.status == 'Buiten gebruik') {
        console.log("Locker buiten gebruik");
        htmlLockerInstructions.innerHTML = 'Deze locker is momenteel buiten gebruik';
        htmlLockerStatus.classList.add('locker_detail_content_status_color_outofuse');
        htmlLockerSvg.classList.add('locker_detail_content_toggleSvg_outofuse');
        htmlLockerReservate.style = 'display:none';
    }
};

function displayNoneStopRegistration() {
    htmlPopUpStopRegistration.style = "display: none";
}

function ListenToClickCheckBoxes() {
    const checkboxes = document.querySelectorAll('.js-checkbox-stop-registration');
    for (let checkbox of checkboxes) {
        checkbox.addEventListener('click', function () {
            if (!checkbox.classList.contains('box_checked')) {
                checkbox.style = `border-color: var(--blue-accent-color); content: url('/svg/iconmonstr-check-mark-17.svg');`;
                checkbox.style.animation = "fadein 0.5s";
                checkbox.classList.add('box_checked');
            } else {
                checkbox.style = ``;
                checkbox.classList.remove('box_checked');
            }
        });
    }
}

function listenToLockerStopRegistration() {
    htmlstopRegistrationBtn = document.querySelector('.js-locker-stop-registration');
    htmlstopRegistrationBtn.addEventListener('click', function () {
        console.log("Stop registratie knop");
        htmlPopUpStopRegistration = document.querySelector('.js-popup-stop-registration');
        htmlPopUpCancelStopRegistration = document.querySelector('.js-popup-cancel-stop-reservation');
        htmlPopUpConfirmStopRegistration = document.querySelector('.js-popup-stop-reservation');
        htmlPopUpStopRegistration.style = "display:block";
        htmlBackground.style = 'filter: blur(8px);';
        htmlPopUpCancelStopRegistration.addEventListener('click', function () {
            console.log("Cancel");
            htmlBackground.style = '';
            htmlPopUpStopRegistration.style.animation = "fadeout 0.3s";
            setTimeout(displayNoneStopRegistration, 300);
        });
        htmlPopUpConfirmStopRegistration.addEventListener('click', function () {
            console.log("Registratie wordt gestopt");
            htmlPopUpStopRegistration.innerHTML = `<p class="stop-registration-message">Is het materiaal in orde?</p>
                <div class="reservation_detail flex">
                    <label class="checkbox">Materiële schade</label>
                    <input class="checkbox_input" type="checkbox">
                    <div class="checkbox_box js-checkbox-stop-registration"></div>
                </div>
                <div class="reservation_detail flex">
                    <label class="checkbox">Ontbrekend materiaal</label>
                    <input class="checkbox_input" type="checkbox">
                    <div class="checkbox_box js-checkbox-stop-registration"></div>
                </div>
                <div class="reservation_opmerking">
                    <label for="opmerking" class="reservation_opmerking_title">Opmerking
                        <span class="textarea js-stop-reg-opmerking" role="textbox" contenteditable></span>
                    </label>
                </div>
                <button class="stop-registration-info-back js-stop-registration-info-back">Terug</button>
                <button class="stop-registration-info-confirm js-stop-registration-info-confirm">Indienen</button>`;
            ListenToClickCheckBoxes();
            ListenToClickStopRegInfoBack();
            ListenToClickStopRegInfoConfirm();
        });

    });
}

function ListenToClickStopRegInfoBack() {
    htmlStopRegBack = document.querySelector('.js-stop-registration-info-back');
    htmlStopRegBack.addEventListener('click', function () {
        htmlPopUpStopRegistration.style = "display: none";
        htmlPopUpStopRegistration.innerHTML = `
            <p class="open_locker_message js-popup-message">Wil je stoppen met het materiaal te gebruiken?</p>
            <div class="locker_detail_popup_buttons">
                <button class="locker_detail_popup_terug js-popup-cancel-stop-reservation">Nee</button>
                <button class="locker_detail_popup_open js-popup-stop-reservation">Ja</button>
            </div>
        `;
        htmlBackground.style = '';
    });
}

function ListenToClickStopRegInfoConfirm() {
    htmlStopRegConfirm = document.querySelector('.js-stop-registration-info-confirm');
    htmlStopRegConfirm.addEventListener('click', function () {
        htmlBackground.style = '';
        let materiële_schade = "nee";
        let ontbrekend_materiaal = "nee";
        let opmerking = document.querySelector('.js-stop-reg-opmerking').innerHTML;
        if ($(".js-popup-stop-registration")[0]) {
            const collection = document.getElementsByClassName("box_checked");
            if (collection.length == 0) {
                console.log("Er zijn geen checkboxes aangeduid");
            }
            if (collection.length == 2) {
                console.log("Beide checkboxes zijn aangeduid");
                materiële_schade = "ja";
                ontbrekend_materiaal = "ja";
            }
            if (collection.length == 1) {
                for (elem of collection) {
                    let sister = elem.previousElementSibling;
                    let label = sister.previousElementSibling;
                    if (label.innerHTML == "Ontbrekend materiaal") {
                        ontbrekend_materiaal = "ja";
                    } else {
                        materiële_schade = "ja";
                    }
                }
            }
        }
        const body = {
            "note": "Materiële_schade: " + materiële_schade + "\n" + "Ontbrekend_materiaal: " + ontbrekend_materiaal + "\n" + "Opmerking: " + opmerking + "\n"
        };
        handleData(`${APIURI}/registrations/${currentRegistrationID}/stop`, callbackStopRegistration, callbackStopRegistrationError, 'POST', JSON.stringify(body), userToken);
    });
}

function callbackStopRegistration() {
    htmlPopUpEndTimePicker.style = "display: none";
    window.location.reload();
}

async function callbackStopRegistrationError(errorMessage) {
    errorMessage = await errorMessage.json();
    if (errorMessage.code == 801) {
        window.alert("Locker is nog open, sluit hem om de registratie af te sluiten");
    }
}

function listenToClickToggleLocker() {
    htmlLockerSvg.addEventListener('click', function () {
        htmlPopUp.style = 'display:block';
        htmlPopUp.style.animation = 'fadein 0.5s';
        htmlBackground.style = 'filter: blur(8px);';
    });
    listenToOpenLockerPopupContinue();
    listenToOpenLockerPopupCancel();
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

    if (currentReservation) {
        if (new Date(currentReservation.endTime).getTime() < Date.now()) {
            console.log("Reservatie is vervallen! De pagina wordt herladen");
            window.alert("Reservatie is vervallen! De pagina wordt herladen");
            window.location.reload();
        }
    } else {
        let startHour = new Date().getHours();
        let startMinute = new Date().getMinutes();
        let endHour = parseInt(htmlEndHourEndTimePicker.value);
        let endMinute = parseInt(htmlEndMinuteEndTimepicker.value);

        if (startHour == endHour && startMinute > endMinute || startHour > endHour) {
            console.log("Eindtijdstip moet later liggen dan starttijdstip");
            window.alert("Eindtijdstip moet later liggen dan starttijdstip");
            return;
        }

        if (startHour == endHour && startMinute == endMinute) {
            console.log("Beide tijdstippen zijn hetzelfde");
            window.alert("Beide tijdstippen zijn hetzelfde");
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
    }

    let now = new Date(Date.now());
    let end = new Date(new Date(now).setHours(htmlEndHourEndTimePicker.value, htmlEndMinuteEndTimepicker.value, 0, 0));
    let endReservation = end.toUTCString().replace("UTC", "GMT");

    // Kijken of een slot niet langer dan 90 minuten duurt
    let diffMin = new Date(end - now).getMinutes();
    if (diffMin > 90) {
        console.log("Je kan slechts maximum 90 minuten reserveren !");
        window.alert("Je kan slechts maximum 90 minuten reserveren !");
        return;
    }

    console.log("Geldig tijdstip");
    const body = {
        "lockerId": currentLockerID,
        "endTimeReservation": endReservation
    };

    handleData(`${APIURI}/registrations/start`, callbackRegistrationStarted, null, 'POST', JSON.stringify(body), userToken);
}

function ListenToConfirmRegistrationEndTimePicker() {
    if (!eventListenerExistsEndTimePicker) {
        htmlStartRegistration.addEventListener('click', function () {
            eventListenerExistsEndTimePicker = true;
            CheckIfValidReservationEndTimePicker();
        });
    }
}

function disablePastReservation(busy_timestamps_endTimePicker) {
    // Eerste uur dat voorkomt ophalen en vanaf dan alle uren en minuten disablen
    let nextHour = 0;
    console.log(busy_timestamps_endTimePicker);
    let nextMinute = 0;
    for (let hour in busy_timestamps_endTimePicker) {
        if (hour >= new Date().getHours() && nextHour == 0) {
            nextHour = parseInt(hour);
        }
    }
    if (nextHour == 0){
        return
    }
    console.log("nexthour", nextHour);
    nextMinute = busy_timestamps_endTimePicker[nextHour][0];
    console.log("nextminute", nextMinute);
    for (let option of htmlEndHourEndTimePicker) {
        let optionValue = parseInt(option.value);
        if (optionValue > parseInt(nextHour)) {
            option.disabled = true;
        }
    }
    for (let option of htmlEndMinuteEndTimepicker) {
        let optionValue = parseInt(option.value);
        if (optionValue >= parseInt(nextMinute) && parseInt(htmlEndHourEndTimePicker.value) == parseInt(nextHour)) {
            option.disabled = true;
        }
        else if (parseInt(htmlEndHourEndTimePicker.value) > parseInt(nextHour)) {
            option.disabled = true;
        }
    }
}

function setReservationEndTimePicker(jsonObject) {
    console.log('test1');
    let todaysReservations = getTodaysReservationsEndTimePicker(jsonObject);
    console.log(todaysReservations);
    busy_timestamps_endTimePicker = getBusyTimestamps(todaysReservations);
    console.log("busy_timestamps", busy_timestamps_endTimePicker);
    disableBusyHours(busy_timestamps_endTimePicker);
    disablePast();
    disablePastReservation(busy_timestamps_endTimePicker);
    htmlEndHourEndTimePicker.addEventListener('change', setNewMinutes);
    console.log('test2');
    ListenToConfirmRegistrationEndTimePicker();
}

const getReservationsEndTimePicker = function () {
    handleData(`${APIURI}/reservations/lockers/11cf21d4-03ef-4e0a-8a17-27c26ae80abd`, setReservationEndTimePicker, null, 'GET', null, userToken);
};

function fillOptionsSelectEndTimePicker() {
    htmlEndHourEndTimePicker.innerHTML = ``;
    htmlEndMinuteEndTimepicker.innerHTML = ``;
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
    let htmlTerug = document.querySelector('.js-cancel-reg-btn');
    htmlTerug.addEventListener('click', function () {
        htmlBackground.style = '';
        htmlPopUpEndTimePicker.style.animation = "fadeout 0.3s";
        setTimeout(DisplayNoneEndTimePicker, 300);
    });
}

function listenToClickStartReg() {
    let htmlStartReg = document.querySelector('.js-start-reg-btn');
    htmlStartReg.addEventListener('click', function () {
        htmlBackground.style = '';
        htmlPopUpEndTimePicker.style.animation = "fadeout 0.3s";
        setTimeout(DisplayNoneEndTimePicker, 300);
    });
}

function listenToClickToggleLockerEndTimePicker(lockerid) {
    htmlLockerSvg.addEventListener('click', showStartRegistrationPopup);
}

function showStartRegistrationPopup() {
    htmlBackground.style = 'filter: blur(8px);';
    htmlPopUpEndTimePicker.style = "display: block;";
    htmlPopUpEndTimePicker.style.animation = "fadein 0.3s";
    fillOptionsSelectEndTimePicker();
    getReservationsEndTimePicker();
    listenToClickCancelEndTimePicker();
    listenToClickStartReg();
}

function listenToOpenLockerPopupContinue() {
    if (htmlPopUpOk) {
        htmlPopUpOk.addEventListener('click', function () {
            htmlBackground.style = '';
            setTimeout(DisplayNone, 300);
            openLockerLock();
        });
    }
}

function callbackRegistrationStarted(registration) {
    console.log("New Registration id:", registration.id);
    currentRegistrationID = registration.id;

    document.querySelector('.js-locker-status').classList.add('locker_detail_content_status_color_available');
    document.querySelector('.js-locker-status').classList.add('locker_detail_content_status_color_unavailable');
    document.querySelector('.js-locker-status').innerHTML = 'Bezig';
    document.querySelector('.js-locker-stop-registration').style = "display: flex";
    document.querySelector('.js-locker-instructions').innerHTML = 'Tik op het slot om de locker opnieuw te openen';
    document.querySelector('.js-popup-message').innerHTML = "Wil je de locker opnieuw openen?";

    htmlLockerSvg.removeEventListener('click', showStartRegistrationPopup);
    listenToClickToggleLocker();
    listenToLockerStopRegistration();

    openLockerLock();
}

function openLockerLock() {
    console.log("Open locker");
    handleData(`${APIURI}/lockers/${currentLockerID}/open`, callbackLockerOpened, null, 'POST', null, userToken);
}

function callbackLockerOpened() {
    console.log('Locker opened');
    htmlPopUp.style.animation = 'fadeout 0.3s';
    htmlLockerSvg.innerHTML = getSvg('locker open');
}


function listenToOpenLockerPopupCancel() {
    if (htmlPopUpCancel) {
        htmlPopUpCancel.addEventListener('click', function () {
            htmlPopUp.style.animation = 'fadeout 0.3s';
            htmlBackground.style = '';
            setTimeout(DisplayNone, 300);
        });
    }
}

function DisplayNone() {
    htmlPopUp.style = 'display: none;';
}

function listenToLockerReservate(lockerId) {
    document.querySelector('.js-locker-reservate').addEventListener('click', function () {
        window.location.href = `${location.origin
            }/reservatie_toevoegen${WEBEXTENTION}?lockerId=${lockerId}`;
    });
}

const callbackUserReservations = function (reservations) {
    for (const reservation of reservations) {
        if (reservation.lockerId == currentLockerID && new Date(reservation.endTime) > Date.now() && new Date(reservation.startTime) < Date.now()) {
            currentReservation = reservation;
            break;
        }
    }
    getCurrentRegistration();
};

const callbackCurrentRegistration = function (registration) {
    if (registration[0] != null)
        currentRegistrationID = registration[0].id;
    getLockerDetail(currentLockerID);
};

const getCurrentRegistration = function () {
    handleData(`${APIURI}/registrations/users/me/current?lockerId=${currentLockerID}`, callbackCurrentRegistration, null, 'GET', null, userToken);
};

const getUserReservations = function () {
    handleData(`${APIURI}/reservations/users/me`, callbackUserReservations, null, 'GET', null, userToken);
};

const getLockerDetail = function (lockerId) {
    handleData(`${APIURI}/lockers/${lockerId}`, showLockerDetail, null, 'GET', null, userToken);
};

// #endregion

// #region Profile Page

const showUserProfile = function (user) {
    console.log(user);

    document.querySelector(".js-profile-picture").src = user.picture;
    document.querySelector(".js-name").innerHTML = user.name;
    document.querySelector(".js-email").innerHTML = user.email;
    document.querySelector(".js-tel").innerHTML = user.tel;
    document.querySelector(".js-created").innerHTML = new Date(user.userCreated).toLocaleDateString("nl-BE");

    ListenToUserReservations();
    ListenToUserActivities();
};

function ListenToUserLogout() {
    document.querySelector('.js-logout').addEventListener('click', function () {
        sessionStorage.removeItem('usertoken');
        window.location.reload();
    });
}

function ListenToUserReservations() {
    document.querySelector('.js-reservations').addEventListener('click', function () {
        window.location.href = `${location.origin
            }/reservaties${WEBEXTENTION}?users=me`;
    });
}

function ListenToUserActivities() {
    document.querySelector('.js-activities').addEventListener('click', function () {
        window.location.href = `${location.origin
            }/activiteiten${WEBEXTENTION}?users=me`;
    });
}

const getUserProfile = function () {
    handleData(`${APIURI}/users/me`, showUserProfile, null, 'GET', null, userToken);
};



// #endregion

// #region Navigation

let htmlBackButton,
    htmlProfileButton;

function listenToBackBtn() {
    htmlBackButton.addEventListener('click', function () {
        window.history.back();
    });
}

function listenToMenuBtn() {
    htmlMenuButton.addEventListener('click', function () {
        window.location.href = `${location.origin}/adminmenu${WEBEXTENTION}`;
    });
}

function listenToProfileBtn() {
    htmlProfileButton.addEventListener('click', function () {
        window.location.href = `${location.origin
            }/profiel${WEBEXTENTION}`;
    });
}

// #endregion

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};

document.addEventListener('DOMContentLoaded', function () {

    // Url params
    urlParams = new URLSearchParams(window.location.search);

    // Pages
    const htmlPageLogin = document.querySelector('.js-login-page');
    const htmlPageBlocked = document.querySelector('.js-blocked-page');
    const htmlPageOverview = document.querySelector('.js-overview-page');
    const htmlPageLocker = document.querySelector('.js-locker-page');
    const htmlPageProfile = document.querySelector('.js-profile-page');
    const htmlPageGebruiker = document.querySelector('.js-gebruiker-page');

    // Authentication
    userToken = sessionStorage.getItem("usertoken");
    if (userToken) {
        userTokenPayload = parseJwt(userToken);
        if (htmlPageBlocked == null && userTokenPayload.isBlocked) window.location.href = `${location.origin}/geblokkeerd${WEBEXTENTION}`;
    } else if (htmlPageLogin == null) {
        window.location.href = location.origin;
    }

    // Navigation
    htmlBackButton = document.querySelector('.js-back');
    htmlProfileButton = document.querySelector('.js-profile');
    htmlMenuButton = document.querySelector('.js-menu');

    // Locker detail
    htmlLockerSvg = document.querySelector('.js-locker-svg');
    htmlBackground = document.querySelector('.js-background');
    htmlPopUp = document.querySelector('.js-popup');
    htmlPopUpCancel = document.querySelector('.js-popup-cancel');
    htmlPopUpOk = document.querySelector('.js-popup-ok');
    htmlPopUpMessage = document.querySelector('.js-popup-message');

    // Nav buttons
    if (htmlBackButton)
        listenToBackBtn();

    if (htmlProfileButton)
        listenToProfileBtn();

    if (htmlMenuButton)
        listenToMenuBtn();

    // Pages load content
    if (htmlPageOverview) {
        if (userTokenPayload.role == "Admin") showHamburger();
        getLockersOverview();
    }

    if (htmlPageLocker) {
        listenToChangeLockerState();
        if (userTokenPayload.role == "Admin") showHamburger();
        const lockerId = urlParams.get('lockerId');
        currentLockerID = lockerId;
        getUserReservations();
        listenToLockerReservate(lockerId);
    }

    if (htmlPageProfile) {
        if (userTokenPayload.role == "Admin") showHamburger();
        getUserProfile();
        ListenToUserLogout();
    }

});