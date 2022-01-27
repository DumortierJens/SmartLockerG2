let htmlDashboardLockers, htmlDashboardReservaties, htmlDashboardUsers, htmlDashboardAdmins

function ListenToClickDashboardLockers() {
    htmlDashboardLockers.addEventListener('click', function() {
        window.location.href = `${location.origin}/lockerbeheer${WEBEXTENTION}`;
    })
};

function ListenToClickDashboardReservaties() {
    htmlDashboardReservaties.addEventListener('click', function() {
        window.location.href = `${location.origin}/reservatiepagina${WEBEXTENTION}`;
    })
};

function ListenToClickDashboardUsers() {
    htmlDashboardUsers.addEventListener('click', function() {
        window.location.href = `${location.origin}/gebruikers${WEBEXTENTION}`;
    })
};

function ListenToClickDashboardAdmins() {
    htmlDashboardAdmins.addEventListener('click', function() {
        window.location.href = `${location.origin}/admins${WEBEXTENTION}`;
    })
};
document.addEventListener('DOMContentLoaded', function() {
    htmlDashboardLockers = document.querySelector('.js-dashboard-lockers')
    htmlDashboardReservaties = document.querySelector('.js-dashboard-reservations')
    htmlDashboardUsers = document.querySelector('.js-dashboard-users')
    htmlDashboardAdmins = document.querySelector('.js-dashboard-admins')
    ListenToClickDashboardLockers()
    ListenToClickDashboardReservaties()
    ListenToClickDashboardUsers()
    ListenToClickDashboardAdmins()
});