window.fbAsyncInit = function () {
    FB.init({
        appId: '4670544903052300',
        cookie: true,
        xfbml: true,
        version: 'v12.0'
    });

    FB.AppEvents.logPageView();

    FB.getLoginStatus(function (response) {
        statusChangeCallback(response);
    });
};

const statusChangeCallback = function (response) {
    if (response.status === 'connected') {
        if (document.querySelector('.js-login-page')) loginUser(response.authResponse.accessToken);
    }
};

const checkLoginState = function () {
    FB.getLoginStatus(function (response) {
        statusChangeCallback(response);
    });
};

const callbackLoginSucceed = function (response) {
    console.log("Login succeed");
    sessionStorage.setItem("usertoken", response.token);
    FB.logout();
    window.location.href = `${location.origin}/overzicht${WEBEXTENTION}`;
};

const callbackLoginFailed = function (response) {
    console.log(response);
};

const loginUser = function (accessToken) {
    console.log(accessToken);
    const body = JSON.stringify({
        accessToken: accessToken
    });
    handleData(`${APIURI}/users/login`, callbackLoginSucceed, callbackLoginFailed, 'POST', body);
};

(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) { return; }
    js = d.createElement(s);
    js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

document.addEventListener('DOMContentLoaded', function () {
    const userToken = sessionStorage.getItem("usertoken");

    if (userToken) {
        const payload = parseJwt(userToken);
        if (payload.isBlocked) window.location.href = `${location.origin}/geblokkeerd${WEBEXTENTION}`;
        else if (payload.role == "User" && payload.tel == null) window.location.href = `${location.origin}/gsm-nummer${WEBEXTENTION}`;
        else if (payload.role == "User") window.location.href = `${location.origin}/overzicht${WEBEXTENTION}`;
        else if (payload.role == "Admin") window.location.href = `${location.origin}/adminmenu${WEBEXTENTION}`;
    }
});