let currentLockerID;
let OpmerkingClicked = false;
let registrationStarted = false;

let userToken;
let htmlLockerTitle, htmlOverview, htmlSoccer, htmlBasketball, htmlBeschikbaar,
    htmlLockerSvg, htmlInstructions, htmlOpmerkingBtn, htmlOpmerkingDiv, htmlSubmitBtn,
    htmlPopUp, htmlPopUpCancel, htmlBackground, htmlPopUpOpen, htmlExtraContent, htmlBackButton, htmlUserProfileButton,
    htmlUitlegLockerDetail, htmlInfo, htmlReserverenBtn, htmlOpmerkingText, htmlPopUpMessage, htmlProfiel;

let ws = new WebSocket('wss://smartlocker.webpubsub.azure.com/client/hubs/SmartLockerHub');
ws.onmessage = (event) => {
    console.log(event.data);
    if (event.data.lockerId == currentLockerID && event.data.deviceId == "fc5a0661-20fc-4eb1-95d7-e27e19f211df" && event.data.value == 1) {
        htmlLockerSvg.innerHTML = getSvg('locker close');
    }
};

const showLockers = function (lockers) {
    console.log(lockers);

    let htmlString = ``;
    for (const locker of lockers) {
        let statusClass = '';
        if (locker.status === 'Beschikbaar')
            statusClass = 'svg-avaible';
        else if (locker.status === 'Bezet')
            statusClass = 'svg-unavaible';
        else if (locker.status === 'Buiten gebruik')
            statusClass = 'svg-outofuse';

        htmlString += `<g class="js-locker" data-id="${locker.id}" transform="translate(${locker.iconLocation})">
            <g class="${statusClass}">
                <circle cx="18" cy="18" r="18" />
            </g>
            <g style="fill: url(#${locker.sport.toLowerCase()})" transform="translate(6 6)">
                <circle cx="12" cy="12" r="12" />
            </g>
        </g>`;
    }

    document.querySelector('.js-overview').innerHTML += htmlString;
    listenToLocker();
};

const showLocker = function (jsonObject) {
    console.log(jsonObject);
    htmlLockerTitle.innerHTML = jsonObject.name;
    htmlInfo.innerHTML = jsonObject.description;
    if (jsonObject.status == 'Beschikbaar') {
        htmlBeschikbaar.innerHTML = 'Beschikbaar';
        htmlInstructions.innerHTML = 'Tik op het slot om te openen';
        htmlBeschikbaar.classList.add('locker_detail_content_status_color_available');
        ListenToClickOpmerkingBtn(OpmerkingClicked);
        ListenToClickReserverenBtn(jsonObject.id);
        //checken of registratie al gestart is van deze gebruiker 
        // ==>ja: toon een button die de registratie kan afsluiten (onder het lock), als je hier op drukt komt er een pop up waar je een opmerking in kan toevoegen 
        //        en je kan nog steeds de locker openen zolang de registratie bezig is
        // ==>nee: je kan de registratie starten door de locker te openen
        //reserveren van de locker kan je altijd
        if (registrationStarted == false) {
            ListenToClickToggleLocker(jsonObject.id);
            htmlPopUpMessage.innerHTML = "Je staat op het punt de registratie te starten. Breng de bal terug voor 00:00. Daarna kan je de registratie afsluiten.";
        }
        if (registrationStarted == true) {
            ListenToClickToggleLocker(jsonObject.id);
            htmlPopUpMessage.innerHTML = "Wil je de locker opnieuw openen?";
            //listener van de registratie afsluit knop
            //andere htmlpopup met keuzemenu of alles in orde is
        }
    } else if (jsonObject.status == 'Bezet') {
        htmlBeschikbaar.innerHTML = 'Bezet';
        htmlInstructions.innerHTML = 'De locker is momenteel in gebruik';
        htmlLockerSvg.style = 'display:none';
        htmlBeschikbaar.classList.add('locker_detail_content_status_color_unavailable');
        htmlOpmerkingBtn.style = 'display:none';
        ListenToClickReserverenBtn();
    } else if (jsonObject.status == 'Buiten gebruik') {
        htmlBeschikbaar.innerHTML = 'Buiten gebruik';
        htmlInstructions.innerHTML = 'Slot kan nu niet worden geopend';
        htmlBeschikbaar.classList.add('locker_detail_content_status_color_outofuse');
        htmlLockerSvg.classList.add('locker_detail_content_toggleSvg_outofuse');
        htmlOpmerkingBtn.style = 'display:none';
        htmlUitlegLockerDetail.style = 'display:none';
        htmlReserverenBtn.style = 'display:none';
    }
};

const listenToLocker = function () {
    const lockers = document.querySelectorAll('.js-locker');

    for (const locker of lockers) {
        locker.addEventListener('click', function () {
            window.location.href = `${location.origin}/locker${WEBEXTENTION}?id=${this.dataset.id}`;
        });
    }
};

function ListenToClickToggleLocker(id) {
    htmlLockerSvg.addEventListener('click', function () {
        htmlPopUp.style = 'display:block';
        htmlPopUp.style.animation = 'fadein 0.5s';
        htmlBackground.style = 'filter: blur(8px);';
        ListenToOpen(id);
        ListenToCancel();
    });
}

