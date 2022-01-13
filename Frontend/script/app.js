'use strict';

let currentLockerID;

let htmlLockerTitle, htmlOverview, htmlSoccer, htmlBasketball;

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
        htmlstring += `<g id="${Sport}" data="${sport.id} "class="js-${sport_1}" transform="translate(${translate_location})">
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
        if (sport.status == 'Open') {
            if (sport.sport == "Voetbal") {
                htmlColorFootball.classList.add('svg-avaible');
            } else {
                htmlColorBasketball.classList.add('svg-avaible');
            }

        }
        if (sport.status == 'Buiten gebruik') {
            if (sport.sport == "Voetbal") {
                htmlColorFootball.classList.add('svg-unavaible');
            } else {
                htmlColorBasketball.classList.add('svg-unavaible');
            }
        }
    }

};

const ListenToCLickSport = function() {
    htmlSoccer.addEventListener('click', function() {
        currentLockerID = htmlSoccer.getAttribute('data');
        window.location.replace(`http://${window.location.hostname}:5500/lockerDetail.html?Id=${currentLockerID}`);

    });
    htmlBasketball.addEventListener('click', function() {
        currentLockerID = htmlBasketball.getAttribute('data');
        window.location.replace(`http://${window.location.hostname}:5500/lockerDetail.html?Id=${currentLockerID}`);
    });
}

const getOverzicht = function() {
    handleData(`https://smartlockerfunctions.azurewebsites.net/api/lockers`, showOverview);
};

const getLockerDetail = function() {
    handleData(`https://smartlockerfunctions.azurewebsites.net/api/lockers/${currentLockerID}`, showLocker);
};

document.addEventListener('DOMContentLoaded', function() {
    console.info('DOM geladen');
    htmlLockerTitle = document.querySelector('.js-lockertitle');
    htmlOverview = document.querySelector('.js-overview');
    if (htmlOverview) {
        //deze code wordt gestart vanaf overzichtpagina.html
        getOverzicht();
        htmlSoccer = document.querySelector('.js-soccer')
        htmlBasketball = document.querySelector('.js-basketball')
        ListenToCLickSport()
    }
    if (htmlLockerTitle) {
        //deze code wordt gestart vanaf lockerDetail.html
        getLockerDetail();
    }
});