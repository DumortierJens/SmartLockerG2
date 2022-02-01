function countNrOfIcons(){
    console.log("count nr of icons")
    return $('.profile_icons_container_container').length
}

function rearrangeIcons(nrOfIcons){
    if (nrOfIcons == 4){
        let htmlIconContainer = document.querySelector('.profile_icons_container')
        htmlIconContainer.classList.add("grid-4-icons")
    }
}

function init(){
    console.log('DOM Ions geladen')
    let nrOfIcons = countNrOfIcons();
    rearrangeIcons(nrOfIcons)
}

document.addEventListener('DOMContentLoaded',init)
