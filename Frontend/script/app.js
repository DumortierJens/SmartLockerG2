'use strict';

let currentLockerID;
let htmlOpmerkingClicked = false;

let htmlLockerTitle, htmlOverview, htmlSoccer, htmlBasketball, htmlBeschikbaar,
    htmlLockerSvg, htmlInstructions, htmlOpmerkingBtn, htmlOpmerkingDiv, htmlSubmitBtn,
    htmlPopUp, htmlPopUpCancel, htmlBackground, htmlPopUpOpen, htmlExtraContent, htmlBackArrow;


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
            if (sport.sport == "Voetbal") {
                htmlColorFootball.classList.add('svg-avaible');
            } else {
                htmlColorBasketball.classList.add('svg-avaible');
            }

        } else if (sport.status == 'Bezet') {
            if (sport.sport == "Voetbal") {
                htmlColorFootball.classList.add('svg-unavaible');
            } else {
                htmlColorBasketball.classList.add('svg-unavaible');
            }

        } else if (sport.status == 'Buiten gebruik') {
            if (sport.sport == "Voetbal") {
                htmlColorFootball.classList.add('svg-outofuse');
            } else {
                htmlColorBasketball.classList.add('svg-outofuse');
            }
        }
    }
    htmlSoccer = document.querySelector('.js-soccer')
    htmlBasketball = document.querySelector('.js-basketball')
    ListenToCLickSport()
};

const showLocker = function(jsonObject) {
    console.log(jsonObject);
    htmlLockerTitle.innerHTML = jsonObject.name;
    if (jsonObject.status == "Beschikbaar") {
        htmlBeschikbaar.innerHTML = "Beschikbaar"
        htmlBeschikbaar.classList.add('locker_detail_content_status_color_available');
    } else if (jsonObject.status == "Bezet") {
        htmlBeschikbaar.innerHTML = "Bezet"
        htmlBeschikbaar.classList.add('locker_detail_content_status_color_unavailable');
    } else if (jsonObject.status == "Buiten gebruik") {
        htmlBeschikbaar.innerHTML = "Buiten gebruik";
        htmlBeschikbaar.classList.add('locker_detail_content_status_color_outofuse');
    }
    ListenToClickBackArrow()
    ListenToClickToggleLocker();
    ListenToClickOpmerkingBtn(htmlOpmerkingClicked);
};

const ListenToCLickSport = function() {
    htmlSoccer.addEventListener('click', function() {
        currentLockerID = htmlSoccer.getAttribute('data');
        window.location.replace(`http://${window.location.hostname}:5500/lockerdetailpagina.html?id=${currentLockerID}`);
    });
    htmlBasketball.addEventListener('click', function() {
        currentLockerID = htmlBasketball.getAttribute('data');
        window.location.replace(`http://${window.location.hostname}:5500/lockerdetailpagina.html?id=${currentLockerID}`);
    });
}

function ListenToClickBackArrow() {
    htmlBackArrow.addEventListener('click', function() {
        window.location.replace(`http://${window.location.hostname}:5500/overzichtpagina.html`);
    })
}

function ListenToCancel() {
    htmlPopUpCancel.addEventListener('click', function() {
        htmlBackground.style = ""
        htmlPopUp.style.animation = "fadeout 0.3s"
        setTimeout(DisplayNone, 300)
    })
}

function ListenToOpen() {
    htmlPopUpOpen.addEventListener('click', function() {
        htmlBackground.style = ""
        htmlLockerSvg.innerHTML = getSvg('locker open');
        htmlInstructions.innerHTML = "Vergeet de locker niet manueel te sluiten"
        htmlPopUp.style.animation = "fadeout 0.3s"
        setTimeout(DisplayNone, 300)
    })
}

function DisplayNone() {
    htmlPopUp.style = "display: none;"
}

function ListenToClickToggleLocker() {
    htmlLockerSvg.addEventListener('click', function() {
        htmlPopUp.style = "display:block"
        htmlPopUp.style.animation = "fadein 0.5s"
        htmlBackground.style = "filter: blur(8px);"
        ListenToCancel();
        ListenToOpen();
    })
}

function ListenToClickOpmerkingBtn() {
    htmlOpmerkingBtn.addEventListener('click', function() {
        if (htmlOpmerkingClicked) {
            htmlOpmerkingBtn.style = "background-color : var(--blue-accent-color);"
            htmlOpmerkingBtn.innerHTML = "Opmerking toevoegen"
            console.log("Annuleer")
            htmlSubmitBtn.style = "display: none;"
            htmlOpmerkingDiv.style = "display: none;"
            htmlOpmerkingClicked = false;
        } else {
            htmlOpmerkingDiv.style = "display: block;"
            htmlOpmerkingBtn.innerHTML = "Annuleren"
            htmlOpmerkingBtn.style = "background-color : var(--status-outofuse);"
            console.log("Schrijf een opmerking")
            htmlSubmitBtn.style = "display: block;"
            htmlExtraContent.style.animation = "fadein 0.5s"
            htmlOpmerkingClicked = true;
        }
    })
}

const getOverzicht = function() {
    handleData(`https://smartlockerfunctions.azurewebsites.net/api/lockers`, showOverview);
};

const getLockerDetail = function(id) {
    handleData(`https://smartlockerfunctions.azurewebsites.net/api/lockers/${id}`, showLocker);
};

document.addEventListener('DOMContentLoaded', function() {
    console.info('DOM geladen');
    htmlLockerTitle = document.querySelector('.js-lockertitle');
    htmlOverview = document.querySelector('.js-overview');
    htmlBeschikbaar = document.querySelector('.js-beschikbaar');
    htmlLockerSvg = document.querySelector(".js-toggleLocker")
    htmlInstructions = document.querySelector(".js-instructions")
    htmlOpmerkingBtn = document.querySelector('.js-opmerkingbtn')
    htmlOpmerkingDiv = document.querySelector('.js-opmerkingdiv')
    htmlSubmitBtn = document.querySelector('.js-submit');
    htmlPopUp = document.querySelector('.js-popup')
    htmlPopUpCancel = document.querySelector('.js-popup-cancel')
    htmlBackground = document.querySelector('.js-background')
    htmlPopUpOpen = document.querySelector('.js-popup-open')
    htmlExtraContent = document.querySelector('.js-extra-content')
    htmlBackArrow = document.querySelector('.js-backarrow')
    if (htmlOverview) {
        //deze code wordt gestart vanaf overzichtpagina.html
        getOverzicht();
    }
    if (htmlLockerTitle) {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        //deze code wordt gestart vanaf lockerdetailpagina.html
        getLockerDetail(id);
    }
});