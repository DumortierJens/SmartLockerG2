const callbackToggleBlock = function (obj) {
    window.location.reload();
};

const showUserProfileAdmin = function (user) {
    console.log(user);

    document.querySelector(".js-profile-picture").src = user.picture;
    document.querySelector(".js-name").innerHTML = user.name;
    document.querySelector(".js-email").innerHTML = user.email;
    document.querySelector(".js-created").innerHTML = new Date(user.userCreated).toLocaleDateString("nl-BE");
    document.querySelector(".js-block-icon").innerHTML = user.isBlocked ? "block" : "check_circle";

    listenToToggleBlock(user.id, user.isBlocked);
    listenToUserReservations(user.id);
};

function listenToToggleBlock(id, isBlocked) {
    document.querySelector('.js-block').addEventListener('click', function () {
        handleData(`${APIURI}/users/${id}/${isBlocked ? "unblock" : "block"}`, callbackToggleBlock, null, 'POST', null, userToken);
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