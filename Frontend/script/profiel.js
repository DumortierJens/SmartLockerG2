let htmlName, htmlEmail, htmlBirhtday, htmlPicture, htmlUserCreated, htmlDelete, htmlAfmelden, htmlReservationsUser;


const getData = function () {
    handleData(`${APIURI}/users/me`, showData, null, 'GET', null, userToken);
};

const convertDateTime = function (datetime) {
    const d = new Date(datetime);
    var month = new Array();
    month[0] = "01";
    month[1] = "02";
    month[2] = "03";
    month[3] = "04";
    month[4] = "05";
    month[5] = "06";
    month[6] = "07";
    month[7] = "08";
    month[8] = "09";
    month[9] = "10";
    month[10] = "11";
    month[11] = "12";
    return d.getDate() + "/" + month[d.getMonth()] + "/" + d.getFullYear();
};

const showData = function (jsonObject) {
    console.log(jsonObject);
    htmlName = jsonObject.name;
    htmlEmail = jsonObject.email;
    htmlBirhtday = jsonObject.birthday;
    htmlPicture = jsonObject.picture;
    htmlUserCreated = jsonObject.userCreated;
    console.log(htmlName, htmlEmail, htmlBirhtday, htmlPicture, htmlUserCreated);
    document.querySelector(".js-profile_name").innerHTML = htmlName;
    document.querySelector(".js-birthday").innerHTML = convertDateTime(htmlBirhtday);
    document.querySelector(".js-profile_created").innerHTML = convertDateTime(htmlUserCreated);
    document.querySelector(".js-email").innerHTML = htmlEmail;
    document.querySelector('.js-profile_picture').src = htmlPicture;
    htmlDelete = document.querySelector('.js-delete');
    htmlAfmelden = document.querySelector('.js-afmelden');
    htmlReservationsUser = document.querySelector('.js-reservations-user');
    ListenToClickBackArrow();
    ListenToClickAfmeldenUser();
    ListenToClickReservationsUser();
    ListenToClickDeleteUser();
};

function ListenToClickAfmeldenUser() {
    htmlAfmelden.addEventListener('click', function () {
        console.log("popup om te bevestigen, Afmelden van zichzelf via usertoken en ga naar index.html");
    });
}

function ListenToClickReservationsUser() {
    htmlReservationsUser.addEventListener('click', function () {
        window.location.href = `${location.origin}/profielreservatie${WEBEXTENTION}`;
        console.log('Ga naar profielreservatie.html en toont reservaties van zichzelf via usertoken');
    });
}

document.addEventListener("DOMContentLoaded", function () {
    getData();
});