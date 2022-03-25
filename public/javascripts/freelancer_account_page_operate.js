import * as accountsOperation from "./account_operate.js";
import * as socketConnection from "./socketio-connection-client-side.js";

/*
 * The sections of the freelancer page will need to be hidden, and shown
 * only the one that the user has clicked on. The 'main profile information'
 * will be the default once the page has loaded.
 * */

//let domainName = 'http://localhost:3000';
let domainName = "https://kingshireproject.herokuapp.com";

let freelancerProfileSections = $(".freelancer_account_main_side")[0].childNodes;
let freelancerAllowedPages = $(".freelancer-page-allowed")[0].childNodes;
let freelancersectionNames = $(".account-profile-information ul li");

let minimumPriceOfService = 10.0;

$(document).ready(function () {
  $(".freelancer-update-infos").empty();
  let freelancersectionNames_firstChild = $(
    ".account-profile-information ul li:first-child"
  );
  let freelancersectionNames_lastChild = $(
    ".account-profile-information ul li:last-child"
  );

  if (
    freelancersectionNames_firstChild[0].innerText === "Main Page" &&
    freelancersectionNames_lastChild[0].innerText === "Main Page"
  ) {
    freelancersectionNames_firstChild.hide();
  } else {
    $(freelancersectionNames).click(function () {
      accountsOperation.pageDispalyStyle(
        this,
        freelancersectionNames,
        freelancerAllowedPages
      );
    });

    let freelancerMessage_pageToGo = freelancersectionNames_lastChild[0];
    if (freelancerMessage_pageToGo.id === "show-user-messages") {
      accountsOperation.pageDispalyStyle(
        freelancerMessage_pageToGo,
        freelancersectionNames,
        freelancerAllowedPages
      );
    }
  }
});

$(document).click(function (event) {
  let elementClicked = event.target;

  /*
     From the main page, the lines of codes below are used to navigate to the 'update information'
     section of the profile.
     */
  if (
    elementClicked.className === "addProfilePicture" ||
    elementClicked.id === "addDescription" ||
    elementClicked.id === "addSkills" ||
    elementClicked.id === "addEducation" ||
    elementClicked.id === "addService" ||
    elementClicked.id === "addPrice" ||
    elementClicked.id === "addServiceAndPrice"
  ) {
    $(".user-update-page").trigger("click");
  }

  /*
   * In the lines of codes below, the border lines will be removed from the input fields that produced
   * errors when the button that triggered their actions were clicked.
   * */

  // For the education fields
  /*if(elementClicked.className!=='education-input-btn'){
        $('#Schoolname, #Major, #Degree, .user-education-years select')
            .css('border-color', 'lightgrey');
    }*/

  // For service and price
  if (elementClicked.id !== "servicePriceBttn") {
    $(".user-servicePrice-container input").css("border-color", "lightgrey");
  }

  // For skills
  if (elementClicked.id !== "add-skills-button") {
    $("#userBioSkills input").css("border-color", "lightgrey");
  }

  /* Freelancer Booking*/
  let bookingDescription;
  if (
    elementClicked.className === "freelancer-projects-top" ||
    elementClicked.className === "freelancer-one-project-top"
  ) {
    bookingDescription = elementClicked.parentNode.childNodes[1];
    $(bookingDescription).toggle();
  } else if (elementClicked.className === "freelancer-one-project") {
    bookingDescription = elementClicked.childNodes[1];
    $(bookingDescription).toggle();
  } else if (
    elementClicked.parentNode.className === "freelancer-projects-top" ||
    elementClicked.parentNode.className === "freelancer-one-project-top"
  ) {
    bookingDescription = elementClicked.parentNode.parentNode.childNodes[1];
    $(bookingDescription).toggle();
  } else if (
    elementClicked.className === "far fa-trash-alt" &&
    (elementClicked.parentNode.parentNode.className ===
      "freelancer-one-project-top" ||
      elementClicked.parentNode.parentNode.className ===
        "freelancer-projects-top")
  ) {
    $(elementClicked.parentNode.parentNode.parentNode.childNodes[1]).toggle();
  }

  // Project Completion Modal Hide
  if (event.target.className === "freelancer-booking-completion-rejection") {
    event.target.style.display = "none";
  }
});

$(document).on(
  "click",
  ".freelancer-serviceAndPrice-profile div:first-child",
  function (e) {
    let hideSection;
    if (e.target.tagName === "DIV") hideSection = e.target.nextSibling;
    else if (e.target.tagName === "H4")
      hideSection = e.target.parentNode.nextSibling;

    $(hideSection).toggle();
  }
);

