let userToken;

let htmlName, htmlEmail, htmlBirhtday, htmlPicture, htmlUserCreated


const getData = function () {
    handleData(`${APIURI}/users/me`, showData, null, 'GET', null, userToken);
};

const convertDateTime = function (datetime) {
    const d = new Date(datetime)
    var month = new Array();
    month[0] = "01";
    month[1] = "02";
    month[2] = "03";
    month[3] = "04";
    month[4] = "05";
    month[5] = "06";
    month[6] = "07";
    month[7] = "08";
    month[8] = "09";
    month[9] = "10";
    month[10] = "11";
    month[11] = "12";
    return d.getDate() + "/" + month[d.getMonth()] + "/" + d.getFullYear()
}

const showData = function (jsonObject) {
    console.log(jsonObject);
    htmlName = jsonObject.name;
    htmlEmail = jsonObject.email;
    htmlBirhtday = jsonObject.birthday;
    htmlPicture = jsonObject.picture;
    htmlUserCreated = jsonObject.userCreated;
    console.log(htmlName, htmlEmail, htmlBirhtday, htmlPicture, htmlUserCreated)
    document.querySelector(".js-profile_name").innerHTML = htmlName;
    document.querySelector(".js-birthday").innerHTML = convertDateTime(htmlBirhtday);
    document.querySelector(".js-profile_created").innerHTML = convertDateTime(htmlUserCreated);
    document.querySelector(".js-email").innerHTML = htmlEmail;
    document.querySelector('.js-profile_picture').src = htmlPicture;

};

document.addEventListener("DOMContentLoaded", function () {
    console.info('DOM geladen');

    // user authentication
    userToken = sessionStorage.getItem("usertoken");
    userToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjMxNDQ2NDQxNTU3OTUzMjIiLCJuYW1lIjoiSmVucyBEdW1vcnRpZXIiLCJyb2xlIjoiVXNlciJ9.9PqxSKs19MPQCU_6Lt38Krq1aZeHBbZ1Y2Sf4orTyao";
    if (userToken == null)
        window.location.replace(location.origin);

    getData();
})