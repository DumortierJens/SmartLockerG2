const showUserProfileAdmin = function (user) {
    console.log(user);

    document.querySelector(".js-profile-picture").src = user.picture;
    document.querySelector(".js-name").innerHTML = user.name;
    document.querySelector(".js-email").innerHTML = user.email;
    document.querySelector(".js-created").innerHTML = new Date(user.userCreated).toLocaleDateString("nl-BE");
    document.querySelector(".js-block-icon").innerHTML = user.isBlocked ? "check_circle" : "block";
    document.querySelector(".js-block-text").innerHTML = user.isBlocked ? "Deblockkeren" : "Blokkeren";

    listenToToggleBlock(user.id, user.isBlocked);
    listenToUserReservations(user.id);
};

function listenToToggleBlock(id, isBlocked) {
    document.querySelector('.js-block').addEventListener('click', function () {
        handleData(`${APIURI}/users/${id}/${isBlocked ? "unblock" : "block"}`, showUserProfileAdmin, null, 'POST', null, userToken);
    });
}

function listenToUserReservations(id) {
    document.querySelector('.js-reservations').addEventListener('click', function () {
        window.location.href = `${location.origin}/profielreservatie${WEBEXTENTION}?id=${id}`;
    });
}

const getUserProfileAdmin = function (id) {
    handleData(`${APIURI}/users/${id}`, showUserProfileAdmin, null, 'GET', null, userToken);
};

document.addEventListener('DOMContentLoaded', function () {
    const htmlPageUserProfileAdmin = document.querySelector('.js-user-profile-admin-page');

    if (htmlPageUserProfileAdmin) {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        getUserProfileAdmin(id);
    }
});