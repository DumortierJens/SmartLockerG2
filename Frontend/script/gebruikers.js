let htmlUsersContent;

const showUsers = function(jsonObject) {
    htmlUsersContent.innerHTML = ``;
    console.log(jsonObject);
    for (i = 0; i < jsonObject.length; i++) {
        console.log(jsonObject[i]);
        htmlUsersContent.innerHTML += `<div class="locker_container js-user" data-id="${jsonObject[i].id}">
        <div class="locker pointer users_container flex">
            <img class="user_picture" src="${jsonObject[i].picture}" alt="">
            <p class="locker_name">${jsonObject[i].name}</p>
            <div class="gebruiker_icon">
            <span class="material-icons-outlined">
chevron_right
</span></div>
        </div>
        
    </div>`;
    };
    ListenToClickUser();
};

function ListenToClickUser() {
    const buttons = document.querySelectorAll('.js-user');
    for (const btn of buttons) {
        btn.addEventListener('click', function() {
            //console.log(this);
            const id = btn.dataset.id;
            window.location.href = `${location.origin}/gebruiker${WEBEXTENTION}?id=${id}`;
        });
    };
};

const getUsers = function() {
    handleData(`${APIURI}/users`, showUsers, null, 'GET', null, userToken);
};

document.addEventListener('DOMContentLoaded', function() {
    htmlUsersContent = document.querySelector('.js-users');
    getUsers();
});