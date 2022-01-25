let htmlSport;
let htmlStartHour;
let htmlStartMinute;
let htmlEndHour;
let htmlEndMinute;
let htmlEnd;
let htmlConfirm;
let htmlDate;

function ListenToChangeDate(){
    htmlDate.addEventListener('change',function(){
        getReservations()
    })
}

function getBusyTimestamps(todaysReservations) {
    let dict_busy_timestamps = {}
    for (let i = 0; i < todaysReservations.length; i++) {
        let start = todaysReservations[i].slice(0, 8)
        let end = todaysReservations[i].slice(9, 17)
        let startHour = parseInt(start.slice(0, 2))
        let endHour = parseInt(end.slice(0, 2))
        let startMinute = parseInt(start.slice(3, 5))
        let endMinute = parseInt(end.slice(3, 5))
        // De uren zijn hetzelfde
        if (startHour == endHour) {
            if (! dict_busy_timestamps.hasOwnProperty(startHour)) {
                dict_busy_timestamps[startHour] = []
            }
            for (let busyMinutes = startMinute; busyMinutes <= endMinute; busyMinutes++) {
                dict_busy_timestamps[startHour].push(busyMinutes)
            }
        } else {
            if (! dict_busy_timestamps.hasOwnProperty(startHour)) {
                dict_busy_timestamps[startHour] = []
            }
            for (let busyMinutes = startMinute; busyMinutes <= 59; busyMinutes++) {
                dict_busy_timestamps[startHour].push(busyMinutes)
            }
            if (! dict_busy_timestamps.hasOwnProperty(endHour)) {
                dict_busy_timestamps[endHour] = []
            }
            for (let busyMinutes = 0; busyMinutes <= endMinute; busyMinutes++) {
                dict_busy_timestamps[endHour].push(busyMinutes)
            }
        }
    }
    // Nu heb ik een array van alle tijdstippen die bezet zijn
    return dict_busy_timestamps
}


function getTodaysReservations(jsonObject) {
    let arr_res_today = []
    let chosenDateValue = htmlDate.value.toString()
    let chosenDate = new Date(chosenDateValue)
    for (let reservation of jsonObject) {
        let reservationStartDate = new Date(reservation.startTime)
        console.log(reservationStartDate.toLocaleDateString())
        let reservationEndDate = new Date(reservation.endTime)
        if (chosenDate.toLocaleDateString() == reservationStartDate.toLocaleDateString()) {
            arr_res_today.push(reservationStartDate.toLocaleTimeString() + "-" + reservationEndDate.toLocaleTimeString())
        }
    }
    return arr_res_today
}

function ListenToSelectHours() {
    htmlStartHour.addEventListener('click', function () {})
}

function ModifySelect(jsonObject) {
    let todaysReservations = getTodaysReservations(jsonObject)
    console.log(todaysReservations)
    let busy_timestamps = getBusyTimestamps(todaysReservations)
    console.log(busy_timestamps)
    htmlStartHour.addEventListener('click', function () {
        let chosenHour = parseInt(htmlStartHour.value);
        if (busy_timestamps[chosenHour]) {
            for (let option of htmlStartMinute) {
                let optionValue = parseInt(option.value)
                if (busy_timestamps[chosenHour].includes(optionValue)) {
                    option.disabled = true
                } else {
                    option.disabled = false
                }
            }
            for (let option of htmlEndMinute) {
                let optionValue = parseInt(option.value)
                if (busy_timestamps[chosenHour].includes(optionValue)) {
                    option.disabled = true
                } else {
                    option.disabled = false
                    option.selected = true
                }
            }
        }
        htmlEndHour.value = chosenHour;
        let option
        for (let hour = 5; hour < 23; hour++) {
            option = document.querySelector(`.js-end-holder option[value="${hour}"]`)
            if (hour < chosenHour) {
                option.disabled = true
            } else {
                option.disabled = false
            } htmlStartMinute.addEventListener('click', function () {
                for (let minute = 0; minute < 60; minute++) {
                    option = document.querySelector(`.js-end-minute`)[value = minute]
                    if (minute <= parseInt(htmlStartMinute.value)) {
                        option.disabled = true
                    }
                    option.selected = true
                }
            })
        }
    })
    ListenToChangeDate()
}

function FillOptionsSelect() {
    for (let hour = 5; hour < 23; hour++) {
        htmlStartHour.innerHTML += `<option value="${hour}">${hour}</option>`
        htmlEndHour.innerHTML += `<option value="${hour}">${hour}</option>`

    }
    for (let minute = 0; minute < 60; minute++) {
        if (minute < 10) {
            htmlStartMinute.innerHTML += `<option value="${minute}">0${minute}</option>`
            htmlEndMinute.innerHTML += `<option value="${minute}">0${minute}</option>`
        } else {
            htmlStartMinute.innerHTML += `<option value="${minute}">${minute}</option>`
            htmlEndMinute.innerHTML += `<option value="${minute}">${minute}</option>`
        }

    }
}

function ShowError(htmlelement, foutboodschap) {
    console.log('Fout weergeven')
    let title = htmlelement.previousElementSibling
    console.log(title)
    title.classList.add('error_message')
    htmlelement.classList.add('error_message')
    window.alert(foutboodschap)
}


const showLockerReservation = function (jsonObject) {
    htmlSport.innerHTML = jsonObject.sport;
    FillOptionsSelect();
    getReservations();
    // let now = new Date(0)
    // let offset = new Date().getTimezoneOffset()
    // now.setFullYear(new Date().getFullYear())
    // now.setMonth(new Date().getMonth())
    // now.setDate(new Date().getDate())
    // now.setHours(new Date().getHours() - offset / 60)
    // now.setMinutes(new Date().getMinutes())
    // htmlStart.min = now.toISOString().split('.')[0];
    // htmlStart.value = now.toISOString().split('.')[0];
    // end = now
    // end.setHours(new Date().getHours() - offset / 30)
    // end.setMinutes(new Date().getMinutes() + 30)
    // htmlEnd.value = end.toISOString().split('.')[0];
    // htmlEnd.min = end.toISOString().split('.')[0];

    ListenToConfirmRegistration()
}

const getReservations = function () {
    handleData(`${APIURI}/reservations`, ModifySelect, null, 'GET', null, userToken);
};

function ListenToConfirmRegistration() {
    htmlConfirm.addEventListener('click', function () {
        if (error == false) { // handleData(`${APIURI}/reservations/11cf21d4-03ef-4e0a-8a17-27c26ae80abd`, null, null, 'POST', JSON.stringify(body), userToken);
        }

    })
}

const getLockerReservation = function () {
    handleData(`${APIURI}/lockers/11cf21d4-03ef-4e0a-8a17-27c26ae80abd`, showLockerReservation, null, 'GET', null, userToken);
};

document.addEventListener('DOMContentLoaded', function () {
    htmlSport = document.querySelector('.js-sport')
    htmlStartHour = document.querySelector('.js-start-hour')
    htmlStartMinute = document.querySelector('.js-start-minute')
    htmlEndHour = document.querySelector('.js-end-hour')
    htmlEndMinute = document.querySelector('.js-end-minute')
    htmlConfirm = document.querySelector('.js-addreg_confirm')
    htmlDate = document.querySelector('.js-addreg_date')
    let todayDate = new Date()
    htmlDate.value = todayDate.getFullYear() + "-" + todayDate.getMonth()+1 + "-" + todayDate.getDate()
    // const urlParams = new URLSearchParams(window.location.search);
    // const id = urlParams.get('id');
    getLockerReservation() // later nog met id meesturen

});
