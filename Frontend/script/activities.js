const closeAllTabs = function () {
    const htmlTabsAll = document.querySelectorAll('.js-tab');
    for (const htmlTab of htmlTabsAll) {
        htmlTab.querySelector(`.js-arrow`).innerHTML = 'expand_more';
        htmlTab.querySelector(`.js-tab-main`).classList.remove("reservation_more_border");
        htmlTab.querySelector(`.js-tab-details`).style.display = 'none';
    }
};

const listenToTabs = function () {
    const htmlTabs = document.querySelectorAll('.js-tab');

    for (const htmlTab of htmlTabs) {

        const htmlTabMain = htmlTab.querySelector(`.js-tab-main`);
        const htmlTabDetails = htmlTab.querySelector(`.js-tab-details`);
        const htmlArrow = htmlTab.querySelector('.js-arrow');

        const id = htmlTab.dataset.id;

        htmlArrow.addEventListener('click', function () {
            if (htmlArrow.innerHTML == 'expand_more') {
                closeAllTabs();
                htmlArrow.innerHTML = 'expand_less';
                htmlTabDetails.style.display = 'Block';
                htmlTabMain.classList.add("reservation_more_border");
            }
            else {
                htmlArrow.innerHTML = 'expand_more';
                htmlTabDetails.style.display = 'none';
                htmlTabMain.classList.remove("reservation_more_border");
            }
        });
    };
};

const showRegistration = function (registration) {
    const startTime = new Date(registration.startTime).toLocaleString('nl-BE');
    const endTime = new Date(registration.endTime).toLocaleString('nl-BE');

    for (const htmlStatus of document.querySelectorAll(`.js-status-registration-${registration.id}`)) {
        if (endTime == "1/1/1 00:00:00") {
            htmlStatus.classList.add('status_bezig_rect');
            htmlStatus.innerHTML = 'Bezig';
        }
        else {
            htmlStatus.classList.add('status_verlopen_rect');
            htmlStatus.innerHTML = 'Verlopen';
        }
    }
    for (const htmlStart of document.querySelectorAll(`.js-start-registration-${registration.id}`)) {
        htmlStart.innerHTML = startTime;
    }
    for (const htmlEnd of document.querySelectorAll(`.js-end-registration-${registration.id}`)) {
        htmlEnd.innerHTML = endTime != "1/1/1 00:00:00" ? endTime : "";
    }
    for (const htmlNote of document.querySelectorAll(`.js-note-registration-${registration.id}`)) {
        htmlNote.innerHTML = registration.note;
    }
};

const showUser = function (user) {
    for (const htmlName of document.querySelectorAll(`.js-name-${user.id}`)) {
        htmlName.innerHTML = user.name;
    }
    for (const htmlPicture of document.querySelectorAll(`.js-picture-${user.id}`)) {
        htmlPicture.src = user.picture;
    }
};

const showLocker = function (locker) {
    for (const htmlName of document.querySelectorAll(`.js-name-locker-${locker.id}`)) {
        htmlName.innerHTML = locker.name;
    }
};

const showRegistrations = function (registrations) {
    console.log(registrations);

    let lockers = [];
    let users = [];

    let htmlString = '';
    for (const registration of registrations) {

        if (!lockers.includes(registration.lockerId)) lockers.push(registration.lockerId);
        if (!users.includes(registration.userId)) users.push(registration.userId);

        htmlString += `<div class="reservation_container js-tab js-tab-${registration.id}" data-id="${registration.id}">
            <div class="js-tab-main reservation flex">
                <img class="user_picture js-picture-${registration.userId}" src="/img/profile_template.jpg" alt="user-picture" />
                <div class="reservation_grid">
                    <p class="reservation_name js-name-${registration.userId}"></p>
                    <p class="reservation_date">${new Date(registration.startTime).toLocaleString('nl-BE')}</p>
                </div>
                <span class="arrow_more js-arrow material-icons-outlined">expand_more</span>
            </div>
            <div class="js-tab-details" style="display: none; animation: fadein 0.5s">
                <div class="reservation_detail flex">
                    <p class="reservation_detail_title">Locker</p>
                    <p class="reservation_detail_content js-name-locker-${registration.lockerId}"></p>
                </div>
                <div class="reservation_detail flex">
                    <p class="reservation_detail_title">Geopend</p>
                    <p class="reservation_detail_content">${new Date(registration.startTime).toLocaleString('nl-BE')}</p>
                </div>
                <div class="reservation_detail flex">
                    <p class="reservation_detail_title">Teruggebracht</p>
                    <p class="reservation_detail_content">${new Date(registration.endTime).toLocaleString('nl-BE')}</p>
                </div>
                <div class="reservation_opmerking">
                    <p style="margin-top: 0.53125rem" class="reservation_opmerking_title">Opmerking</p>
                    <p style="font-size: 0.75rem" class="reservation_opmerking_content">${registration.note}</p>
                </div>
            </div>
        </div>`;
    }

    document.querySelector('.js-registrations').innerHTML = htmlString;

    for (const locker of lockers)
        getLocker(locker);

    if (userTokenPayload.role == 'Admin') {
        for (const user of users)
            getUser(user);
    }
    else {
        getUser('me');
    }

    listenToTabs();
};

const getUser = function (id) {
    handleData(`${APIURI}/users/${id}`, showUser, null, 'GET', null, userToken);
};

const getLocker = function (id) {
    handleData(`${APIURI}/lockers/${id} `, showLocker, null, 'GET', null, userToken);
};

const getRegistrations = function (userId) {
    handleData(`${APIURI}/registrations${userId == 'all' ? '/all' : '/users/' + userId}`, showRegistrations, null, 'GET', null, userToken);
};

document.addEventListener('DOMContentLoaded', function () {
    const htmlPageReservations = document.querySelector('.js-registration-page');
    const userId = urlParams.get('users');

    if (htmlPageReservations) {
        if (userTokenPayload.role == 'User') getRegistrations('me');
        else if (userTokenPayload.role == 'Admin' && !(userId == undefined || userId == 'all')) getRegistrations(userId);
        else getRegistrations('all');
    }
});