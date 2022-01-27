let htmlAdminContent

const showAdmins = function (jsonObject) {
    console.log(jsonObject);
}

const getAdmins = function () {
    handleData(`${APIURI}/admins`, showAdmins, null, 'GET', null, userToken);
}

document.addEventListener("DOMContentLoaded", function () {
    htmlAdminContent = document.querySelector('.js-admins')
    getAdmins()
})