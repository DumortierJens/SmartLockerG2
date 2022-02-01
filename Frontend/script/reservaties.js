function callbackReloadPage() {
    htmlPopUp.style = "display: none;";
    window.location.reload();
}

function showDeletePopUp(id) {
    htmlPopUp.style = "display:block";
    htmlPopUp.style.animation = "fadein 0.5s";
    htmlBackground.style = "filter: blur(8px);";
    listenToCancel();
    listenToDelete(id);
}

function listenToDelete(id) {
    htmlPopUpOk.addEventListener('click', function() {
        htmlBackground.style = "";
        htmlPopUp.style.animation = "fadeout 0.3s";
        handleData(`${APIURI}/reservations/${id}`, callbackReloadPage, null, 'DELETE', null, userToken);
    });
}

function listenToCancel() {
    htmlPopUpCancel.addEventListener('click', function() {
        htmlBackground.style = "";
        htmlPopUp.style.animation = "fadeout 0.3s";
        htmlPopUp.style = "display: none;";
    });
}

const closeAllTabs = function() {
    const htmlTabsAll = document.querySelectorAll('.js-tab');
    for (const htmlTab of htmlTabsAll) {
        htmlTab.querySelector(`.js-arrow`).innerHTML = 'expand_more';
        htmlTab.querySelector(`.js-tab-main`).classList.remove("reservation_more_border");
        htmlTab.querySelector(`.js-tab-details`).style.display = 'none';
    }
};

const listenToTabs = function() {
    const htmlTabs = document.querySelectorAll('.js-tab');

    for (const htmlTab of htmlTabs) {

        const htmlTabMain = htmlTab.querySelector(`.js-tab-main`);
        const htmlTabDetails = htmlTab.querySelector(`.js-tab-details`);
        const htmlArrow = htmlTab.querySelector('.js-arrow');
        const htmlDeleteIcon = htmlTab.querySelector('.js-deleteIcon');

        const id = htmlTab.dataset.id;

        htmlArrow.addEventListener('click', function() {
            if (htmlArrow.innerHTML == 'expand_more') {
                closeAllTabs();
                htmlArrow.innerHTML = 'expand_less';
                htmlTabDetails.style.display = 'Block';
                htmlTabMain.classList.add("reservation_more_border");
            } else {
                htmlArrow.innerHTML = 'expand_more';
                htmlTabDetails.style.display = 'none';
                htmlTabMain.classList.remove("reservation_more_border");
            }
        });

        htmlDeleteIcon.addEventListener('click', function() {
            showDeletePopUp(id);
        });
    };
};

