const showUser = function (user) {
    console.log(user);

    document.querySelector('.js-profile_picture').src = user.picture;
    document.querySelector(".js-name").innerHTML = user.name;
    document.querySelector(".js-email").innerHTML = user.email;
    document.querySelector(".js-created").innerHTML = new Date(user.userCreated).toLocaleDateString("nl-BE");

    ListenToLogout();
    ListenToReservations();
};

function ListenToLogout() {
    document.querySelector('.js-logout').addEventListener('click', function () {
        console.log("popup om te bevestigen, Afmelden van zichzelf via usertoken en ga naar index.html");
        sessionStorage.removeItem('usertoken');
        window.location.reload();
    });
}

function ListenToReservations() {
    document.querySelector('.js-reservations').addEventListener('click', function () {
        window.location.href = `${location.origin}/profielreservatie${WEBEXTENTION}`;
        console.log('Ga naar profielreservatie.html en toont reservaties van zichzelf via usertoken');
    });
}

const getUser = function () {
    handleData(`${APIURI}/users/me`, showUser, null, 'GET', null, userToken);
};

document.addEventListener("DOMContentLoaded", function () {
    getUser();
});