/*
 * The following codes deal with the changes and display of the profile
 * of the freelancer
 * */

accountsOperation.profileImageChange(
  "#freelancer-profile-picture",
  "#imagePreview"
);
accountsOperation.profileImageEmpty("#imagePreview");

/*
 * The following is for handling the information update process of a freelancer
 * */

// The first thing is to cancel default behaviour if a user presses the enter
// keyboard. This will help cancelling the automatic submission of the
// freelancer update profile form.
accountsOperation.keyBoardAction(".update-general-information");

/*
 * Add Education
 * */
$(".education-input-btn").click(function (event) {
  /*
   * When this button is clicked, the education of a freelancer is added and shown.
   * */
  event.preventDefault();

  let school_name = $("#Schoolname").val();
  let major = $("#Major").val();
  let degree = $("#Degree").val();
  let start_year = $("#educationDateStart").val();
  let end_year = $("#educationDateEnd").val();

  $("#Schoolname, #Major, #Degree, #educationDateStart, #educationDateEnd").css(
    "border-color",
    "lightgrey"
  );

  if (!school_name || !major || !degree || !start_year || !end_year) {
    if (!school_name) {
      $("#Schoolname").css("border-color", "red");
    }
    if (!major) {
      $("#Major").css("border-color", "red");
    }
    if (!degree) {
      $("#Degree").css("border-color", "red");
    }
    if (!start_year) {
      $("#educationDateStart").css("border-color", "red");
    }
    if (!end_year) {
      $("#educationDateEnd").css("border-color", "red");
    }
  } else {
    if (start_year > end_year) {
      $("#educationDateStart").css("border-color", "red");
      $("#educationDateEnd").css("border-color", "red");
    } else {
      // Create a div container for education
      let educationDiv = document.createElement("div");
      educationDiv.classList.add("freelancer-single-education");

      // Create a div education to be shown
      let showEducationDiv = document.createElement("div");
      showEducationDiv.classList.add("show-section");

      // Create a hidden div education
      let hiddenEducaionDiv = document.createElement("div");
      hiddenEducaionDiv.classList.add("hide-section");
      hiddenEducaionDiv.style.display = "none";

      // Add Course Title to show section
      let courseTitle = document.createElement("h4");
      courseTitle.innerText = major + " " + degree;
      showEducationDiv.appendChild(courseTitle);

      // Add School to show section
      let schoolName = document.createElement("p");
      schoolName.innerText = school_name;
      showEducationDiv.appendChild(schoolName);

      // Add Year of Education to show section
      let year = document.createElement("p");
      year.innerText = "Year: " + start_year + " - " + end_year;
      showEducationDiv.appendChild(year);

      // Add Delete Button to Show Section
      let deleteButton = document.createElement("button");
      deleteButton.innerText = "x";
      deleteButton.classList.add("education-delete-btn");
      showEducationDiv.appendChild(deleteButton);

      // Add Course Title to Hide Section
      let hideCourseTitle = document.createElement("input");
      hideCourseTitle.type = "text";
      hideCourseTitle.name = "degree";
      hideCourseTitle.value = major + " " + degree;
      hideCourseTitle.readOnly = true;
      hiddenEducaionDiv.appendChild(hideCourseTitle);

      // Add School to Hide Section
      let hideSchoolName = document.createElement("input");
      hideSchoolName.type = "text";
      hideSchoolName.name = "schoolName";
      hideSchoolName.value = school_name;
      hideSchoolName.readOnly = true;
      hiddenEducaionDiv.appendChild(hideSchoolName);

      // Add Year of Education to Hide Section
      let hideSchoolYear = document.createElement("input");
      hideSchoolYear.type = "text";
      hideSchoolYear.name = "educationYear";
      hideSchoolYear.value = start_year + " - " + end_year;
      hideSchoolYear.readOnly = true;
      hiddenEducaionDiv.appendChild(hideSchoolYear);

      // Now, Add both containers of shown and hidden sections
      // to the single user education div
      educationDiv.appendChild(showEducationDiv);
      educationDiv.appendChild(hiddenEducaionDiv);
      $(".saved-education").append(educationDiv);

      $("#Schoolname").val("");
      $("#Major").val("");
      $("#Degree").val("");
      $("#educationDateStart").val("");
      $("#educationDateEnd").val("");
    }
  }
});

// When an error is throw, the borders of the education fields are highlighted
// in red. When a click is made away on a blank part of the page, the border
// must return to its default color.

