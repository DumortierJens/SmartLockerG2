let htmlBackArrowProfiel, currentId;

const showReservaties = function(jsonObject) {
    console.log(jsonObject);
    ListenToClickBackArrowProfielAdmin();
};

function ListenToClickBackArrowProfielAdmin() {
    htmlBackArrowProfiel.addEventListener('click', function() {
        window.location.replace(`${location.origin}/profiel_admin${WEBEXTENTION}?id=${currentId}`);
    });
}

const getReservations = function(id) {
    handleData(`${APIURI}/reservations/users/${id}`, showReservaties, null, 'GET', null, userToken);
};

document.addEventListener('DOMContentLoaded', function() {
    htmlBackArrowProfiel = document.querySelector('.js-backarrow-user-admin')
    const urlParams = new URLSearchParams(window.location.search);
    currentId = urlParams.get('id');
    getReservations(currentId);
});