let htmlSport;
let htmlStartHour;
let htmlStartMinute;
let htmlEndHour;
let htmlEndMinute;
let htmlEnd;
let htmlConfirm;
let htmlDate;

function ListenToChangeDate() {
    htmlDate.addEventListener('change', function () {
        htmlStartHour.value = 5;
        htmlEndHour.value = 5;
        htmlStartMinute.value = 0;
        htmlEndMinute.value = 0;
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
    console.log("Date value", chosenDateValue)
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

function CheckIfValidReservation(busy_timestamps) { // Waarden die voorlopig ingevuld staan ophalen
    let startHour = parseInt(htmlStartHour.value)
    let startMinute = parseInt(htmlStartMinute.value)
    let endHour = parseInt(htmlEndHour.value)
    let endMinute = parseInt(htmlEndMinute.value)

    if (startHour == endHour && startMinute > endMinute || startHour > endHour) {
        console.log("Eindtijdstip moet later liggen dan starttijdstip")
        return
    }

    if (startHour == endHour && startMinute == endMinute) {
        console.log("Beide tijdstippen zijn hetzelfde")
        return
    }

    // Kijken of het niet overlapt met een bestaande reservatie
    let inputString = `${
        addZero(htmlStartHour.value)
    }:${
        addZero(htmlStartMinute.value)
    }:00-${
        addZero(htmlEndHour.value)
    }:${
        addZero(htmlEndMinute.value)
    }:00`
    let inputArray = []
    inputArray.push(inputString)
    console.log(inputArray)
    let new_busy_timestamps = getBusyTimestamps(inputArray)
    console.log(busy_timestamps)
    console.log(new_busy_timestamps)
    for (let key1 in busy_timestamps) {
        for (let key2 in new_busy_timestamps) {
            if (key1 == key2) {
                console.log("Zelfde keys")
                for (let minutes1 of busy_timestamps[key1]) {
                    for (let minutes2 of new_busy_timestamps[key2]) {
                        if (minutes1 == minutes2) {
                            console.log("Tijdstip overlapt met een bestaande reservatie")
                            return
                        }
                    }
                }
            }
        }
    }

    // Kijken of er niet wordt gestart voor de reservatie en geëindigd na de reservatie
    let startPoint = Object.keys(new_busy_timestamps)[0]
    let endPoint = Object.keys(new_busy_timestamps)[Object.keys(new_busy_timestamps).length - 1]

    for (let reservationsHour in busy_timestamps) {
        if (startPoint < parseInt(reservationsHour) && endPoint > parseInt(reservationsHour)) {
            console.log("Tijdstip overlapt met een bestaande reservatie")
            return
        }
    }

    // Kijken of een slot niet langer dan 90 minuten duurt
    let start = new Date("2022-01-01 " + inputString.slice(0, 8))
    let end = new Date("2022-01-01 " + inputString.slice(9, 18))
    console.log(start)
    console.log(end)
    var diff = Math.abs(end - start);
    var minutes = Math.floor((diff / 1000) / 60);
    if (minutes > 90) {
        console.log("Je kan slechts maximum 90 minuten reserveren !")
        return
    }
    console.log("Dit tijdstip is in orde")
}

function SetReservationTime(jsonObject) {
    let todaysReservations = getTodaysReservations(jsonObject)
    console.log(todaysReservations)
    let busy_timestamps = getBusyTimestamps(todaysReservations)
    console.log("busy", busy_timestamps)
    htmlStartHour.addEventListener('change', function () {
        let chosenHour = parseInt(htmlStartHour.value);
        // Als er voor het gekozen uur bezette minuten zijn, disable ze dan:
        if (busy_timestamps[chosenHour]) {
            for (let option of htmlStartMinute) {
                let optionValue = parseInt(option.value)
                if (busy_timestamps[chosenHour].includes(optionValue)) {
                    option.disabled = true
                } else {
                    option.disabled = false
                }
            }
        }
        CheckIfValidReservation(busy_timestamps)
    })
    htmlStartMinute.addEventListener('change', function () {
        CheckIfValidReservation(busy_timestamps)
    })
    htmlEndHour.addEventListener('change', function () {
        let chosenHour = parseInt(htmlEndHour.value);
        // Als er voor het gekozen uur bezette minuten zijn, disable ze dan:
        if (busy_timestamps[chosenHour]) {
            for (let option of htmlEndMinute) {
                let optionValue = parseInt(option.value)
                if (busy_timestamps[chosenHour].includes(optionValue)) {
                    option.disabled = true
                } else {
                    option.disabled = false
                }
            }
        }
        CheckIfValidReservation(busy_timestamps)
    })
    htmlEndMinute.addEventListener('change', function () {
        CheckIfValidReservation(busy_timestamps)
    })
    ListenToChangeDate()
    CheckIfValidReservation(busy_timestamps)
}

function ModifySelect(jsonObject) {
    let todaysReservations = getTodaysReservations(jsonObject)
    console.log(todaysReservations)
    let busy_timestamps = getBusyTimestamps(todaysReservations)
    console.log(busy_timestamps)
    htmlStartHour.addEventListener('click', function () {
        let chosenHour = parseInt(htmlStartHour.value);
        let duringReservation = false
        let beforeReservation = []
        let afterReservation = []
        if (busy_timestamps[chosenHour]) {
            for (let option of htmlStartMinute) {
                let optionValue = parseInt(option.value)
                if (busy_timestamps[chosenHour].includes(optionValue)) {
                    option.disabled = true
                    duringReservation = true
                } else {
                    option.disabled = false
                    if (! duringReservation) {
                        beforeReservation.push(optionValue)

                    } else {
                        afterReservation.push(optionValue)
                    }
                }
            }
            console.log("beschikbaar voor reservatie", beforeReservation)
            console.log("beschikbaar na reservatie", afterReservation)
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
            }
        }
    })
    htmlStartMinute.addEventListener('click', function () {
        for (let minute = 0; minute < 60; minute++) {
            if (htmlEndHour.value != htmlStartHour.value) {
                option = document.querySelector(`.js-end-minute`)[value = minute]
                if (minute <= parseInt(htmlStartMinute.value)) {
                    option.disabled = true
                }
                option.selected = true
            }
        }
        if (htmlStartHour.value == htmlEndHour.value && parseInt(htmlStartMinute.value) > parseInt(htmlEndMinute.value)) {
            if (parseInt(htmlEndHour.value) + 1 < 22) {
                let newEndHour = parseInt(htmlEndHour.value) + 1
                htmlEndHour.value = newEndHour;
            }
        }
    })
    htmlEndMinute.addEventListener('click', function () {
        if (htmlStartHour.value == htmlEndHour.value && parseInt(htmlStartMinute.value) > parseInt(htmlEndMinute.value)) {
            if (parseInt(htmlStartHour.value) - 1 > 5) {
                let newStartHour = parseInt(htmlStartHour.value) - 1
                htmlStartHour.value = newStartHour;
            }
        }
    })
    htmlEndHour.addEventListener('click', function () {
        console.log("Ik ga in de juiste functie")
        if (htmlStartHour.value != htmlEndHour.value) {
            for (let option of htmlEndMinute) {
                let optionValue = parseInt(option.value)
                if (busy_timestamps[parseInt(htmlEndHour.value)]) {
                    if (busy_timestamps[parseInt(htmlEndHour.value)].includes(optionValue)) {
                        option.disabled = true
                    } else {
                        option.disabled = false
                    }
                } else {
                    option.disabled = false
                }
            }
        }

    })
    ListenToChangeDate()
    ListenToConfirmRegistration(busy_timestamps)
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
}

const getReservations = function () {
    handleData(`${APIURI}/reservations`, SetReservationTime, null, 'GET', null, userToken);
};

function addZero(value) {
    if (value < 10) {
        return "0" + value;
    } else {
        return value;
    }
}

function ListenToConfirmRegistration() {
    htmlConfirm.addEventListener('click', function () {
        if (htmlStartHour.value == htmlEndHour.value && htmlStartMinute.value == htmlEndMinute.value) {
            console.log("Kies een langere periode")
            return
        }
        let inputString = `${
            addZero(htmlStartHour.value)
        }:${
            addZero(htmlStartMinute.value)
        }:00-${
            addZero(htmlEndHour.value)
        }:${
            addZero(htmlEndMinute.value)
        }:00`
        let inputArray = []
        inputArray.push(inputString)
        console.log(inputArray)
        // handleData(`${APIURI}/reservations/11cf21d4-03ef-4e0a-8a17-27c26ae80abd`, null, null, 'POST', JSON.stringify(body), userToken);


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
    htmlDate.value = todayDate.getFullYear() + "-" + todayDate.getMonth() + 1 + "-" + todayDate.getDate()
    // const urlParams = new URLSearchParams(window.location.search);
    // const id = urlParams.get('id');
    getLockerReservation() // later nog met id meesturen

});