// Add the Possibility of a freelancer deleting their education
accountsOperation.deleteItem(".saved-education", "education-delete-btn");

/*
 * Adding Skills and Services for the Freelancer
 * */

function serviceAndSkill(
  inputIdName,
  singleClassName,
  deleteButton,
  containerHtml,
  showClass,
  hideClass,
  inputHtmlName
) {
  /*
   * This function is for add and showing skills and services of the freelancer
   * */

  let serviceOrSkillValue = $(inputIdName + " input")
    .val()
    .trim();
  let currentService_priceValue;

  // At the beginning of each addition of either the service and its
  // price or the skill, it must be ensure that the border of the
  // input field is in its default color.
  $(inputIdName + " input").css("border-color", "lightgrey");
  $("#userServicesPriceField").css("border-color", "lightgrey");

  if (inputHtmlName === "service") {
    // Each service must have its own price. This loop
    // is used to check if we are dealing with the service
    // because this loop is also used for the process of
    // extracting data for the skills.
    let priceValue = $("#userServicesPriceField input").val().trim();
    priceValue = parseFloat(priceValue);

    // default color for the input field of the price
    $("#userServicesPriceField input").css("border-color", "lightgrey");
    $(".user-servicePrice-container section:nth-child(2) p").hide();

    // The first check to be carried on the price of the current service is
    // to find out whether the field was left empty

    if (
      (isNaN(priceValue) && !Number(priceValue)) ||
      priceValue < minimumPriceOfService
    ) {
      $("#userServicesPriceField").css("border-color", "red");
    } else {
      currentService_priceValue = priceValue.toFixed(2);
    }
  }

  if (
    (inputHtmlName === "service" && !currentService_priceValue) ||
    !serviceOrSkillValue
  ) {
    if (inputHtmlName === "service" && !currentService_priceValue) {
      $("#userServicesPriceField input").css("border-color", "red");
    }
    if (!serviceOrSkillValue) {
      $(inputIdName + " input").css("border-color", "red");
    }
  }
    // START FROM HERE
    else{
        // Create a container for one input
        let containerDiv = document.createElement('div');
        containerDiv.classList.add(singleClassName);

        // Create a show container
        let showDiv = document.createElement('div');
        showDiv.classList.add(showClass);

        // Create a hide container
        let hideDiv = document.createElement('div');
        hideDiv.classList.add(hideClass);
        hideDiv.style.display = 'none';

        // Show childNodes
        let singleName_html = document.createElement('h4');
        singleName_html.innerText = serviceOrSkillValue;

        if(inputHtmlName==='service'){
            $(showDiv).append('<div></div>');
            $(showDiv.firstChild).append(singleName_html);
        }else{
            showDiv.appendChild(singleName_html);
        }


        let removeButton = document.createElement('button');
        removeButton.classList.add(deleteButton);
        removeButton.innerText = 'x';

        // Hide ChildNodes
        let input_html = document.createElement('input');
        input_html.type = 'text';
        input_html.name = inputHtmlName;
        input_html.value = serviceOrSkillValue;
        input_html.readOnly = true;
        hideDiv.appendChild(input_html);

        if(inputHtmlName==='service'){
            // In this if statement, another field for the price
            // is added for each of the services
            let singlePrice_html = document.createElement('h4');
            singlePrice_html.innerText = '£'+currentService_priceValue;
            $(showDiv.firstChild).append(singlePrice_html);

            // Add the remove button on the show section
            $(showDiv.firstChild).append(removeButton);

            // On the section of the service, Add an input tag for the price
            let priceInput_html = document.createElement('input');
            priceInput_html.type = 'text';
            priceInput_html.name = 'price';
            priceInput_html.value = currentService_priceValue;
            priceInput_html.readOnly = true;
            hideDiv.appendChild(priceInput_html);
        }else{
            /*
            * here, it is when we are dealing with the skills
            * */
            // Add the remove button on the show section
            showDiv.appendChild(removeButton);
        }

        // Make the single container
        containerDiv.appendChild(showDiv);

        if(inputHtmlName==='service'){
            let placeholderValue = "Enter full package "+serviceOrSkillValue+" for for this price?(<5)";
            let servicePackageHTM = `<div class="show-service-package">`
                +`<input type="text" name="servicePackage" id="servicePackage" value="" placeholder="Enter full package for this service..."`+
                `><button id="addServicePackage"><i class="fas fa-plus-square"></i></button></div>`;
            $(containerDiv).append(servicePackageHTM);

            let packageHideInputHTML = document.createElement('input');
            packageHideInputHTML.type = 'text';
            packageHideInputHTML.name = 'serviceFullPackage';
            packageHideInputHTML.value = JSON.stringify({freelancerPackage: []});
            packageHideInputHTML.readOnly = true;
            $(hideDiv).append(packageHideInputHTML);
        }

        containerDiv.appendChild(hideDiv);
        $(containerHtml).append(containerDiv);

        // Empty the field
        $(inputIdName+ ' input').val('');
        $('#userServicesPriceField input').val('');
    }

    containerDiv.appendChild(hideDiv);
    $(containerHtml).append(containerDiv);

    // Empty the field
    $(inputIdName + " input").val("");
    $("#userServicesPriceField input").val("");
}