const showRegistration = function(registration) {
    const startTime = new Date(registration.startTime).toLocaleString('nl-BE');
    const endTime = new Date(registration.endTime).toLocaleString('nl-BE');

    for (const htmlStatus of document.querySelectorAll(`.js-status-registration-${registration.id}`)) {
        if (endTime == "1/1/1 00:00:00") {
            htmlStatus.classList.add('status_bezig_rect');
            htmlStatus.innerHTML = 'Bezig';
        } else {
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

const showUser = function(user) {
    for (const htmlName of document.querySelectorAll(`.js-name-${user.id}`)) {
        htmlName.innerHTML = user.name;
    }
    for (const htmlPicture of document.querySelectorAll(`.js-picture-${user.id}`)) {
        htmlPicture.src = user.picture;
    }
};

const showLocker = function(locker) {
    for (const htmlName of document.querySelectorAll(`.js-name-locker-${locker.id}`)) {
        htmlName.innerHTML = locker.name;
    }
};

const showReservations = function(reservations) {
        console.log(reservations);

        let lockers = [];
        let registrations = [];
        let users = [];

        let htmlString = '';
        for (const reservation of reservations) {


            if (!registrations.includes(reservation.registratieId) && reservation.registratieId != '00000000-0000-0000-0000-000000000000') registrations.push(reservation.registratieId);
            if (!lockers.includes(reservation.lockerId)) lockers.push(reservation.lockerId);
            if (!users.includes(reservation.userId)) users.push(reservation.userId);

            const startDate = new Date(reservation.startTime).toLocaleDateString("nl-BE");
            const endDate = new Date(reservation.endTime).toLocaleDateString("nl-BE");
            const startTime = new Date(reservation.startTime).toLocaleTimeString("nl-BE", { hour: '2-digit', minute: '2-digit' });
            const endTime = new Date(reservation.endTime).toLocaleTimeString("nl-BE", { hour: '2-digit', minute: '2-digit' });

            htmlString += `<div class="reservation_container js-tab js-tab-${reservation.id}" data-id="${reservation.id}" data-registration-id="${reservation.registratieId}">
            <div class="js-tab-main reservation flex">
                <img class="user_picture js-picture-${reservation.userId}" src="/img/profile_template.jpg" alt="user-picture" />
                <div class="reservation_grid">
                    <p class="reservation_name js-name-${reservation.userId}"></p>
                    <p class="reservation_date">${startDate} ${startTime}</p>
                </div >
                <div class="${reservation.registratieId == '00000000-0000-0000-0000-000000000000' ? 'status_wachten_rect' : ''} flex centerflex js-status-registration-${reservation.registratieId}">${reservation.registratieId == '00000000-0000-0000-0000-000000000000' ? 'Wachten' : ''}</div>
                <span class="arrow_more js-arrow material-icons-outlined">expand_more</span>
            </div>
            <div class="js-tab-details" style="display: none; animation: fadein 0.5s">
                <div class="reservation_details_edit_and_delete flex">
                    <div class="reservation_details_edit_2 flex centerflex">
                        <span class="deleteicon js-deleteIcon material-icons-outlined">delete</span>
                    </div>
                </div >
                <div class="reservation_detail flex">
                    <p class="reservation_detail_title">Locker</p>
                    <p class="reservation_detail_content js-name-locker-${reservation.lockerId}"></p>
                </div>
                <div class="reservation_detail flex">
                    <p class="reservation_detail_title">Datum</p>
                    <p class="reservation_detail_content">${startDate}${startDate != endDate ? ` - ${endDate}` : ``}</p>
                </div>
                <div class="reservation_detail flex">
                    <p class="reservation_detail_title">Tijdslot</p>
                    <p class="reservation_detail_content">${startTime} - ${endTime}</p>
                </div>
                <div class="reservation_detail flex">
                    <p class="reservation_detail_title">Geopend</p>
                    <p class="reservation_detail_content js-start-registration-${reservation.registratieId}"></p>
                </div>
                <div class="reservation_detail flex">
                    <p class="reservation_detail_title">Teruggebracht</p>
                    <p class="reservation_detail_content js-end-registration-${reservation.registratieId}"></p>
                </div>
                <div class="reservation_opmerking">
                    <p style="margin-top: 0.53125rem" class="reservation_opmerking_title">Opmerking</p>
                    <p style="font-size: 0.75rem" class="reservation_opmerking_content js-note-registration-${reservation.registratieId}"></p>
                </div>
            </div >
        </div > `;
    }

    if (htmlString == '')
        htmlString = '<div class="flex no-reservations">Geen reservaties gevonden</div>';

    document.querySelector('.js-reservations').innerHTML = htmlString;

    for (const locker of lockers)
        getLocker(locker);

    for (const registration of registrations)
        getRegistration(registration);

    if (userTokenPayload.role == 'Admin') {
        for (const user of users)
            getUser(user);
    }
    else {
        getUser('me');
    }

    listenToTabs();
};

const getRegistration = function (id) {
    handleData(`${APIURI}/registrations/${id} `, showRegistration, null, 'GET', null, userToken);
};

const getUser = function (id) {
    handleData(`${APIURI}/users/${id}`, showUser, null, 'GET', null, userToken);
};

const getLocker = function (id) {
    handleData(`${APIURI}/lockers/${id} `, showLocker, null, 'GET', null, userToken);
};

const getReservations = function (userId) {
    handleData(`${APIURI}/reservations${userId == 'all' ? '' : '/users/' + userId}`, showReservations, null, 'GET', null, userToken);
};

document.addEventListener('DOMContentLoaded', function () {
    const htmlPageReservations = document.querySelector('.js-reservations-page');
    const userId = urlParams.get('users');

    if (htmlPageReservations) {
        if (userTokenPayload.role == "Admin") showHamburger();
        if (userTokenPayload.role == 'User') getReservations('me');
        else if (userTokenPayload.role == 'Admin' && !(userId == undefined || userId == 'all')) getReservations(userId);
        else getReservations('all');
    }
});