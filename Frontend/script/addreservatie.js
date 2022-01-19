let htmlSport;
let htmlStart;
let htmlEnd;
let htmlConfirm;

const showLockerReservation = function(jsonObject) {
    htmlSport.innerHTML = jsonObject.sport;
}

function ListenToConfirmRegistration() {
    htmlConfirm.addEventListener('click', function() {
        let sport = htmlSport.value;
        let start = htmlStart.value;
        let end = htmlEnd.value;
        const body = {
            sport,
            start,
            end
        }
        console.log(body)
        handleData($ `${APIURI}/lockers/reservations`, null, null, 'POST', userToken);
    })
}

const getLockerReservation = function() {
    handleData(`${APIURI}/lockers/11cf21d4-03ef-4e0a-8a17-27c26ae80abd`, showLockerReservation, null, 'GET', null, userToken);
};

document.addEventListener('DOMContentLoaded', function() {
    htmlSport = document.querySelector('.js-sport')
    htmlStart = document.querySelector('.js-addreg_starttime')
    htmlEnd = document.querySelector('.js-addreg_endtime')
    htmlConfirm = document.querySelector('.js-addreg_confirm')
        //const urlParams = new URLSearchParams(window.location.search);
        //const id = urlParams.get('id');
    getLockerReservation() //later nog met id meesturen
        //ListenToConfirmRegistration()
});