// Price input validation
$("#price").keypress(function (event) {
  return accountsOperation.priceValidation(event.key, $(this).val());
});

// services
$("#servicePriceBttn").click(function (event) {
  event.preventDefault();

  serviceAndSkill(
    "#userServiceField",
    "single-serviceAndPrice",
    "delete-aServiceAndPrice-btn",
    ".saved-serviceAndPrice",
    "show-serviceAndPrice",
    "hide-serviceAndPrice",
    "service"
  );
});

$("#servicePackage").keypress((e) => {
  if (e.target.value.length === 80) return false;
});

$(document).on('click', '.show-service-package', function(e) {
    e.preventDefault();

    if(e.target.className === 'fas fa-plus-square' ||
        e.target.id === 'addServicePackage'){

        let newPackageHTML, packageText;

        if(e.target.className === 'fas fa-plus-square')
            newPackageHTML = e.target.parentNode.previousSibling;
        else
            newPackageHTML = e.target.previousSibling;

        console.log(newPackageHTML)
        packageText = newPackageHTML.value;

        if(packageText.trim().length>0){
            let addServicePackageHTML = newPackageHTML.parentNode
            let serviceDetails = addServicePackageHTML.previousSibling;
            let hideServicePackage = addServicePackageHTML.nextSibling;
            console.log(hideServicePackage);

            let servicePackageContainer;
            if(serviceDetails.childNodes.length === 2){
                console.log('It is visible')
                servicePackageContainer = serviceDetails.childNodes[1].childNodes[0];
            }else{
                console.log('It is not visible')
                servicePackageContainer = document.createElement('div');
                servicePackageContainer.classList.add('freelancer-service-package-update');
                $(serviceDetails).append(servicePackageContainer);
                $(servicePackageContainer).append('<ul></ul>');
                servicePackageContainer = servicePackageContainer.childNodes[0];
            }

            console.log(hideServicePackage.childNodes);
            let hideServicePackageValue = JSON.parse(hideServicePackage.lastChild.value);
            console.log(hideServicePackageValue)
            console.log(hideServicePackageValue.freelancerPackage)
            hideServicePackageValue.freelancerPackage.push(newPackageHTML.value);
            hideServicePackage.lastChild.value = JSON.stringify(hideServicePackageValue)

            $(servicePackageContainer).append(`<li><p>- ${packageText}</p><p class="freelance-delete-aPackage">x</p></li>`);
            newPackageHTML.value = '';
        }
    };
});

$(document).on("mouseover", ".freelance-delete-aPackage", function (e) {
  // code from mouseover hover function goes here
  $(e.target.parentNode).css("color", "#FF0000");
});

$(document).on("mouseout", ".freelance-delete-aPackage", function (e) {
  // code from mouseout hover function goes here
  $(e.target.parentNode).css("color", "#FFFFFF");
});
$(document).on("click", ".freelance-delete-aPackage", function (e) {
  // code from mouseout hover function goes here

  let singlePackage = e.target.parentNode;
  let packageToDeleteIndex = Array.from(
    singlePackage.parentNode.childNodes
  ).findIndex(
    (updatePackage) =>
      updatePackage.firstChild.innerText === singlePackage.firstChild.innerText
  );

  let hiddenServiceInfos =
    singlePackage.parentNode.parentNode.parentNode.nextSibling.nextSibling;
  let newFreelancePackage = JSON.parse(hiddenServiceInfos.lastChild.value);
  newFreelancePackage = newFreelancePackage.freelancerPackage;
  newFreelancePackage = [
    ...newFreelancePackage.slice(0, packageToDeleteIndex),
    ...newFreelancePackage.slice(packageToDeleteIndex + 1),
  ];
  hiddenServiceInfos.lastChild.value = JSON.stringify({
    freelancerPackage: newFreelancePackage,
  });

  if (singlePackage.nextSibling || singlePackage.previousSibling)
    // There are some more packages left
    $(singlePackage).remove();
  // Last Service Package
  else $(singlePackage.parentNode.parentNode).remove();
});

