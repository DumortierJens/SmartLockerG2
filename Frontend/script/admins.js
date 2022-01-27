let htmlAdminContent

const showAdmins = function (jsonObject) {
    htmlAdminContent.innerHTML = ``;
    for (i = 0; i < jsonObject.length; i++) {
        console.log(jsonObject[i]);
        htmlAdminContent.innerHTML += `<div class="locker_container js-admin" data-id="${jsonObject[i].id}">
        <div class="locker pointer users_container flex">
            <img class="user_picture" src="${jsonObject[i].picture}" alt="">
            <p class="locker_name">${jsonObject[i].name}</p>
        </div>
    </div>`;
    };
    listenToClickAdmin();
}

const listenToClickAdmin = function () {
    const buttons = document.querySelectorAll('.js-admin');
    for (const btn of buttons) {
        btn.addEventListener('click', function () {
            //console.log(this);
            const id = btn.dataset.id;
            window.location.href = `${location.origin}/admin${WEBEXTENTION}?id=${id}`;
        });
    };
}

const getAdmins = function () {
    handleData(`${APIURI}/users/admin`, showAdmins, null, 'GET', null, userToken);
}

document.addEventListener("DOMContentLoaded", function () {
    htmlAdminContent = document.querySelector('.js-admins')
    getAdmins()
})