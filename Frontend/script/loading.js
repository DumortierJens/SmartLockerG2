let htmloading, globalhtmlelement, htmllogin, htmlusers, htmloverview,
    htmllocker, htmllockermanagement, htmlprofilepage, htmldashboard;

function ShowPage() {
    htmloading.style = "display: none";
    globalhtmlelement.style.opacity = "1";
    globalhtmlelement.style.animation = "fadein 0.3s";
}

function ShowLoadingScreen(timeout) {
    globalhtmlelement.style.opacity = "0";
    htmloading.style.animation = `fadeout 0.3s`;
    setTimeout(ShowPage, timeout);
}

function init() {
    htmloading = document.querySelector('.loading_container');
    htmllogin = document.querySelector('.js-loginpage');
    htmlusers = document.querySelector('.js-userspage');
    htmloverview = document.querySelector('.js-overviewpage');
    htmllocker = document.querySelector('.js-lockerpage');
    htmllockermanagement = document.querySelector('.js-locker-managementpage');
    htmlprofilepage = document.querySelector('.js-profilepage');
    if (htmllogin) {
        globalhtmlelement = htmllogin;
        ShowLoadingScreen(800);
    }
    if (htmloverview) {
        globalhtmlelement = htmloverview;
        ShowLoadingScreen(1600);
    }
    if (htmllocker) {
        globalhtmlelement = htmllocker;
        ShowLoadingScreen(1600);
    }
    if (htmllockermanagement) {
        globalhtmlelement = htmllockermanagement;
        ShowLoadingScreen(1600);
    }
    if (htmlusers) {
        globalhtmlelement = htmlusers;
        ShowLoadingScreen(1600);
    }
    if (htmlprofilepage) {
        globalhtmlelement = htmlprofilepage;
        ShowLoadingScreen(800);
    }
}

document.addEventListener('DOMContentLoaded', init);