// Add the possibility of freelancer deleting their services
accountsOperation.deleteItem(
  ".saved-serviceAndPrice",
  "delete-aServiceAndPrice-btn"
);

// skills
$("#add-skills-button").click(function (event) {
  event.preventDefault();

  serviceAndSkill(
    "#userBioSkills",
    "single-skill",
    "delete-aSkill-btn",
    ".saved-skill",
    "show-skill",
    "hidden-skill",
    "skills"
  );
});
// Add the possibility of freelancer deleting their skills
accountsOperation.deleteItem(".saved-skill", "delete-aSkill-btn");

$(document).on("click", ".public-service-enquiry button", function (event) {
  let freelancerEmail = event.target.parentNode.lastChild.lastChild.value;
  $("#service-booking-form")
    .get(0)
    .setAttribute(
      "action",
      `${domainName}/payment/create-checkout-session/booking-checkout?client_freelancer=${freelancerEmail}`
    ); //this works
});

/*
 * Collect the Education, Skills and Services of the freelancer
 * **/
function getInputValues(mainContainerHtml, positionOfInputValues) {
  /*
   * This function is used to collect the education, skills an services
   * information of the freelancer.
   * */

  let listOfAllChildren = [];
  let savedSection = $(mainContainerHtml)[0].childNodes;
  savedSection.forEach((singleChild) => {
    if (singleChild.nodeType == 8) {
      return;
    }

    let singleChildList = [];
    let hide_section = singleChild.childNodes[positionOfInputValues].childNodes;
    hide_section.forEach((input) => {
      singleChildList.push(input.value);
    });
    listOfAllChildren.push(singleChildList);
  });

  return JSON.stringify(listOfAllChildren);
}

$(".update-general-information").submit(function (event) {
  event.preventDefault();

  accountsOperation.disbaleButton(
    "#update-page-submission",
    'Wait - Profile Updating <span id="wait">.</span>'
  );

  let startTime = Date.now();
  let freelancerErrorInfos = ".freelancer-update-infos";

  $(freelancerErrorInfos).empty();

  // Collect the data of the update profile form
  let formData = accountsOperation.dataCollection(this);

  // Get the profile picture uploaded by the freelancer
  let saved_profilePicture = $("#freelancer-profile-picture")[0].files[0];
  formData.append("user_profile_picture", saved_profilePicture);

  formData.append("saved_educations", getInputValues(".saved-education", 1));
  formData.append(
    "saved_servicesAndPrices",
    getInputValues(".saved-serviceAndPrice", 2)
  );
  formData.append("saved_skills", getInputValues(".saved-skill", 1));

  $.ajax({
    type: "PUT",
    enctype: "multipart/form-data",
    url: "/account/freelancer/update",
    data: formData,
    contentType: false,
    processData: false,
    success: function (data) {
      /***** display the updated profile picture of the freelancer *****/
      if (data.profileImageSrc === "") {
        $(".account-profile-image img").attr(
          "src",
          "/images/userDefaultImage.png"
        );
      } else {
        $(".account-profile-image img").attr("src", data.profileImageSrc);
      }

      /********* display names of the freelancer *********/
      accountsOperation.showNames(
        data.name,
        data.surname,
        ".account-profile-name"
      );

      /******** display services and skills of the freelancer *********/
      /*
       * The service cannot be empty. Therefore, all the
       * children under the section that the service can
       * be hidden to show the updated services.
       * */

      let freelancerServicesAndPrices = data.serviceAndPrice;
      if (freelancerServicesAndPrices.length > 0) {
        $(".freelancer-services").children().hide();
        accountsOperation.showServicesAndPrices(
          freelancerServicesAndPrices,
          ".freelancer-services"
        );

        $(".freelancer-emptySericeAndPricesMessage").hide();
      }

      /** On the other hand, it is possible to have empty skills.
       * In this situation, before updating the visuals, checkings
       * must be carried to see whether the freelancer has any skills
       * listed.
       **/
      let freelancerSkills = data.skill;
      if (freelancerSkills.length > 0) {
        /** Only update the skills frontend when the freelancer
         * has at least 1 registered*/
        $(".user-account-skills section").children().hide();
        $(".user-account-skills h1").show();
        accountsOperation.showSkills(
          data.skill,
          ".user-account-skills section"
        );
      } else {
        $(".user-account-skills section").children().hide();
        $(".user-account-skills h1").show();
        accountsOperation.emptySkills(
          "+ Add Your Skills",
          ".user-account-skills"
        );
      }

      /*************** display the description of the freelancer ***********/
      let freelancerDescription = data.description;
      if (freelancerDescription) {
        $(".account-first-side").children().hide();
        $(".account-first-side h1").show();
        accountsOperation.showDescription(
          data.description,
          ".account-first-side"
        );
      } else {
        $(".account-first-side").children().hide();
        $(".account-first-side h1").show();
        accountsOperation.emptyDescription(
          "+ Add a Description about yourself",
          ".account-first-side"
        );
      }

      // display the education of the freelancer
      let freelancerEducation = data.education;
      if (freelancerEducation.length > 0) {
        $(".account-third-side").children().hide();
        $(".account-third-side h1").show();
        accountsOperation.showEducations(
          freelancerEducation,
          ".account-third-side"
        );
      } else {
        $(".account-third-side").children().hide();
        $(".account-third-side h1").show();
        accountsOperation.emptyEducation(
          "+ Add Education",
          ".account-third-side"
        );
      }

      accountsOperation.enableButton("#update-page-submission", "Save Profile");
      $(".user-main-page").trigger("click");

      let successMessages = [
        [{ label: "successMessage", message: "Profile successfully saved!" }],
      ];

      accountsOperation.ajaxFormMessage_generator(
        successMessages,
        ".freelancer-update-infos"
      );

      $("html, body").animate({ scrollTop: 0 }, "slow");

      $(".single-update-container").delay(2000).hide(500);
    },
    error: function (error) {
      let errors = error.responseJSON;
      accountsOperation.ajaxFormMessage_generator(errors, freelancerErrorInfos);
      $("html, body").animate({ scrollTop: 0 }, "slow");
    },
  });
});

