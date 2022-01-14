let htmlLockerSvg, htmlInstructions, htmlOpmerkingBtn, htmlOpmerkingDiv, htmlSubmitBtn,
    htmlPopUp, htmlPopUpCancel, htmlBackground, htmlPopUpOpen, htmlExtraContent, htmlBackArrow;
let htmlOpmerkingClicked = false;


function DisplayNone() {
    htmlPopUp.style = "display: none;"
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

function init() {
    console.log('DOM Geladen')
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
    ListenToClickToggleLocker();
    ListenToClickOpmerkingBtn(htmlOpmerkingClicked);
}

document.addEventListener('DOMContentLoaded', init)