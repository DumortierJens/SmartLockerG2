let htmlloading, htmllogin, htmlfbbtn;

function ShowLogin(){
    htmlloading.style = "display: none"
    htmllogin.style.opacity = "1"
    htmllogin.style.animation = "fadein 0.5s"
}

function ShowLoadingScreen(){
    htmllogin.style.opacity = "0"
    htmlloading.style.animation = "fadeout 0.8s"
    setTimeout(ShowLogin,800)
}

function init(){
    console.log('Dom geladen')
    htmlloading = document.querySelector('.loading_container')
    htmllogin = document.querySelector('.login_container')
    ShowLoadingScreen();
}

document.addEventListener('DOMContentLoaded',init)