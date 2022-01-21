let htmlSport;
let htmlStart;
let htmlEnd;
let htmlConfirm;

const showLockerReservation = function(jsonObject) {
    htmlSport.innerHTML = jsonObject.sport;
    ListenToConfirmRegistration()
}

function ListenToConfirmRegistration() {
    htmlConfirm.addEventListener('click', function() {
        let startTime = htmlStart.value;
        let endTime = htmlEnd.value;
        var start = new Date(startTime)
        var end = new Date(endTime)
        var now = new Date()
        let error = false
        if (start > end) {
            error = true
            console.log("Het eindtijdstip moet later liggen dan het starttijdstip.")
        }
        if (start < now) {
            error = true
            console.log("Het starttijsstip ligt in het verleden.")
        }
        if (end < now) {
            error = true
            console.log("Het eindtijsstip ligt in het verleden.")
        }
        var hours = Math.abs(end - start) / 36e5;
        console.log(hours)
        if (hours > 1.5) {
            error = true
            console.log("Je hebt te lang geboekt")
        }
        const body = {
            startTime,
            endTime
        }
        console.log(body)
            //ook nog checken of er geen andere reservatie is
        if (error = false) {
            handleData(`${APIURI}/reservations/11cf21d4-03ef-4e0a-8a17-27c26ae80abd`, null, null, 'POST', JSON.stringify(body), userToken);
        }

    })
}

const getLockerReservation = function() {
    handleData(`${APIURI}/lockers/11cf21d4-03ef-4e0a-8a17-27c26ae80abd`, showLockerReservation, null, 'GET', null, userToken);
};

document.addEventListener('DOMContentLoaded', function() {
    htmlSport = document.querySelector('.js-sport')
    htmlStart = document.querySelector('.js-addreg_start')
    htmlStart.value =
        htmlEnd = document.querySelector('.js-addreg_end')
    htmlConfirm = document.querySelector('.js-addreg_confirm')
        //const urlParams = new URLSearchParams(window.location.search);
        //const id = urlParams.get('id');
    getLockerReservation() //later nog met id meesturen

});