let htmlArrows;
let htmlReservation;
let htmlExtraInfo;
let moreInfo = true;

function ListenToClickArrowMore(){
    for (let htmlArrow of htmlArrows){
        htmlArrow.addEventListener('click',function(){
            htmlReservation = htmlArrow.parentNode;
            htmlReservationContainer = htmlReservation.parentNode;
            if(moreInfo){
                htmlReservation.classList.add("reservation_more_border")
                htmlArrow.style.transform = 'rotate(180deg)';
                moreInfo = false;
                htmlExtraInfo = htmlArrow.nextElementSibling;
                console.log(htmlExtraInfo)
                return;
            }
            else{
                htmlReservation.classList.remove("reservation_more_border")
                htmlArrow.style.transform = 'rotate(0deg)';
                moreInfo = true;
                return;
            }
        })
    }
}

function init(){
    console.log('Dom geladen')
    htmlArrows = document.querySelectorAll('.js-arrow_more')
    ListenToClickArrowMore()
}

document.addEventListener('DOMContentLoaded',init)