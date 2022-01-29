let htmlDashboardLockers, htmlDashboardReservaties, htmlDashboardUsers,
    htmlDashboardAdmins, htmlDashboardOverzicht;

function ListenToClickDashboardLockers() {
    htmlDashboardLockers.addEventListener('click', function () {
        window.location.href = `${location.origin}/lockerbeheer${WEBEXTENTION}`;
    });
};

function ListenToClickDashboardReservaties() {
    htmlDashboardReservaties.addEventListener('click', function () {
        window.location.href = `${location.origin}/reservaties${WEBEXTENTION}?users=all`;
    });
};

function ListenToClickDashboardUsers() {
    htmlDashboardUsers.addEventListener('click', function () {
        window.location.href = `${location.origin}/gebruikers${WEBEXTENTION}`;
    });
};

function ListenToClickDashboardAdmins() {
    htmlDashboardAdmins.addEventListener('click', function () {
        window.location.href = `${location.origin}/admins${WEBEXTENTION}`;
    });
};

function ListenToClickDashboardOverzicht() {
    htmlDashboardOverzicht.addEventListener('click', function () {
        window.location.href = `${location.origin}/overzicht${WEBEXTENTION}`;
    });
};

document.addEventListener('DOMContentLoaded', function () {
    htmlDashboardLockers = document.querySelector('.js-dashboard-lockers');
    htmlDashboardReservaties = document.querySelector('.js-dashboard-reservations');
    htmlDashboardUsers = document.querySelector('.js-dashboard-users');
    htmlDashboardAdmins = document.querySelector('.js-dashboard-admins');
    htmlDashboardOverzicht = document.querySelector('.js-dashboard-overzicht');
    ListenToClickDashboardLockers();
    ListenToClickDashboardReservaties();
    ListenToClickDashboardUsers();
    ListenToClickDashboardAdmins();
    ListenToClickDashboardOverzicht();
});