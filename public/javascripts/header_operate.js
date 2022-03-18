/*
* This is to open and close the dropdown box
* of the header burger icon for smaller screen displays
* */

let headerBurgericon = document.querySelector(".headerburger-icon");
let headerLinks = [...document.querySelectorAll(".mobileheaderLinks")];

headerBurgericon.onclick = function(){
    headerLinks.forEach(function(link) {
        if (link.style.display === "block") {
            link.style.display = "none";
        }
        else {
            link.style.display = "block";
        }
    });
}


