let jsonUser

const showAdminProfileAdmin = function (user) {
    jsonUser = user
    document.querySelector(".js-profile-picture").src = user.picture;
    document.querySelector(".js-name").innerHTML = user.name;
    document.querySelector(".js-email").innerHTML = user.email;
    document.querySelector(".js-created").innerHTML = new Date(user.userCreated).toLocaleDateString("nl-BE");
    document.querySelector(".js-block-text").innerHTML = "Remove Admin";

    listenToRemoveAdmin(user.id);
};

const listenToRemoveAdmin = function (id) {
    document.querySelector(".js-block").addEventListener('click', function () {
        handleData(`${APIURI}/users/${id}/rmadmin`, showAdminRemoved, null, 'POST', null, userToken);
    })
}

const showAdminRemoved = function () {
    alert(`${jsonUser.name} is geen admin meer`)
    window.location.href = `${location.origin}/admins${WEBEXTENTION}`;
}

const getUserProfileAdmin = function (id) {
    handleData(`${APIURI}/users/${id}`, showAdminProfileAdmin, null, 'GET', null, userToken);
};

document.addEventListener('DOMContentLoaded', function () {
    const htmlPageUserProfileAdmin = document.querySelector('.js-user-profile-admin-page');

    if (htmlPageUserProfileAdmin) {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        getUserProfileAdmin(id);
    }
});