/*** Freelancer side - projects bookings ***/

// Accept Booking
$(document).on("click", ".freelancer-booking-accept-button", function (event) {
    console.log('booking accept button clicked');
  let freelancerAcceptBttnHTML = event.target;
  let singleProjectDetails = freelancerAcceptBttnHTML.parentNode.parentNode;
  let projectTopInformation = singleProjectDetails.previousSibling;
  let projectStatus = projectTopInformation.childNodes[3].innerText;

  if (projectStatus === "accept / modify") {
    let bookingToAcceptID = singleProjectDetails.nextSibling.value;
    let clientThatBooked = bookingToAcceptID.split(":")[0];
    let projectIndex = Array.from(
      singleProjectDetails.parentNode.parentNode.childNodes
    ).findIndex(
      (singleProject) => singleProject.lastChild.value === bookingToAcceptID
    );

    socketConnection.socket.emit("Accept project", {
      projectIndex,
      bookingToAcceptID,
      clientThatBooked,
    });
  } else if (projectStatus === "awaiting response") {
    console.log("Project Status is awaiting response");
    let buttonsContainer = freelancerAcceptBttnHTML.parentNode;
    let projectBasicInformation = buttonsContainer.previousSibling;
    let projectAllInformationContainer =
      projectBasicInformation.parentNode.previousSibling;
    let dueDateToAccept =
      projectAllInformationContainer.childNodes[2].innerText;
    let originalBooking = projectBasicInformation.childNodes[0].childNodes[1];
    let descriptionToAccept =
      originalBooking.childNodes[2].childNodes[1].innerText;
    let priceToAccept = originalBooking.childNodes[3].childNodes[1].innerText;

    projectCompletionShow(event, {
      dueDateToAccept,
      descriptionToAccept,
      priceToAccept,
    });
  }
});
$(document).on(
  "click",
  "#booking-modificationAcceptance-submit-bttn",
  function (event) {
    console.log("Booking Modification: ");
    event.preventDefault();
    let acceptanceDetailsContainer =
      event.target.parentNode.parentNode.parentNode;
    let bookingToAcceptID = acceptanceDetailsContainer.nextSibling.value;
    let allFreelancerProjects =
      acceptanceDetailsContainer.parentNode.parentNode.parentNode
        .previousSibling.childNodes[1].childNodes;

    let projectIndex = Array.from(allFreelancerProjects).findIndex(
      (singleProject) => singleProject.lastChild.value === bookingToAcceptID
    );
    let clientThatBooked = bookingToAcceptID.split(":")[0];

    socketConnection.socket.emit("Accept project", {
      projectIndex,
      bookingToAcceptID,
      clientThatBooked,
      fromStatus: "awaiting response",
    });
  }
);

