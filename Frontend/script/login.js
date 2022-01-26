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

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};

document.addEventListener('DOMContentLoaded', function () {
    const userToken = sessionStorage.getItem("usertoken");

    if (userToken) {
        const userTokenPayload = parseJwt(userToken);
        if (userTokenPayload.role === "Admin") window.location.href = `${location.origin}/lockerbeheer${WEBEXTENTION}`;
        else if (userTokenPayload.role === "User") window.location.href = `${location.origin}/overzicht${WEBEXTENTION}`;
    }
});