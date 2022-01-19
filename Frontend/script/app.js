let currentLockerID;
let userToken;
let OpmerkingClicked = false;

let htmlLockerTitle, htmlOverview, htmlSoccer, htmlBasketball, htmlBeschikbaar,
    htmlLockerSvg, htmlInstructions, htmlOpmerkingBtn, htmlOpmerkingDiv, htmlSubmitBtn,
    htmlPopUp, htmlPopUpCancel, htmlBackground, htmlPopUpOpen, htmlExtraContent, htmlBackArrow,
    htmlUitlegLockerDetail, htmlInfo, htmlReserverenBtn, htmlOpmerkingText;

let ws = new WebSocket('wss://smartlocker.webpubsub.azure.com/client/hubs/SmartLockerHub');

ws.onmessage = (event) => {
    console.log(event.data);
    if (event.data.lockerId == currentLockerID && event.data.deviceId == "fc5a0661-20fc-4eb1-95d7-e27e19f211df" && event.data.value == 1) {
        htmlLockerSvg.innerHTML = getSvg('locker close');
    }

};

const showOverview = function(jsonObject) {
    console.log(jsonObject);
    let htmlstring = ``;
    let Sport,
        sport_1,
        sport_2,
        klasse,
        translate_location,
        translate_elips,
        translate_icon = '';
    htmlstring += `<rect id="Bg" class="cls-1" width="360" height="592" transform="translate(0 56)"/>`;
    for (const sport of jsonObject) {
        console.log(sport);

        if (sport.sport == 'Voetbal') {
            Sport = 'Soccer';
            sport_1 = 'soccer';
            sport_2 = 'football';
            klasse = 'cls-3';
            translate_location = '-481 2';
            translate_elips = '723 397';
            translate_icon = '729 403';
        }
        if (sport.sport == 'Basketbal') {
            Sport = 'Basketball';
            sport_1 = 'basketball';
            sport_2 = 'basketball';
            klasse = 'cls-5';
            translate_location = '-419 -226';
            translate_elips = '699 382';
            translate_icon = '705 388';
        }
        htmlstring += `<g id="${Sport}" data="${sport.id}" class="js-${sport_1}" transform="translate(${translate_location})">
        <g id="Ellipse_1" data-name="Ellipse 1" class="js-color-${sport_1}" transform="translate(${translate_elips})">
          <circle class="cls-6" cx="18" cy="18" r="18"/>
          <circle class="cls-7" cx="18" cy="18" r="17.5"/>
        </g>
        <g id="${sport_2}" data-name="${sport_2}" class="${klasse}" transform="translate(${translate_icon})">
          <circle class="cls-6" cx="12" cy="12" r="12"/>
          <circle class="cls-7" cx="12" cy="12" r="11.5"/>
        </g>
      </g>`;
    }
    htmlOverview.innerHTML = htmlstring;
    const htmlColorFootball = document.querySelector('.js-color-soccer');
    const htmlColorBasketball = document.querySelector('.js-color-basketball');
    for (const sport of jsonObject) {
        console.log(sport.status);
        if (sport.status == 'Beschikbaar') {
            if (sport.sport == 'Voetbal') {
                htmlColorFootball.classList.add('svg-avaible');
            } else {
                htmlColorBasketball.classList.add('svg-avaible');
            }
        } else if (sport.status == 'Bezet') {
            if (sport.sport == 'Voetbal') {
                htmlColorFootball.classList.add('svg-unavaible');
            } else {
                htmlColorBasketball.classList.add('svg-unavaible');
            }
        } else if (sport.status == 'Buiten gebruik') {
            if (sport.sport == 'Voetbal') {
                htmlColorFootball.classList.add('svg-outofuse');
            } else {
                htmlColorBasketball.classList.add('svg-outofuse');
            }
        }
    }
    htmlSoccer = document.querySelector('.js-soccer');
    htmlBasketball = document.querySelector('.js-basketball');
    ListenToCLickSport();
};