// Modify Booking
const formatAMPM = (time) => {
  time = time.split(":");
  let hours = time[0];
  let minutes = time[1];
  let ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  hours = hours >= 10 ? hours : "0" + hours;
  minutes = minutes.toString().padStart(2, "0");

  return [`${hours}`, minutes, ampm];
};

$(document).on("click", ".freelancer-booking-modify-button", function (event) {
  $(".freelancer-booking-modification>p").hide();
  let modifyButton = event.target;
  let buttonsContainer = modifyButton.parentNode;
  let projectBasicInformation = buttonsContainer.previousSibling;
  let projectAllInformationContainer =
    projectBasicInformation.parentNode.previousSibling;
  let currentProjectStatus =
    projectAllInformationContainer.childNodes[3].innerText;

  let currentProjectDueDateTime;
  let currentProjectDescription;
  let currentProjectPrice;

  if (currentProjectStatus === "accept / modify") {
    currentProjectDueDateTime =
      projectAllInformationContainer.childNodes[2].innerText;
    currentProjectDescription =
      projectBasicInformation.childNodes[0].childNodes[2].childNodes[1]
        .innerText;
    currentProjectPrice =
      projectBasicInformation.childNodes[0].childNodes[3].innerText
        .split(":")[1]
        .slice(2);
  } else if (
    currentProjectStatus === "awaiting response" ||
    currentProjectStatus === "please respond"
  ) {
    let proposalInfos = projectBasicInformation.childNodes[1].childNodes[1];
    currentProjectDueDateTime =
      proposalInfos.childNodes[0].childNodes[1].innerText;
    currentProjectDescription =
      proposalInfos.childNodes[2].childNodes[1].innerText;
    currentProjectPrice =
      proposalInfos.childNodes[3].childNodes[1].innerText.slice(1);
  }

  projectCompletionShow(event, {
    modifyDueDate: currentProjectDueDateTime.split(",")[0],
    modifyDueTime: formatAMPM(currentProjectDueDateTime.split(" ")[1]),
    modifyDescription: currentProjectDescription,
    modifyPrice: currentProjectPrice,
  });
});

// Finish Booking
$(document).on("click", ".freelancer-booking-finish-button", function (event) {
  projectCompletionShow(event);
});

$(document).on("click", "#freelancer-booking-delete-button", function (event) {
  if (event.target.className === "far fa-trash-alt") {
    let trashIconContainer = event.target.parentNode;
    let projectStatus = trashIconContainer.previousSibling.innerText;
    console.log(projectStatus);

    if (projectStatus === "paid" || projectStatus === "cancelled") {
      let deleteBttn =
        trashIconContainer.parentNode.nextSibling.childNodes[1].lastChild;

      $(deleteBttn).trigger("click");
    }
  } else {
    let projectDetails = event.target.parentNode.parentNode;
    let projectTop = projectDetails.previousSibling;
    let projectStatus = projectTop.childNodes[3];
    let projectToCancelID = projectDetails.nextSibling.value;
    let clientThatBooked = projectToCancelID.split(":")[0];

    if (projectStatus.innerText === "booking ongoing") {
      projectCompletionShow(event);
    } else {
      socketConnection.socket.emit("Delete project - Freelancer Request", {
        projectToCancelID,
        clientThatBooked,
        status: projectStatus,
      });
    }
  }
});