function ListenToCancel() {
    htmlPopUpCancel.addEventListener('click', function () {
        htmlBackground.style = '';
        htmlPopUp.style.animation = 'fadeout 0.3s';
        setTimeout(DisplayNone, 300);
    });
}

function ListenToOpen(id) {
    htmlPopUpOpen.addEventListener('click', function () {
        setTimeout(DisplayNone, 300);
        let lockerId = id;
        const body = { lockerId };
        handleData(`${APIURI}/registration/start`, OpenLocker(id), null, 'POST', JSON.stringify(body), userToken);

    });
}

function OpenLocker(lockId) {
    console.log("open");
    htmlBackground.style = '';
    htmlLockerSvg.innerHTML = getSvg('locker open');
    htmlInstructions.innerHTML = 'Vergeet de locker niet manueel te sluiten';
    htmlPopUp.style.animation = 'fadeout 0.3s';
    handleData(`${APIURI}/lockers/${lockId}/open`, null, null, 'POST', null, userToken);
}

function DisplayNone() {
    htmlPopUp.style = 'display: none;';
}

function ListenToClickReserverenBtn(id) {
    htmlReserverenBtn.addEventListener('click', function () {
        console.log('Ga naar addreservatie.html met id van locker meesturen');
    });
}

function ListenToClickOpmerkingBtn() {
    htmlOpmerkingBtn.addEventListener('click', function () {
        if (OpmerkingClicked) {
            htmlOpmerkingBtn.style = 'background-color : var(--blue-accent-color);';
            htmlOpmerkingBtn.innerHTML = 'Opmerking toevoegen';
            console.log('Annuleer');
            htmlSubmitBtn.style = 'display: none;';
            htmlOpmerkingDiv.style = 'display: none;';
            OpmerkingClicked = false;
        } else {
            htmlOpmerkingDiv.style = 'display: block;';
            htmlOpmerkingBtn.innerHTML = 'Annuleren';
            htmlOpmerkingBtn.style = 'background-color : var(--status-outofuse);';
            console.log('Schrijf een opmerking');
            htmlSubmitBtn.style = 'display: block;';
            htmlExtraContent.style.animation = 'fadein 0.5s';
            OpmerkingClicked = true;
            htmlSubmitBtn.addEventListener('click', function () {
                console.log(`Verzend ${htmlOpmerkingText.value} naar database`);
            });
        }
    });
}

function listenToBackBtn() {
    htmlBackButton.addEventListener('click', function () {
        window.history.back();
    });
}

function listenToProfileBtn() {
    htmlUserProfileButton.addEventListener('click', function () {
        window.location.href = `${location.origin}/profiel${WEBEXTENTION}`;
    });
}

const getLockers = function () {
    handleData(`${APIURI}/lockers`, showLockers, null, 'GET', null, userToken);
};

const getLockerDetail = function (id) {
    handleData(`${APIURI}/lockers/${id}`, showLocker, null, 'GET', null, userToken);
};

document.addEventListener('DOMContentLoaded', function () {
    console.info('DOM geladen');

    // Authentication
    userToken = sessionStorage.getItem("usertoken");
    if (userToken == null) window.location.href = location.origin;

    htmlLockerTitle = document.querySelector('.js-lockertitle');
    htmlOverview = document.querySelector('.js-overview');
    htmlBeschikbaar = document.querySelector('.js-beschikbaar');
    htmlLockerSvg = document.querySelector('.js-toggleLocker');
    htmlInstructions = document.querySelector('.js-instructions');
    htmlOpmerkingBtn = document.querySelector('.js-opmerkingbtn');
    htmlOpmerkingDiv = document.querySelector('.js-opmerkingdiv');
    htmlSubmitBtn = document.querySelector('.js-submit');
    htmlOpmerkingText = document.querySelector('.js-opmerkingtext');
    htmlPopUp = document.querySelector('.js-popup');
    htmlPopUpCancel = document.querySelector('.js-popup-cancel');
    htmlBackground = document.querySelector('.js-background');
    htmlPopUpOpen = document.querySelector('.js-popup-open');
    htmlExtraContent = document.querySelector('.js-extra-content');
    htmlUitlegLockerDetail = document.querySelector('.js-uitleg');
    htmlInfo = document.querySelector('.js-info');
    htmlReserverenBtn = document.querySelector('.js-reservatiebtn');
    htmlPopUpMessage = document.querySelector('.js-popup-message');
    htmlProfiel = document.querySelector('.js-profiel');
    htmlBackButton = document.querySelector('.js-back');
    htmlUserProfileButton = document.querySelector('.js-profile');

    // Pages
    const htmlPageOverview = document.querySelector('.js-overview-page');
    const htmlPageLocker = document.querySelector('.js-locker-page');
    const htmlPageProfile = document.querySelector('.js-profile-page');

    // Buttons
    if (htmlBackButton) listenToBackBtn();
    if (htmlUserProfileButton) listenToProfileBtn();

    if (htmlPageOverview) {
        getLockers();
    }

    if (htmlLockerTitle) {
        //deze code wordt gestart vanaf locker.html
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        getLockerDetail(id);
    }

});