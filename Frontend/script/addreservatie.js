let htmlSport;
let htmlStart;
let htmlEnd;
let htmlConfirm;

function ShowError(htmlelement, foutboodschap) {
    console.log('Fout weergeven');
    let title = htmlelement.previousElementSibling;
    console.log(title);
    title.classList.add('error_message');
    htmlelement.classList.add('error_message');
    window.alert(foutboodschap);
}


const showLockerReservation = function (jsonObject) {
    htmlSport.innerHTML = jsonObject.sport;
    let now = new Date(0);
    let offset = new Date().getTimezoneOffset();
    now.setFullYear(new Date().getFullYear());
    now.setMonth(new Date().getMonth());
    now.setDate(new Date().getDate());
    now.setHours(new Date().getHours() - offset / 60);
    now.setMinutes(new Date().getMinutes());
    htmlStart.value = now.toISOString().split('.')[0];
    end = now;
    end.setHours(new Date().getHours() - offset / 30);
    end.setMinutes(new Date().getMinutes() + 30);
    htmlEnd.value = end.toISOString().split('.')[0];

    ListenToConfirmRegistration();
};

function ListenToConfirmRegistration() {
    htmlConfirm.addEventListener('click', function () {
        var elements = document.getElementsByClassName('error_message');
        console.log(elements);
        for (let element of elements) {
            element.classList.remove("error_message");
            if (element.nextElementSibling) {
                element.nextElementSibling.classList.remove("error_message");
            } else {
                element.previousElementSibling.classList.remove("error_message");
            }
        }
        let startTime = htmlStart.value;
        let endTime = htmlEnd.value;
        var start = new Date(startTime);
        var end = new Date(endTime);
        var now = new Date();
        let error = false;
        if (start > end) {
            error = true;
            ShowError(htmlEnd, "Het eindtijdstip moet later liggen dan het starttijdstip.");
            return;
        }
        if (start < now) {
            error = true;
            ShowError(htmlStart, "Het starttijdstip ligt in het verleden.");
            return;
        }
        if (end < now) {
            error = true;
            ShowError(htmlEnd, "Het eindtijsstip ligt in het verleden");
            return;
        }
        var hours = Math.abs(end - start) / 36e5;
        console.log(hours);
        if (hours > 1.5) {
            error = true;
            htmlStart.classList.add("error_message");
            htmlStart.previousElementSibling.classList.add("error_message");
            htmlEnd.classList.add("error_message");
            htmlEnd.previousElementSibling.classList.add("error_message");
            window.alert("Je hebt te lang geboekt!");
            return;
        }
        const body = {
            startTime,
            endTime
        };
        console.log(body);
        // ook nog checken of er geen andere reservatie is
        if (error == false) {
            // handleData(`${APIURI}/reservations/11cf21d4-03ef-4e0a-8a17-27c26ae80abd`, null, null, 'POST', JSON.stringify(body), userToken);
        }

    });
}

const getLockerReservation = function () {
    handleData(`${APIURI}/lockers/11cf21d4-03ef-4e0a-8a17-27c26ae80abd`, showLockerReservation, null, 'GET', null, userToken);
};

document.addEventListener('DOMContentLoaded', function () {
    htmlSport = document.querySelector('.js-sport');
    htmlStart = document.querySelector('.js-addreg_start');
    htmlEnd = document.querySelector('.js-addreg_end');
    htmlConfirm = document.querySelector('.js-addreg_confirm');
    // const urlParams = new URLSearchParams(window.location.search);
    // const id = urlParams.get('id');
    getLockerReservation(); // later nog met id meesturen

});