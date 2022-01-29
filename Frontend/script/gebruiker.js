const callbackReloadPage = function(user) {
    window.location.reload();
};

const showUserProfileAdmin = function(user) {
    console.log(user);

    document.querySelector(".js-profile-picture").src = user.picture;
    document.querySelector(".js-name").innerHTML = user.name;
    document.querySelector(".js-email").innerHTML = user.email;
    document.querySelector(".js-tel").innerHTML = user.tel;
    document.querySelector(".js-created").innerHTML = new Date(user.userCreated).toLocaleDateString("nl-BE");
    document.querySelector(".js-block-icon").innerHTML = user.isBlocked ? "check_circle" : "block";
    document.querySelector(".js-block-text").innerHTML = user.isBlocked ? "Deblokkeren" : "Blokkeren";

    listenToToggleBlock(user.id, user.isBlocked);
};

const listenToToggleBlock = function(id, isBlocked) {
    const htmlBlock = document.querySelector('.js-block');
    htmlBlock.addEventListener('click', function() {
        handleData(`${APIURI}/users/${id}/${isBlocked ? "unblock" : "block"}`, callbackReloadPage, null, 'POST', null, userToken);
    });
};

const listenToUserReservations = function(id) {
    document.querySelector('.js-reservations').addEventListener('click', function() {
        window.location.href = `${location.origin}/reservaties${WEBEXTENTION}?users=${id}`;
    });
};

const listenToUserActivities = function(id) {
    document.querySelector('.js-activities').addEventListener('click', function() {
        window.location.href = `${location.origin}/activiteiten${WEBEXTENTION}?users=${id}`;
    });
};

const getUserProfileAdmin = function(id) {
    handleData(`${APIURI}/users/${id}`, showUserProfileAdmin, null, 'GET', null, userToken);
};

document.addEventListener('DOMContentLoaded', function() {
    const htmlPageUserProfileAdmin = document.querySelector('.js-user-profile-admin-page');

    if (htmlPageUserProfileAdmin) {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        getUserProfileAdmin(id);
        listenToUserReservations(id);
        listenToUserActivities(id)
    }
});