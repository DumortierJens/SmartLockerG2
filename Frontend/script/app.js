'use strict';

let currentLockerID;

let htmlLockerTitle, htmlOverview, htmlSoccer, htmlBasketball, htmlBeschikbaar;

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