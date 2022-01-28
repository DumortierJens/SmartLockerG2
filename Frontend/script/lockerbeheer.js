// let htmlLockerContent, htmlExtraInfo, htmlJson, htmlOpmerking, htmlConfirm, htmlCancel;

const checkStatus = function (status) {

};

const showUpdatedLocker = function (locker) {
    window.location.reload();
};

const openLocker = function (lockerId) {
    console.log("Open locker");
};

const closeAllTabs = function () {
    const htmlTabsAll = document.querySelectorAll('.js-tab');
    for (const htmlTab of htmlTabsAll) {
        htmlTab.querySelector(`.js-arrow`).innerHTML = 'expand_more';
        htmlTab.querySelector(`.js-tab-details`).style.display = 'none';
        htmlTab.querySelector(`.js-tab-edit`).style.display = 'none';
    }
};

const listenToTabs = function () {
    const htmlTabs = document.querySelectorAll('.js-tab');

    for (const htmlTab of htmlTabs) {

        const htmlTabDetails = htmlTab.querySelector(`.js-tab-details`);
        const htmlTabEdit = htmlTab.querySelector(`.js-tab-edit`);
        const htmlArrow = htmlTab.querySelector('.js-arrow');
        const htmlEditIcon = htmlTab.querySelector('.js-editIcon');
        const htmlSaveEditIcon = htmlTab.querySelector('.js-saveEditIcon');
        const htmlCancelEditIcon = htmlTab.querySelector('.js-cancelEditIcon');
        const htmlOpenLocker = htmlTab.querySelector('.js-openLocker');

        const htmlName = document.querySelector(`.js-name`);
        const htmlDescription = document.querySelector(`.js-description`);
        const htmlSport = document.querySelector(`.js-sport`);
        const htmlStatus = document.querySelector(`.js-status`);

        const id = htmlTab.dataset.id;
        const name = htmlName.innerHTML;
        const description = htmlDescription.innerHTML;
        const sport = htmlSport.value;
        const status = htmlStatus.value;

        htmlArrow.addEventListener('click', function () {
            if (htmlArrow.innerHTML == 'expand_more') {
                closeAllTabs();
                htmlArrow.innerHTML = 'expand_less';
                htmlTabDetails.style.display = 'Block';
                htmlTabEdit.style.display = 'none';
            }
            else {
                cancelEdit();
                htmlArrow.innerHTML = 'expand_more';
                htmlTabDetails.style.display = 'none';
                htmlTabEdit.style.display = 'none';
            }
        });

        htmlEditIcon.addEventListener('click', function () {
            htmlTabDetails.style.display = 'none';
            htmlTabEdit.style.display = 'block';
        });

        htmlSaveEditIcon.addEventListener('click', function () {
            const updatedName = htmlName.value;
            const updatedDescription = htmlDescription.innerHTML;
            const updatedSport = htmlSport.value;
            const updatedStatus = htmlStatus.value;
            const body = { name: updatedName, description: updatedDescription, sport: updatedSport, status: updatedStatus };
            handleData(`${APIURI}/lockers/${id}`, showUpdatedLocker, null, 'PUT', JSON.stringify(body), userToken);
        });

        htmlCancelEditIcon.addEventListener('click', function () {
            cancelEdit();
        });

        htmlOpenLocker.addEventListener('click', function () {
            openLocker(id);
        });

        const cancelEdit = function () {
            htmlName.value = name;
            htmlDescription.innerHTML = description;
            htmlSport.value = sport;
            htmlStatus.value = status;
            htmlTabEdit.style.display = 'none';
            htmlTabDetails.style.display = 'block';
        };
    };
};

const showLockersLockermanagement = function (lockers) {
    console.log(lockers);

    let htmlString = ``;
    for (const locker of lockers) {

        let statusClass = '';
        if (locker.status == "Beschikbaar")
            statusClass = "locker_status_available";
        else if (locker.status == "Bezet")
            statusClass = "locker_status_occupied";
        else if (locker.status == "Buiten gebruik")
            statusClass = "locker_status_out_of_use";

        htmlString += `<div class="js-tab js-tab-${locker.id} locker_container" data-id="${locker.id}">
            <div class="locker flex js-locker-${locker.id}">
            <img class="locker_img" src="/img/safe-deposit32.png" height="32" width="32" />
            <div class="locker_grid">
                <p class="locker_name">${locker.name}</p>
                <p class="locker_status ${statusClass}">${locker.status}</p>
            </div>
            <span class="arrow_more js-arrow material-icons">expand_more</span>
        </div>
        <div class="reservation_details js-tab-details" style="display: none">
            <div class=" reservation_details_edit_and_delete flex">
                <div class="reservation_details_edit flex centerflex">
                    <span class="editicon js-editIcon material-icons-outlined">edit</span>
                </div>
                <div class="reservation_details_edit flex centerflex">
                    <span class="editicon js-openLocker material-icons-outlined">lock_open</span>
                </div>
            </div>
            <div class="reservation_detail flex">
                <p class="reservation_detail_title">Sport</p>
                <p class="reservation_detail_content">${locker.sport}</p>
            </div>
            <div class="reservation_opmerking js-reservation_opmerking">
                <p style="margin-top: 0.53125rem" class="reservation_opmerking_title">Beschrijving</p>
                <p style="font-size : 0.75rem;" class="reservation_opmerking_content">${locker.description}</p>
            </div>
        </div>
        <div class="reservation_details js-tab-edit" style="display: none">
            <div class=" reservation_details_edit_and_delete flex">
                <div class="reservation_details_edit flex centerflex">
                    <span class="js-cancelEditIcon canceledit material-icons"> close </span>
                </div>
                <div class="reservation_details_delete flex centerflex">
                    <span class="js-saveEditIcon doneedit material-icons"> check </span>
                </div>
            </div>
            <div class="reservation_detail flex">
                <p class="reservation_detail_title">Name</p>
                <input class="reservation_detail_content js-name reservation_detail_content_name" type="text" value="${locker.name}">
            </div>
            <div class="reservation_detail flex">
                <p class="reservation_detail_title">Sport</p>
                <p class="reservation_detail_content">${locker.sport}</p>
                <select class="reservation_detail_content status_selector js-sport" id="sport" value="${locker.sport}">
                    <option value="Voetbal">Voetbal</option>
                    <option value="Basketbal">Basketbal</option>
                </select>
            </div>
            <div class="reservation_detail flex">
                <p for="status" class="reservation_detail_title">Status</p>
                <select class="reservation_detail_content status_selector js-status" id="status" value="${locker.status}">
                    <option value="Beschikbaar">Beschikbaar</option>
                    <option value="Bezet">Bezet</option>
                    <option value="Buiten gebruik">Buiten gebruik</option>
                </select>
            </div>
            <div class="reservation_opmerking">
                <label for="opmerking" class="reservation_opmerking_title">Beschrijving
                    <span class="textarea js-description" role="textbox" contenteditable>${locker.description}</span>
                </label>
            </div>
        </div>`;
    }

    document.querySelector(".js-lockers").innerHTML = htmlString;
    listenToTabs();
};

const getLockersLockermanagement = function () {
    handleData(`${APIURI}/lockers`, showLockersLockermanagement, null, 'GET', null, userToken);
};

document.addEventListener('DOMContentLoaded', function () {
    const htmlPageLockermanagement = document.querySelector(".js-lockermanagement-page");

    if (htmlPageLockermanagement)
        getLockersLockermanagement();
});