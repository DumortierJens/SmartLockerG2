let lockerStatus = "locked"
let toggleLockerSvg;
let toggleInstructions;
let opmerkingbtn;
let opmerkingdiv;
let schrijfOpmerking = true;
let submitbtn;
let popup;
let popupterug;
let background;
let popupopen;
let extracontent;
let backarrow;
let lockerTitle;


function ListenToClickBackArrow() {
    backarrow.addEventListener('click', function() {
        window.location.replace(`http://${window.location.hostname}:5500/overzichtpagina.html`);
    })
}

function DisplayNone() {
    popup.style = "display: none;"
}

function ListenToTerug() {
    popupterug.addEventListener('click', function() {
        background.style = ""
        popup.style.animation = "fadeout 0.3s"
        setTimeout(DisplayNone, 300)
    })
}

function ListenToOpen() {
    popupopen.addEventListener('click', function() {
        background.style = ""
        toggleLockerSvg.innerHTML = getSvg('locker open');
        toggleInstructions.innerHTML = "Vergeet de locker niet manueel te sluiten"
        popup.style.animation = "fadeout 0.3s"
        setTimeout(DisplayNone, 300)
    })
}

function ListenToClickToggleLocker() {
    toggleLockerSvg.addEventListener('click', function() {
        popup.style = "display:block"
        popup.style.animation = "fadein 0.5s"
        background.style = "filter: blur(8px);"
        ListenToTerug();
        ListenToOpen();
    })
}

function ListenToClickOpmerkingBtn() {
    opmerkingbtn.addEventListener('click', function() {
        if (schrijfOpmerking) {
            opmerkingdiv.style = "display: block;"
            opmerkingbtn.innerHTML = "Annuleren"
            opmerkingbtn.style = "background-color : var(--status-unavailable);"
            console.log("Schrijf een opmerking")
            schrijfOpmerking = false;
            submitbtn.style = "display: block;"
            extracontent.style.animation = "fadein 0.5s"
        } else {
            opmerkingbtn.style = "background-color : var(--blue-accent-color);"
            opmerkingbtn.innerHTML = "Opmerking toevoegen"
            schrijfOpmerking = true
            console.log("Annuleer")
            submitbtn.style = "display: none;"
            opmerkingdiv.style = "display: none;"
        }
    })
}

function init() {
    console.log('DOM Geladen')
    toggleLockerSvg = document.querySelector(".js-toggleLocker")
    toggleInstructions = document.querySelector(".locker_detail_content_toggleInstructions")
    opmerkingbtn = document.querySelector('.js-opmerkingbtn')
    opmerkingdiv = document.querySelector('.div_locker_detail_opmerking')
    submitbtn = document.querySelector('.js-submit');
    popup = document.querySelector('.js-popup')
    popupterug = document.querySelector('.js-popup-terug')
    background = document.querySelector('.locker_detail_blur')
    popupopen = document.querySelector('.js-popup-open')
    extracontent = document.querySelector('.locker_detail_extra_content')
    backarrow = document.querySelector('.js-backarrow')
    lockerTitle = document.querySelector('.js-lockertitle')
    ListenToClickToggleLocker();
    ListenToClickOpmerkingBtn(schrijfOpmerking);
    ListenToClickBackArrow();
}

document.addEventListener('DOMContentLoaded', init)