const showLocker = function(jsonObject) {
    console.log(jsonObject);
    htmlLockerTitle.innerHTML = jsonObject.name;
    htmlInfo.innerHTML = jsonObject.description;
    if (jsonObject.status == 'Beschikbaar') {
        htmlBeschikbaar.innerHTML = 'Beschikbaar';
        htmlInstructions.innerHTML = 'Tik op het slot om te openen';
        htmlBeschikbaar.classList.add('locker_detail_content_status_color_available');
        ListenToClickOpmerkingBtn(OpmerkingClicked);
        ListenToClickReserverenBtn();
        ListenToClickToggleLocker(jsonObject.id);
    } else if (jsonObject.status == 'Bezet') {
        htmlBeschikbaar.innerHTML = 'Bezet';
        htmlInstructions.innerHTML = 'Alle voorwerpen zijn voor het moment in gebruik';
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
    ListenToClickBackArrow();
};

const ListenToCLickSport = function() {
    htmlSoccer.addEventListener('click', function() {
        currentLockerID = htmlSoccer.getAttribute('data');
        window.location.replace(`${location.origin}/locker${WEBEXTENTION}?id=${currentLockerID}`);
    });
    htmlBasketball.addEventListener('click', function() {
        currentLockerID = htmlBasketball.getAttribute('data');
        window.location.replace(`${location.origin}/locker${WEBEXTENTION}?id=${currentLockerID}`);
    });
};

function ListenToClickBackArrow() {
    htmlBackArrow.addEventListener('click', function() {
        window.location.replace(`${location.origin}/overzicht${WEBEXTENTION}`);
    });
}

function ListenToClickToggleLocker(id) {
    htmlLockerSvg.addEventListener('click', function() {
        htmlPopUp.style = 'display:block';
        htmlPopUp.style.animation = 'fadein 0.5s';
        htmlBackground.style = 'filter: blur(8px);';
        ListenToCancel();
        ListenToOpen(id);
    });
}

function ListenToCancel() {
    htmlPopUpCancel.addEventListener('click', function() {
        htmlBackground.style = '';
        htmlPopUp.style.animation = 'fadeout 0.3s';
        setTimeout(DisplayNone, 300);
    });
}

function ListenToOpen(id) {
    htmlPopUpOpen.addEventListener('click', function() {
        htmlBackground.style = '';
        htmlLockerSvg.innerHTML = getSvg('locker open');
        htmlInstructions.innerHTML = 'Vergeet de locker niet manueel te sluiten';
        htmlPopUp.style.animation = 'fadeout 0.3s';
        setTimeout(DisplayNone, 300);
        handleData($ `${APIURI}/lockers/${id}/open`, null, null, 'POST', userToken);
    });
}

function DisplayNone() {
    htmlPopUp.style = 'display: none;';
}

function ListenToClickReserverenBtn() {
    htmlReserverenBtn.addEventListener('click', function() {
        console.log('Ga naar reserverenpagina.html');
    });
}

function ListenToClickOpmerkingBtn() {
    htmlOpmerkingBtn.addEventListener('click', function() {
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
            htmlSubmitBtn.addEventListener('click', function() {
                console.log(`Verzend ${htmlOpmerkingText.value} naar database`)
            });
        }
    });
}

const getOverzicht = function() {
    handleData(`${APIURI}/lockers`, showOverview, null, 'GET', null, userToken);
};

const getLockerDetail = function(id) {
    handleData(`${APIURI}/lockers/${id}`, showLocker, null, 'GET', null, userToken);
};

document.addEventListener('DOMContentLoaded', function() {
    console.info('DOM geladen');

    // user authentication
    userToken = sessionStorage.getItem("usertoken");
    userToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjMxNDQ2NDQxNTU3OTUzMjIiLCJuYW1lIjoiSmVucyBEdW1vcnRpZXIiLCJyb2xlIjoiVXNlciJ9.9PqxSKs19MPQCU_6Lt38Krq1aZeHBbZ1Y2Sf4orTyao";
    if (userToken == null)
        window.location.replace(location.origin);

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
    htmlBackArrow = document.querySelector('.js-backarrow');
    htmlUitlegLockerDetail = document.querySelector('.js-uitleg');
    htmlInfo = document.querySelector('.js-info');
    htmlReserverenBtn = document.querySelector('.js-reservatiebtn');
    if (htmlOverview) {
        //deze code wordt gestart vanaf overzicht.html
        getOverzicht();
    }
    if (htmlLockerTitle) {
        //deze code wordt gestart vanaf locker.html
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        getLockerDetail(id);
    }
});