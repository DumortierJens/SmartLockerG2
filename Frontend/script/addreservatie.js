let htmlSport;
let htmlStartHour;
let htmlStartMinute;
let htmlEndHour;
let htmlEndMinute;
let htmlEnd;
let htmlConfirm;
let htmlDate;
let arrayStartHours = [];
let arrayStartMinutes = [];
let arrayEndHours = [];
let arrayEndMinutes = [];
let arrayAvailableMinutesBefore = [];
let arrayAvailableMinutesAfter = [];
let reservationDuration = false

function ListenToSelectHours() {
    htmlStartHour.addEventListener('click', function () {
        let chosenHour = parseInt(this.value)
        console.log(chosenHour)
        if (arrayStartHours.includes(chosenHour) || arrayEndHours.includes(chosenHour)) {
            let indexStart = arrayStartHours.indexOf(chosenHour)
            let indexEnd = arrayEndHours.indexOf(chosenHour)
            console.log("index start", indexStart)
            console.log("index einde", indexEnd)

            if (indexEnd == indexStart) { // Gekozen uur mss in conflict met zowel start- als einduur
                let startMinutes = arrayStartMinutes[indexEnd]
                let endMinutes = arrayEndMinutes[indexEnd]
                for (let option of htmlStartMinute) {
                    let optionValue = parseInt(option.value)
                    if (optionValue >= startMinutes && optionValue <= endMinutes) {
                        option.disabled = true;
                        reservationDuration = true
                    } else if (! reservationDuration) {
                        arrayAvailableMinutesBefore.push(optionValue)
                    } else if (reservationDuration) {
                        arrayAvailableMinutesAfter.push(optionValue)
                    }
                }
                htmlEndHour.value = chosenHour
                htmlStartMinute.addEventListener('click', function () {
                    if (parseInt(htmlStartMinute.value) in arrayAvailableMinutesBefore) {
                        htmlEndMinute.value = arrayAvailableMinutesBefore[arrayAvailableMinutesBefore.length - 1].toString()
                    } else {
                        if (arrayAvailableMinutesAfter[arrayAvailableMinutesAfter.length - 1] > 45) {
                            htmlEndHour.value = (parseInt(htmlStartHour.value) + 1).toString()
                            let startHourNext = arrayStartHours[indexEnd + 1]
                            console.log(startHourNext)
                            if (parseInt(htmlEndHour.value) == startHourNext){
                                console.log('ok')
                                let startMinuteNext = arrayStartMinutes[indexEnd +1]
                                console.log(startMinuteNext)
                                for (let option of htmlEndMinute){
                                    let optionValue = parseInt(option.value)
                                    if (optionValue >= startMinuteNext){
                                        option.disabled = true;
                                    }
                                    else{
                                        htmlEndMinute.value = optionValue
                                    }
                                }
                            }
                
                        } else {
                            htmlEndMinute.value = arrayAvailableMinutesAfter[arrayAvailableMinutesAfter.length - 1]
                        }
                    }
                })

            }

            if (indexStart > -1) { // Gekozen uur mss in conflict met startuur van een reservatie
            }
            if (indexEnd > -1) { // Gekozen uur mss in conflict met einduur van een reservatie
            }
        }
    })
}

function ModifySelect(jsonObject) {
    console.log(jsonObject)
    for (let reservation in jsonObject) {
        let date = new Date(jsonObject[reservation].startTime)
        let dateHour = date.getHours();
        date.setHours(dateHour + (date.getTimezoneOffset() / 60))
        let dateString = date.toLocaleTimeString()
        arrayStartHours.push(parseInt(dateString.slice(0, 2)))
        arrayStartMinutes.push(parseInt(dateString.slice(3, 5)))

        date = new Date(jsonObject[reservation].endTime)
        dateHour = date.getHours();
        date.setHours(dateHour + (date.getTimezoneOffset() / 60))
        dateString = date.toLocaleTimeString()
        arrayEndHours.push(parseInt(dateString.slice(0, 2)))
        arrayEndMinutes.push(parseInt(dateString.slice(3, 5)))
    }
    console.log("starthours", arrayStartHours)
    console.log("startminutes", arrayStartMinutes)
    console.log("endhours", arrayEndHours)
    console.log("endminutes", arrayEndMinutes)

    ListenToSelectHours()
}

function FillOptionsSelect() {
    for (let hour = 5; hour < 23; hour++) {
        if (hour < 10) {
            htmlStartHour.innerHTML += `<option value="${hour}">0${hour}</option>`
            htmlEndHour.innerHTML += `<option value="${hour}">0${hour}</option>`
        } else {
            htmlStartHour.innerHTML += `<option value="${hour}">${hour}</option>`
            htmlEndHour.innerHTML += `<option value="${hour}">${hour}</option>`
        }
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
        var elements = document.getElementsByClassName('error_message');
        console.log(elements)
        for (let element of elements) {
            element.classList.remove("error_message")
            if (element.nextElementSibling) {
                element.nextElementSibling.classList.remove("error_message")
            } else {
                element.previousElementSibling.classList.remove("error_message")
            }
        }
        let startTime = htmlStart.value;
        let endTime = htmlEnd.value;
        var start = new Date(startTime)
        var end = new Date(endTime)
        var now = new Date()
        let error = false
        if (start > end) {
            error = true
            ShowError(htmlEnd, "Het eindtijdstip moet later liggen dan het starttijdstip.")
            return
        }
        if (start < now) {
            error = true
            ShowError(htmlStart, "Het starttijdstip ligt in het verleden.")
            return
        }
        if (end < now) {
            error = true
            ShowError(htmlEnd, "Het eindtijsstip ligt in het verleden")
            return
        }
        var hours = Math.abs(end - start) / 36e5;
        console.log(hours)
        if (hours > 1.5) {
            error = true
            htmlStart.classList.add("error_message")
            htmlStart.previousElementSibling.classList.add("error_message")
            htmlEnd.classList.add("error_message")
            htmlEnd.previousElementSibling.classList.add("error_message")
            window.alert("Je hebt te lang geboekt!")
            return
        }
        const body = {
            startTime,
            endTime
        }
        console.log(body)
        // ook nog checken of er geen andere reservatie is
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
    // const urlParams = new URLSearchParams(window.location.search);
    // const id = urlParams.get('id');
    getLockerReservation() // later nog met id meesturen

});
