let currentLockerID;
let registrationStarted = false;
let userToken;

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

        htmlString += `<g class="js-locker cursor_pointer" data-id="${locker.id}" transform="translate(${locker.iconLocation})">
            <g class="${statusClass}">
                <circle cx="18" cy="18" r="18" />
            </g>
            <g style="fill: url(#${locker.sport.toLowerCase()})" transform="translate(6 6)">
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
            window.location.href = `${location.origin}/locker${WEBEXTENTION}?lockerId=${this.dataset.id}`;
        });
    }
};

const getLockersOverview = function () {
    handleData(`${APIURI}/lockers`, showLockers, null, 'GET', null, userToken);
};

// #endregion

// #region Locker Detail

let htmlPopup, htmlPopUpOpen, htmlPopUpCancel, htmlPopupMessage;
let htmlBackground, htmlLockerSvg;

let ws = new WebSocket('wss://smartlocker.webpubsub.azure.com/client/hubs/SmartLockerHub');
ws.onmessage = (event) => {
    console.log(event.data.json());
    const data = JSON.parse(event.data);
    if (data.device.lockerId == currentLockerID && data.log.deviceId == "fc5a0661-20fc-4eb1-95d7-e27e19f211df" && data.log.value == 1) {
        console.log('test');
        htmlLockerSvg.innerHTML = getSvg('locker close');
    }
};

const showLockerDetail = function (locker) {
    console.log(locker);

    const htmlLockerTitle = document.querySelector('.js-locker-name');
    const htmlLockerDescription = document.querySelector('.js-locker-description');
    const htmlLockerStatus = document.querySelector('.js-locker-status');
    const htmlLockerInstructions = document.querySelector('.js-locker-instructions');
    const htmlLockerSvg = document.querySelector('.js-locker-svg');
    const htmlLockerReservate = document.querySelector('.js-locker-reservate');
    const htmlLockerPopupMessage = document.querySelector('.js-popup-message');

    htmlLockerTitle.innerHTML = locker.name;
    htmlLockerDescription.innerHTML = locker.description;
    htmlLockerStatus.innerHTML = locker.status;

    if (locker.status == 'Beschikbaar' || registrationStarted) {
        htmlLockerInstructions.innerHTML = 'Tik op het slot om de locker te openen';
        htmlLockerStatus.classList.add('locker_detail_content_status_color_available');
        listenToLockerReservate(locker.id);

        //checken of registratie al gestart is van deze gebruiker 
        // ==>ja: toon een button die de registratie kan afsluiten (onder het lock), als je hier op drukt komt er een pop up waar je een opmerking in kan toevoegen 
        //        en je kan nog steeds de locker openen zolang de registratie bezig is
        // ==>nee: je kan de registratie starten door de locker te openen
        //reserveren van de locker kan je altijd
        if (registrationStarted) {
            htmlLockerStatus.innerHTML = 'Bezig';
            listenToClickToggleLocker(locker.id);
            htmlLockerPopupMessage.innerHTML = "Wil je de locker opnieuw openen?";
        }
        else {
            listenToClickToggleLocker(locker.id);
            htmlLockerPopupMessage.innerHTML = "Je staat op het punt de registratie te starten. Breng de bal terug voor 00:00. Daarna kan je de registratie afsluiten.";
            //listener van de registratie afsluit knop
            //andere htmlpopup met keuzemenu of alles in orde is
        }
    }
    else if (locker.status == 'Bezet') {
        htmlLockerInstructions.innerHTML = 'Deze locker is momenteel in gebruik';
        htmlLockerStatus.classList.add('locker_detail_content_status_color_unavailable');
        htmlLockerSvg.classList.add('locker_detail_content_toggleSvg_outofuse');
        listenToLockerReservate(locker.id);
    }
    else if (locker.status == 'Buiten gebruik') {
        htmlLockerInstructions.innerHTML = 'Deze locker is momenteel buiten gebruik';
        htmlLockerStatus.classList.add('locker_detail_content_status_color_outofuse');
        htmlLockerSvg.classList.add('locker_detail_content_toggleSvg_outofuse');
        htmlLockerReservate.style = 'display:none';
    }
};

function listenToClickToggleLocker(lockerId) {
    htmlLockerSvg.addEventListener('click', function () {
        htmlPopUp.style = 'display:block';
        htmlPopUp.style.animation = 'fadein 0.5s';
        htmlBackground.style = 'filter: blur(8px);';
        listenToOpenLockerPopupContinue(lockerId);
        listenToOpenLockerPopupCancel();
    });
}

function listenToOpenLockerPopupContinue(lockerId) {
    htmlPopUpOpen.addEventListener('click', function () {
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
    handleData(`${APIURI}/lockers/${registration.lockerId}/open`, null, null, 'POST', null, userToken);
}

function listenToOpenLockerPopupCancel() {
    htmlPopUpCancel.addEventListener('click', function () {
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
        window.location.href = `${location.origin}/reservatie_toevoegen${WEBEXTENTION}?lockerId=${lockerId}`;
    });
}

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
    document.querySelector(".js-created").innerHTML = new Date(user.userCreated).toLocaleDateString("nl-BE");

    ListenToUserLogout();
    ListenToUserReservations();
};

function ListenToUserLogout() {
    document.querySelector('.js-logout').addEventListener('click', function () {
        console.log("popup om te bevestigen, Afmelden van zichzelf via usertoken en ga naar index.html");
        sessionStorage.removeItem('usertoken');
        window.location.reload();
    });
}

function ListenToUserReservations() {
    document.querySelector('.js-reservations').addEventListener('click', function () {
        window.location.href = `${location.origin}/profielreservatie${WEBEXTENTION}`;
        console.log('Ga naar profielreservatie.html en toont reservaties van zichzelf via usertoken');
    });
}

const getUserProfile = function () {
    handleData(`${APIURI}/users/me`, showUserProfile, null, 'GET', null, userToken);
};

// #endregion

// #region Navigation

let htmlBackButton, htmlProfileButton;

function listenToBackBtn() {
    htmlBackButton.addEventListener('click', function () {
        window.history.back();
    });
}

function listenToProfileBtn() {
    htmlProfileButton.addEventListener('click', function () {
        window.location.href = `${location.origin}/profiel${WEBEXTENTION}`;
    });
}

// #endregion

document.addEventListener('DOMContentLoaded', function () {

    // Authentication
    userToken = sessionStorage.getItem("usertoken");
    if (userToken == null) window.location.href = location.origin;

    // Navigation
    htmlBackButton = document.querySelector('.js-back');
    htmlProfileButton = document.querySelector('.js-profile');

    // Locker detail
    htmlLockerSvg = document.querySelector('.js-locker-svg');
    htmlBackground = document.querySelector('.js-background');
    htmlPopUp = document.querySelector('.js-popup');
    htmlPopUpCancel = document.querySelector('.js-popup-cancel');
    htmlPopUpOpen = document.querySelector('.js-popup-open');
    htmlPopUpMessage = document.querySelector('.js-popup-message');

    // Nav buttons
    if (htmlBackButton) listenToBackBtn();
    if (htmlProfileButton) listenToProfileBtn();

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