function projectCompletionShow(event, data) {
    let buttonHTML = event.target;
    let singleProjectHTML = buttonHTML.parentNode.parentNode.parentNode;
    let allBookingsContainerHTML = singleProjectHTML.parentNode.parentNode;
    let bookingID = singleProjectHTML.lastChild.value;

    if(allBookingsContainerHTML.className !== 'booking-section-container'){
        allBookingsContainerHTML = allBookingsContainerHTML.parentNode;
    }
    let bookingCompletionHTML = allBookingsContainerHTML.nextSibling;
    $(bookingCompletionHTML.firstChild.firstChild.childNodes[1].firstChild.lastChild.firstChild).val('');
    $(bookingCompletionHTML.firstChild.firstChild.lastChild).val(bookingID);
    $(bookingCompletionHTML).show();

    bookingCompletionHTML = bookingCompletionHTML.firstChild.firstChild;
    let indexToShow, indexToHide;
    if(buttonHTML.className === 'freelancer-booking-finish-button'){
        $(bookingCompletionHTML.childNodes[0]).show();
        $(bookingCompletionHTML.childNodes[1]).hide();
        $(bookingCompletionHTML.childNodes[2]).hide();
        $(bookingCompletionHTML.childNodes[3]).hide();
    }else if(buttonHTML.id === 'freelancer-booking-delete-button'){
        $(bookingCompletionHTML.childNodes[0]).hide();
        $(bookingCompletionHTML.childNodes[1]).show();
        $(bookingCompletionHTML.childNodes[2]).hide();
        $(bookingCompletionHTML.childNodes[3]).hide();
    } else if(buttonHTML.className === 'freelancer-booking-modify-button'){
        $(bookingCompletionHTML.childNodes[0]).hide();
        $(bookingCompletionHTML.childNodes[1]).hide();
        $(bookingCompletionHTML.childNodes[2]).show();
        $(bookingCompletionHTML.childNodes[3]).hide();

        // Fill in the modification form with the data to possibly modify
        let modificationForm = bookingCompletionHTML.childNodes[2].childNodes[2];
        let modificationDateTime = modificationForm.childNodes[0].firstChild.childNodes;
        let modificationDate = modificationDateTime[0];
        let modificationTime = modificationDateTime[1].childNodes[1].childNodes;

        // Date
        $(modificationDate.childNodes[1]).val(data.modifyDueDate);
        $(modificationDate.childNodes[1]).attr('placeholder', data.modifyDueDate);

        // Time
        //$("div.id_100 > select > option[value=" + value + "]").prop("selected",true);

        let hourToModify = data.modifyDueTime[0]%12;
        hourToModify = hourToModify < 10 ? '0'+hourToModify : hourToModify;

        $(modificationTime[0]).val(hourToModify).change();
        $(modificationTime[2]).val(data.modifyDueTime[1]).change();
        $(modificationTime[3]).val(data.modifyDueTime[2]).change();

        // Description
        $(modificationForm.childNodes[1].childNodes[1]).val(data.modifyDescription);

        // price
        $(modificationForm.childNodes[2].childNodes[1].childNodes[1]).val(data.modifyPrice);
        $(modificationForm.childNodes[2].childNodes[1].childNodes[1]).attr('placeholder', data.modifyPrice);

        // All Modify Data
        $(modificationForm.childNodes[3].childNodes[0]).val(JSON.stringify(data));
    }else if(buttonHTML.className === 'freelancer-booking-accept-button'){
        $(bookingCompletionHTML.childNodes[0]).hide();
        $(bookingCompletionHTML.childNodes[1]).hide();
        $(bookingCompletionHTML.childNodes[2]).hide();
        $(bookingCompletionHTML.childNodes[3]).show();

        let acceptanceForm = bookingCompletionHTML.childNodes[3].childNodes[2];

        $(acceptanceForm.childNodes[0].childNodes[1]).val(data.dueDateToAccept);
        acceptanceForm.childNodes[1].childNodes[1].innerText = data.descriptionToAccept;
        $(acceptanceForm.childNodes[1].childNodes[2]).val(data.descriptionToAccept);
        $(acceptanceForm.childNodes[2].childNodes[1]).val(data.priceToAccept);
    }
}

// Cancel the process
$(document).on("click", ".project-finish-cancel", function (event) {
  $(".freelancer-booking-completion-rejection").hide();
});
$(document).on(
  "click",
  "#booking-modificationReject-submit-bttn",
  function (event) {
    event.preventDefault();
    $(".freelancer-booking-completion-rejection").hide();
  }
);

$(document).on("click", ".project-cancellation-cancel", function (event) {
  $(".freelancer-booking-completion-rejection").hide();
});

// Continue with the process
$(document).on("click", ".project-finish-continue", function (event) {
  console.log("Button confirmation clicked!");
  let bookingFinishID =
    event.target.parentNode.parentNode.parentNode.lastChild.value;
  socketConnection.socket.emit("Project Completion Finish", {
    bookingFinishID: bookingFinishID,
  });
});

$(document).on("click", ".project-cancellation-continue", function (event) {
  let cancellationFormContainer = event.target.parentNode.parentNode;
  let bookingModaldeletion = cancellationFormContainer.parentNode;
  let deletionReason =
    cancellationFormContainer.childNodes[0].childNodes[1].childNodes[0].value;
  let projectToCancelID = bookingModaldeletion.childNodes[4].value;
  let clientThatBooked = projectToCancelID.split(":")[0];
  let minimumLength = 1; //100;

  if (deletionReason.length >= minimumLength) {
    socketConnection.socket.emit("Ongoing Project Cancel - Freelancer", {
      projectToCancelID,
      clientThatBooked,
      deletionReason,
    });
  }
});
