function showDeletePopUp(id) {
    htmlPopUp.style = "display:block";
    htmlPopUp.style.animation = "fadein 0.5s";
    htmlBackground.style = "filter: blur(8px);";
    listenToCancel();
    listenToDelete(id);
}

function listenToDelete(id) {
    htmlPopUpOk.addEventListener('click', function () {
        htmlBackground.style = "";
        htmlPopUp.style.animation = "fadeout 0.3s";
        console.log(`Reservatie met id ${id} wordt verwijderd`);
        htmlPopUp.style = "display: none;";
    });
}

function listenToCancel() {
    htmlPopUpCancel.addEventListener('click', function () {
        htmlBackground.style = "";
        htmlPopUp.style.animation = "fadeout 0.3s";
        htmlPopUp.style = "display: none;";
    });
}

const closeAllTabs = function () {
    const htmlTabsAll = document.querySelectorAll('.js-tab');
    for (const htmlTab of htmlTabsAll) {
        htmlTab.querySelector(`.js-arrow`).innerHTML = 'expand_more';
        htmlTab.querySelector(`.js-tab-main`).classList.remove("reservation_more_border");
        htmlTab.querySelector(`.js-tab-details`).style.display = 'none';
        htmlTab.querySelector(`.js-tab-edit`).style.display = 'none';
    }
};

const listenToTabs = function () {
    const htmlTabs = document.querySelectorAll('.js-tab');

    for (const htmlTab of htmlTabs) {

        const htmlTabMain = htmlTab.querySelector(`.js-tab-main`);
        const htmlTabDetails = htmlTab.querySelector(`.js-tab-details`);
        const htmlTabEdit = htmlTab.querySelector(`.js-tab-edit`);
        const htmlArrow = htmlTab.querySelector('.js-arrow');
        const htmlEditIcon = htmlTab.querySelector('.js-editIcon');
        const htmlSaveEditIcon = htmlTab.querySelector('.js-saveEditIcon');
        const htmlCancelEditIcon = htmlTab.querySelector('.js-cancelEditIcon');
        const htmlDeleteIcon = htmlTab.querySelector('.js-deleteIcon');

        const htmlNote = document.querySelector(`.js-note`);

        const id = htmlTab.dataset.id;
        const note = htmlNote.innerHTML;

        htmlArrow.addEventListener('click', function () {
            if (htmlArrow.innerHTML == 'expand_more') {
                closeAllTabs();
                htmlArrow.innerHTML = 'expand_less';
                htmlTabDetails.style.display = 'Block';
                htmlTabEdit.style.display = 'none';
                htmlTabMain.classList.add("reservation_more_border");
            }
            else {
                cancelEdit();
                htmlArrow.innerHTML = 'expand_more';
                htmlTabDetails.style.display = 'none';
                htmlTabEdit.style.display = 'none';
                htmlTabMain.classList.remove("reservation_more_border");
            }
        });

        htmlEditIcon.addEventListener('click', function () {
            htmlTabDetails.style.display = 'none';
            htmlTabEdit.style.display = 'block';
        });

        htmlSaveEditIcon.addEventListener('click', function () {
            const updatedNote = htmlNote.innerHTML;
            const body = { note: updatedNote };
            handleData(`${APIURI}/reservations/${id}`, showUpdatedReservation, null, 'PUT', JSON.stringify(body), userToken);
        });

        htmlCancelEditIcon.addEventListener('click', function () {
            cancelEdit();
        });

        htmlDeleteIcon.addEventListener('click', function () {
            showDeletePopUp(id);
        });

        const cancelEdit = function () {
            htmlNote.innerHTML = note;
            htmlTabEdit.style.display = 'none';
            htmlTabDetails.style.display = 'block';
        };
    };
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

const showReservations = function (reservations) {
    console.log(reservations);

    let lockers = [];
    let registrations = [];

    let htmlString = '';
    for (const reservation of reservations) {

        if (!lockers.includes(reservation.lockerId)) lockers.push(reservation.lockerId);
        if (!registrations.includes(reservation.registrationId)) registrations.push(reservation.registrationId);

        const startDate = new Date(reservation.startTime).toLocaleDateString("nl-BE");
        const endDate = new Date(reservation.endTime).toLocaleDateString("nl-BE");
        const startTime = new Date(reservation.startTime).toLocaleTimeString("nl-BE", { hour: '2-digit', minute: '2-digit' });
        const endTime = new Date(reservation.endTime).toLocaleTimeString("nl-BE", { hour: '2-digit', minute: '2-digit' });

        htmlString += `<div class="reservation_container js-tab js-tab-${reservation.id}">
            <div class="js-tab-main reservation flex">
                <img class="user_picture js-picture-${reservation.userId}" src="/img/profile_template.jpg" alt="user-picture" />
                <div class="reservation_grid">
                    <p class="reservation_name js-name-${reservation.userId}"></p>
                    <p class="reservation_date">${startDate} ${startTime}</p>
                </div >
                <div class="status_bezig_rect flex centerflex">Bezig</div>
                <span class="arrow_more js-arrow material-icons-outlined">expand_more</span>
            </div>
            <div class="js-tab-details" style="display: none; animation: fadein 0.5s">
                <div class="reservation_details_edit_and_delete flex">
                    <div class="reservation_details_edit flex centerflex">
                        <span class="editicon js-editIcon material-icons-outlined">edit</span>
                    </div>
                    <div class="reservation_details_delete flex centerflex">
                        <span class="deleteicon js-deleteIcon material-icons-outlined">delete</span>
                    </div>
                </div>
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
                    <p class="reservation_detail_content js-start-registration-${reservation.registrationId}"></p>
                </div>
                <div class="reservation_detail flex">
                    <p class="reservation_detail_title">Teruggebracht</p>
                    <p class="reservation_detail_content js-end-registration-${reservation.registrationId}"></p>
                </div>
                <div class="reservation_opmerking">
                    <p style="margin-top: 0.53125rem" class="reservation_opmerking_title">Opmerking</p>
                    <p style="font-size: 0.75rem" class="reservation_opmerking_content js-note-registration-${reservation.registrationId}"></p>
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
                    <p class="reservation_detail_content js-start-registration-${reservation.registrationId}"></p>
                </div>
                <div class="reservation_detail flex">
                    <p class="reservation_detail_title">Teruggebracht</p>
                    <p class="reservation_detail_content js-end-registration-${reservation.registrationId}"></p>
                </div>
                <div class="reservation_opmerking">
                    <label for="opmerking" class="reservation_opmerking_title">Opmerking <span class="textarea js-note js-note-registration-${reservation.registrationId}" role="textbox" contenteditable></span></label>
                </div>
            </div>
        </div>`;
    }

    document.querySelector('.js-reservations').innerHTML = htmlString;

    getUser();

    for (const locker of lockers)
        getLocker(locker);

    console.log(registrations);

    listenToTabs();
};

const getUser = function (id) {
    handleData(`${APIURI}/users/me`, showUser, null, 'GET', null, userToken);
};

const getLocker = function (id) {
    handleData(`${APIURI}/lockers/${id}`, showLocker, null, 'GET', null, userToken);
};

const getReservations = function () {
    handleData(`${APIURI}/reservations/users/me`, showReservations, null, 'GET', null, userToken);
};

document.addEventListener('DOMContentLoaded', function () {
    getReservations();
});