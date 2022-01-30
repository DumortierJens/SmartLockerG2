function callbackReloadPage() {
    window.location.reload();
}

const closeAllTabs = function() {
    const htmlTabsAll = document.querySelectorAll('.js-tab');
    for (const htmlTab of htmlTabsAll) {
        htmlTab.querySelector(`.js-arrow`).innerHTML = 'expand_more';
        htmlTab.querySelector(`.js-tab-main`).classList.remove("reservation_more_border");
        htmlTab.querySelector(`.js-tab-details`).style.display = 'none';
        htmlTab.querySelector(`.js-tab-edit`).style.display = 'none';
    }
};

const listenToTabs = function() {
    const htmlTabs = document.querySelectorAll('.js-tab');

    for (const htmlTab of htmlTabs) {

        const htmlTabMain = htmlTab.querySelector(`.js-tab-main`);
        const htmlTabDetails = htmlTab.querySelector(`.js-tab-details`);
        const htmlTabEdit = htmlTab.querySelector(`.js-tab-edit`);
        const htmlArrow = htmlTab.querySelector('.js-arrow');
        const htmlEditIcon = htmlTab.querySelector('.js-editIcon');
        const htmlSaveEditIcon = htmlTab.querySelector('.js-saveEditIcon');
        const htmlCancelEditIcon = htmlTab.querySelector('.js-cancelEditIcon');
        const htmlNote = htmlTab.querySelector(`.js-note`);

        const id = htmlTab.dataset.id;
        const note = htmlNote.innerHTML;

        htmlArrow.addEventListener('click', function() {
            if (htmlArrow.innerHTML == 'expand_more') {
                closeAllTabs();
                htmlArrow.innerHTML = 'expand_less';
                htmlTabDetails.style.display = 'Block';
                htmlTabEdit.style.display = 'none';
                htmlTabMain.classList.add("reservation_more_border");
            } else {
                cancelEdit();
                htmlArrow.innerHTML = 'expand_more';
                htmlTabDetails.style.display = 'none';
                htmlTabEdit.style.display = 'none';
                htmlTabMain.classList.remove("reservation_more_border");
            }
        });

        if (htmlEditIcon) {
            htmlEditIcon.addEventListener('click', function() {
                htmlTabDetails.style.display = 'none';
                htmlTabEdit.style.display = 'block';
            });
        }

        htmlSaveEditIcon.addEventListener('click', function() {
            const updatedNote = htmlNote.innerHTML;
            const body = { note: updatedNote };
            handleData(`${APIURI}/registrations/${id}`, callbackReloadPage, null, 'PUT', JSON.stringify(body), userToken);
        });

        htmlCancelEditIcon.addEventListener('click', function() {
            cancelEdit();
        });

        const cancelEdit = function() {
            htmlNote.innerHTML = note;
            htmlTabEdit.style.display = 'none';
            htmlTabDetails.style.display = 'block';
        };
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

const showRegistrations = function(registrations) {
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
                ${(parseJwt(userToken).role == 'Admin' && registration.endTime != '0001-01-01T00:00:00') ? '<div class="reservation_details_edit_and_delete flex"><div class="reservation_details_edit_2 flex centerflex"><span class="editicon js-editIcon material-icons-outlined">edit</span></div></div>' : ""}
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
                    <p class="reservation_detail_content">${registration.endTime != '0001-01-01T00:00:00' ? new Date(registration.endTime).toLocaleString('nl-BE') : ''}</p>
                </div>
                <div class="reservation_opmerking">
                    <p style="margin-top: 0.53125rem" class="reservation_opmerking_title">Opmerking</p>
                    <p style="font-size: 0.75rem" class="reservation_opmerking_content js-note">${registration.note ? registration.note : ''}</p>
                </div>
            </div>
            <div class="js-tab-edit" style="display: none; animation: fadein 0.5s">
                <div class="reservation_details_edit_and_delete flex">
                    <div class="reservation_details_edit flex centerflex">
                        <span class="canceledit js-cancelEditIcon material-icons-outlined">close</span>
                    </div>
                    <div class="reservation_details_delete flex centerflex">
                        <span class="doneedit js-saveEditIcon material-icons-outlined">done</span>
                    </div>
                </div>
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
                    <label for="opmerking" class="reservation_opmerking_title">Opmerking <textarea class="textarea js-note" rows="5" >${registration.note}</textarea></label>
                </div>
            </div>
        </div>`;
    }

    if (htmlString == '')
        htmlString = 'Geen activiteiten gevonden';

    document.querySelector('.js-registrations').innerHTML = htmlString;

    for (const locker of lockers)
        getLocker(locker);

    if (userTokenPayload.role == 'Admin') {
        for (const user of users)
            getUser(user);
    } else {
        getUser('me');
    }

    listenToTabs();
};

const getUser = function(id) {
    handleData(`${APIURI}/users/${id}`, showUser, null, 'GET', null, userToken);
};

const getLocker = function(id) {
    handleData(`${APIURI}/lockers/${id} `, showLocker, null, 'GET', null, userToken);
};

const getRegistrations = function(userId) {
    handleData(`${APIURI}/registrations${userId == 'all' ? '' : '/users/' + userId}`, showRegistrations, null, 'GET', null, userToken);
};

document.addEventListener('DOMContentLoaded', function() {
    const htmlPageReservations = document.querySelector('.js-registration-page');
    const userId = urlParams.get('users');

    if (htmlPageReservations) {
        if (userTokenPayload.role == 'User') getRegistrations('me');
        else if (userTokenPayload.role == 'Admin' && !(userId == undefined || userId == 'all')) getRegistrations(userId);
        else getRegistrations('all');
    }
});