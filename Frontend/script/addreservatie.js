let htmlSport;
let htmlStart;
let htmlEnd;
let htmlConfirm;

function ListenToConfirmRegistration(){
    htmlConfirm.addEventListener('click',function(){
        let sport = htmlSport.value;
        let start = htmlStart.value;
        let end = htmlEnd.value;
        const body = {
            sport,start,end
        }
        console.log(body)
    })
}

function init(){
    console.log('Dom geladen')
    htmlSport = document.querySelector('.js-addreg_sport')
    htmlStart = document.querySelector('.js-addreg_starttime')
    htmlEnd = document.querySelector('.js-addreg_endtime')
    htmlConfirm = document.querySelector('.js-addreg_confirm')
    ListenToConfirmRegistration()
}

document.addEventListener('DOMContentLoaded',init)