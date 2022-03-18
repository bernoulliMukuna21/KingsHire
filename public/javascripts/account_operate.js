/*
* The following lines of codes ae functions that will help with hiding and
* showing clicked page sections(e.g. messages, main profile page, update
* information) on both the client and freelancer section.
* */
var locale = "en-GB"; //window.navigator.language|| window.navigator.userLanguage;
let minimumPriceOfService = 10.00;

function pageNavigation(pageToShow, name_of_pages, different_pages){
    /*
    * This function is used to show the clicked page section.
    * **/

    name_of_pages.each(function(index, div_element){
        $(this).removeClass("clicked");
        if(div_element.innerText !== pageToShow.innerText){
            $(different_pages[index]).hide();
        }else{
            $(different_pages[index]).show();
        }
    });
}

function pageDispalyStyle(page, name_of_pages, different_pages){
    /*
    * This function will first call the function that handles the
    * display of the clicked page. One thing that needs to happen
    * also is that a 'clicked' needs to be added to clicked page
    * section. This will be handled in this function.
    *       Params:
    *           - page: The name of the page section to show
    *           - name_of_pages: The names of all the page sections
    *           - different_pages: The content of each of the pages
    * */

    pageNavigation(page, name_of_pages, different_pages);
    $(page).addClass("clicked");
    if(page.childNodes[0].innerText === 'Messages'){
        $('.newMessageReceived').hide();
    }
}


/*
* In both, the client and the freelancer profile pages, the users have
* the opportunity to display their profile picture. There is a upload
* button on each of their pages. The following section is used to help
* uplaod a profile picture from a user local computer and displaying it.
* */

function readURL(input, imageHtml){
    /*
    * This function is used to upload and display file images
    * from the user.
    *       Params:
    *           - input: The input file that contains the image file
    *           - imageHtml: the section to display the image
    * */

    if(input.files && input.files[0]){

        let reader = new FileReader();
        reader.onload = function(e){

            // in the following, the file directory is added to
            // the image source for display
            $(imageHtml).attr('src', e.target.result);
            $(imageHtml).show();
        }
        reader.readAsDataURL(input.files[0])
    }
}

function profileImageChange(inputHtml, imageHtml){
    /*
    * This function hears when there is a change on the
    * input file button. This means that a file has been
    * uploaded, then this file must be processed and shown
    * */

    $(inputHtml).change(function() {
        readURL(this, imageHtml);
    });
}

function profileImageEmpty(imageHtml){
    /*
    * It is possible for some users to not have images,
    * especially when they first join the website.
    * Therefore, the image container section must be
    * hidden.
    * */

    // get the source of the image
    let source_image = $(imageHtml).attr('src');

    if(source_image.length<=0){
        // The source image is returned as a string. If it is
        // empty, then there are images to display, so hide.

        $(imageHtml).hide();
    }
}

/*
* The following section provides functions that will help with
* collecting data from the profile update forms of the client
* and the freelancer. As collecting the form data, in this
* section, the functions that will help with the submission
* of those forms are also included.
* */

function dataCollection(formHtml){
    /*
    * In this function, the data of the input form will be
    * collected. Not all of the data are collected because
    * some of them need a different way of collection.
    *       Params:
    *           - formHtml: the class or id of the form
    * */

    let form_data = new FormData();
    let data = $(formHtml).serializeArray().reduce(function(obj, item) {
        obj[item.name] = item.value;
        return obj;
    }, {});

    for ( var key in data ) {
        form_data.append(key, data[key]);
    }

    return form_data
}
// Now, the following subsection will handle to display of the updated
// information.

function showNames(name, surname, htmlContainer){
    $(htmlContainer)[0].innerText = name + ' ' + surname;
}

function showServicesAndPrices(elements, htmlcontainer) {
    elements.forEach(singleServiceAndPrice=>{
        let priceOfService = singleServiceAndPrice.price;
        let service = singleServiceAndPrice.service;
        let servicePackage = singleServiceAndPrice.servicePackage;
        console.log('account Page: ', servicePackage);

        if(priceOfService >= minimumPriceOfService){
            let serviceTag = document.createElement('h4');
            serviceTag.innerText = service;

            let priceTag = document.createElement('h4');
            priceTag.innerText = '£'+priceOfService;

            let singleServicePriceClass = document.createElement('div');
            singleServicePriceClass.classList.add('freelancer-serviceAndPrice-profile');
            $(singleServicePriceClass)
                .append('<div></div>');

            $(singleServicePriceClass.firstChild).append(serviceTag);
            $(singleServicePriceClass.firstChild).append(priceTag);

            if(servicePackage.length>0){
                $(singleServicePriceClass.childNodes[1]).remove();

                $(singleServicePriceClass)
                    .append('<div class="freelance-package-offer" style="display: none"></div>');

                $(singleServicePriceClass.lastChild).append('<h4>Package Offer:</h4><section><ul></ul></section>');

                servicePackage.forEach(singlePackage => {
                    let onePackageList = document.createElement('li');
                    onePackageList.innerText = `- ${singlePackage}`;

                    $(singleServicePriceClass.lastChild.lastChild.firstChild).append(onePackageList);
                })
            }

            $(htmlcontainer).append(singleServicePriceClass);
        }
    });
}

function showSkills(skills, htmlContainer) {
    skills.forEach(singleSkill=>{
        let pageTag = document.createElement('p');
        pageTag.innerText = singleSkill;
        $(htmlContainer).append(pageTag);
    });
}

function emptySkills(defaultText, htmlContainer) {
    let sectionTag = document.createElement('section');
    sectionTag.classList.add('default-skill');

    let pageTag = document.createElement('p');
    pageTag.id = 'addSkills';
    pageTag.innerText = defaultText;

    sectionTag.appendChild(pageTag);
    $(htmlContainer).append(sectionTag);
}

function countServices(htmlContainer){
    let allServices = $(htmlContainer).children().length;
    return allServices;
}

function showDescription(description, htmlContainer) {
    let pageTag = document.createElement('p');
    pageTag.innerText = description;
    $(htmlContainer).append(pageTag);
}
function emptyDescription(defaultText, htmlContainer) {
    let divContainer = document.createElement('div');
    divContainer.classList.add('default-description');

    let pageTag = document.createElement('p');
    pageTag.id = 'addDescription';
    pageTag.innerText = defaultText;

    divContainer.appendChild(pageTag);
    $(htmlContainer).append(divContainer);
}

function priceValidation(characterTyped, currentPriceTyped) {

    if(!(/^[0-9.]$/.test(characterTyped))){
        return false
    }
    if(characterTyped === '.'){
        if(currentPriceTyped.includes('.')){
            return false;
        }
    }
}
function showPrice(price, htmlContainer) {
    let pricePage = document.createElement('p');
    pricePage.innerText = 'Minimum Price at ';
    let idiomaticTag = document.createElement('i');
    idiomaticTag.style.textDecoration = 'underline';
    idiomaticTag.innerText = '£ '+price;
    pricePage.append(idiomaticTag);
    $(htmlContainer).append(pricePage)
}

function showEducations(educations, htmlContainer) {
//Show the education of the freelancer here.
    educations.forEach(singleEducaton=>{
        let educationSection = document.createElement('section');
        educationSection.classList.add('each-education');

        let degreePage = document.createElement('p');
        degreePage.innerText = singleEducaton.degreeAndCourse;
        educationSection.appendChild(degreePage);

        let universityPage = document.createElement('p');
        universityPage.innerText = singleEducaton.institute;
        educationSection.appendChild(universityPage);

        let educationYearPage = document.createElement('p');
        educationYearPage.innerText = singleEducaton.educationYear;
        educationSection.appendChild(educationYearPage);

        $(htmlContainer).append(educationSection);
    })
}

function emptyEducation(defaultText, htmlContainer) {
    let sectionTag = document.createElement('section');
    sectionTag.classList.add('each-education');
    sectionTag.classList.add('default-education');

    let pageTag = document.createElement('p');
    pageTag.id = 'addEducation';
    pageTag.innerText = defaultText;

    sectionTag.appendChild(pageTag);
    $(htmlContainer).append(sectionTag);
}
/*
* General Helper Functions
* **/

function deleteItem(containerHtml, buttonHtml){
    /*
    * This function will be used to help delete added items
    *  such as education, services and skills.
    *           Params:
    *               - containerHtml: contains the information
    *               - buttonHtml: delete button
    * **/

    $(document).on('click', containerHtml, function(event) {
        event.preventDefault();
        let item = event.target; // listen to the clicked item

        if(item.classList[0] === buttonHtml){
            /*
            * If the clicked item is the delete button, then the user'
            * current information must be removed.
            * */

            let container = item.parentElement;
            if(buttonHtml === 'delete-aServiceAndPrice-btn'){

                let numberOfServices = countServices(containerHtml);
                let parentOfContainer = container.parentElement.parentElement;

                if(numberOfServices>1){
                    parentOfContainer.remove();
                }else{
                    $('.freelancer-update-infos').empty();
                    let errors = [[{label: 'updateError', message: 'Service cannot be empty! Please add more services to delete this.'}]];
                    ajaxFormMessage_generator(errors, '.freelancer-update-infos');
                    $("html, body").animate({ scrollTop: 0 }, "slow");
                    $('.single-update-container').delay(5000).hide(1000);
                }
            }
            else if(buttonHtml === 'update-error-delete-btn' || buttonHtml === 'update-delete-btn'){
                container.remove();
            }else{
                container.parentElement.remove();
            }
        }
    })
}

function keyBoardAction(containerHtml){
    /*
    * The following function is to prevent the automatic submission of the
    * update profile page when a user clicks on the Enter keyboard.
    * */
    $(containerHtml).keypress(function (event) {
        if(event.keyCode == 13) {
            event.preventDefault();
        }
    })
}

function ajaxUpdateMessage_creation(message, label, htmlContainer){
    /*
    * In this function, the error message from the update
    * form is taken and display for the user.
    * */

    // create error message container
    let container = document.createElement('div');
    container.classList.add('single-update-container');

    if(label === 'successMessage'){
        container.id = 'save-profile-success';
    }

    // create error message text
    let upgradeMessage = document.createElement('h4');
    upgradeMessage.innerText = message;

    // add possibility of user deleting the error message
    let delete_btn = document.createElement('p');
    delete_btn.classList.add('update-delete-btn');
    delete_btn.innerText = 'x';

    // add the error to their container
    container.appendChild(upgradeMessage);
    container.appendChild(delete_btn);

    // add the container to be display on the page
    $(htmlContainer).append(container);
}

function ajaxFormMessage_generator(dataJSON, htmlContainer){
    dataJSON.forEach(data=>{
        ajaxUpdateMessage_creation(data[0].message, data[0].label, htmlContainer);
    });
    deleteItem('.single-update-container', 'update-delete-btn');
}

function disbaleButton(buttonHTMl, disableButtonHTML){
    if($(buttonHTMl).is(':visible')){
        $(buttonHTMl).prop('disabled', true);
        $(buttonHTMl)[0].innerHTML = disableButtonHTML;
    }
}

function enableButton(buttonHTMl, enableButtonHTML){
    if($(buttonHTMl).is(':visible')){
        $(buttonHTMl).prop('disabled', false);
        $(buttonHTMl)[0].innerHTML = enableButtonHTML;
    }
}

var dots = window.setInterval( function() {
    if ($('#wait').is(':visible')){
        var wait = document.getElementById("wait");
        if ( wait.innerHTML.length > 2 )
            wait.innerHTML = "";
        else
            wait.innerHTML += ".";
    }
}, 500);

/**** Message Helper Functions ****/

function createNewRoom(receiverData, sourceImage) {
    let roomContainer = document.createElement('div');
    roomContainer.classList.add('message-single-room');
    roomContainer.classList.add(receiverData.uniqueKey);

    if(receiverData.messageReceivedClassName){
        roomContainer.classList.add(receiverData.messageReceivedClassName);
    }

    /******/
    let roomContainerImage = document.createElement('div');
    roomContainerImage.classList.add('message-sender-image');

    let roomContainerImage_src = document.createElement('img');
    $(roomContainerImage_src).attr('src', sourceImage);

    roomContainerImage.append(roomContainerImage_src);

    /*******/
    let roomContainerDetails = document.createElement('div');
    roomContainerDetails.classList.add('message-sender-details');

    let roomContainerDetails_section1 = document.createElement('section');

    let roomContainerDetails_h5Name = document.createElement('p');
    roomContainerDetails_h5Name.innerText = receiverData.name + ' '+ receiverData.surname

    let roomContainerDetails_Input = document.createElement('input');
    roomContainerDetails_Input.classList.add('receiver-unique-key');
    $(roomContainerDetails_Input).attr("style", "display:none")
    $(roomContainerDetails_Input).val(JSON.stringify(receiverData))

    roomContainerDetails_section1.append(roomContainerDetails_h5Name);
    roomContainerDetails_section1.append(roomContainerDetails_Input);

    roomContainerDetails.append(roomContainerDetails_section1);

    /****/
    roomContainer.append(roomContainerImage);
    roomContainer.append(roomContainerDetails);

    $('.user-messages-side').prepend(roomContainer);
}

function createNewConversationContainer(receiverData, sourceImage) {
    let conversationsContainer = document.createElement('div');
    conversationsContainer.classList.add('single-message-main-container-box');
    conversationsContainer.classList.add(receiverData.uniqueKey);
    $(conversationsContainer).attr("style", "display: none;")

    /*~~~~~~~~~~~~*/
    let conversationsContainer_top = document.createElement('div');
    conversationsContainer_top.classList.add('message-container-top');

    let conversationsContainer_image = document.createElement('img');
    $(conversationsContainer_image).attr('src', sourceImage);

    let conversationsContainer_h4Name = document.createElement('h4');
    conversationsContainer_h4Name.innerText = receiverData.name + ' '+ receiverData.surname;

    conversationsContainer_top.append(conversationsContainer_image);
    conversationsContainer_top.append(conversationsContainer_h4Name);

    /*~~~~~~~~~~~~~~~~~*/
    let conversationsContainer_main = document.createElement('div');
    conversationsContainer_main.classList.add('message-container-main');

    /*~~~~~~~~~~~~~~~~~*/
    let conversationsContainer_sendForm = document.createElement('form');
    conversationsContainer_sendForm.classList.add('message-container-typeBox');
    $(conversationsContainer_sendForm).attr('method', 'post');
    $(conversationsContainer_sendForm).attr('autocomplete', 'off');

    let conversationsContainer_sendFormInput = document.createElement('input');
    $(conversationsContainer_sendFormInput).attr("class", 'chat-typing-area');
    $(conversationsContainer_sendFormInput).attr("placeholder", 'Write a message...');
    $(conversationsContainer_sendFormInput).attr("name", 'chat_typeBox');
    $(conversationsContainer_sendFormInput).attr("type", 'text');
    $(conversationsContainer_sendFormInput).val('');

    let conversationsContainer_sendFormIcon = document.createElement('i');
    $(conversationsContainer_sendFormIcon).attr("class", 'far fa-paper-plane');
    $(conversationsContainer_sendFormIcon).attr("type", 'submit');
    //$(conversationsContainer_sendFormIcon).attr("class", 'send-message');

    conversationsContainer_sendForm.append(conversationsContainer_sendFormInput);
    conversationsContainer_sendForm.append(conversationsContainer_sendFormIcon);

    /*~~~~~~~~~~~~~~~*/
    conversationsContainer.append(conversationsContainer_top);
    conversationsContainer.append(conversationsContainer_main);
    conversationsContainer.append(conversationsContainer_sendForm);

    $('.all-different-conversations-container').prepend(conversationsContainer);
}

function roomConversationsNavigation(roomToShow, roomsContainerHtml, loggedInUser, receiver) {
    /*
    * This function will be used to navigate to different
    * conversations that the user is having.
    * */
    let roomUID = Array.from(roomToShow.parentNode.children).indexOf(roomToShow);
    let allRoomsContainer = $(roomsContainerHtml)[0].childNodes;

    allRoomsContainer.forEach((currentRoomContainer, currentRoomUID) => {
        if(currentRoomUID !== roomUID){
            $(currentRoomContainer).hide();
        }else{
            $(roomToShow).addClass("roomClicked");

            $('.message-container-main').empty();

            $(currentRoomContainer).show();
            $.ajax({
                type: 'GET',
                url: '/messages/get-user-messages/'+loggedInUser+'/'+receiver,
                success: function (data) {
                    data.forEach(singleMessage => {
                        singleMessage = singleMessage.messages;
                        singleMessage.day = singleMessage.sendDay;
                        singleMessage.time = singleMessage.sendTime;

                        if(loggedInUser === singleMessage.sender){
                            createMessageHTML(singleMessage,
                                'user-single-send-message', currentRoomContainer.childNodes[1]);
                        }else{
                            createMessageHTML(singleMessage,
                                'user-single-receive-message', currentRoomContainer.childNodes[1]);
                        }

                    })

                    var messageBody = currentRoomContainer.childNodes[1];
                    messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;

                    $(currentRoomContainer)[0].childNodes[2].childNodes[0].focus();
                },
                error: function (error) {
                    console.log('Messages not uploaded - error: ', error)
                }
            });
        }
    })
}

function createMessageHTML(messageData, containerHTML, conversationRoomHTML) {
    let messageContainer = document.createElement('div');
    messageContainer.classList.add(containerHTML);

    let messageDiv = document.createElement('div');

    let message = document.createElement('p');
    message.innerText = messageData.message

    let time = document.createElement('p');
    time.innerText = messageData.day+' '+messageData.time;

    messageDiv.appendChild(message);
    messageDiv.appendChild(time);

    messageContainer.append(messageDiv);
    conversationRoomHTML.append(messageContainer);
    //$('.message-container-main').append(messageContainer);
}

/********************** Booking Helper Functions **********************/

function createBookingHTML(bookingContentsHTML,singleBookingContainer, allBookingsContainer,
                           insertion) {

    let singleBookingContainerHTML;

    /*** Create Single Project Booking ***/
    if(typeof singleBookingContainer === 'string'){
        singleBookingContainerHTML = document.createElement('div');
        singleBookingContainerHTML.classList.add(singleBookingContainer);
    }else if (typeof singleBookingContainer === 'object'){
        singleBookingContainerHTML = singleBookingContainer;
    }

    $(bookingContentsHTML[1]).hide();
    singleBookingContainerHTML.append(bookingContentsHTML[0]);
    singleBookingContainerHTML.append(bookingContentsHTML[1]);
    singleBookingContainerHTML.append(bookingContentsHTML[2]);

    if(!insertion && allBookingsContainer){
        allBookingsContainer.append(singleBookingContainerHTML);
    }else if(insertion && allBookingsContainer){
        if(insertion.place === 'before'){
            $(insertion.HTML).before(singleBookingContainerHTML);
        }else if(insertion.place === 'after'){
            $(insertion.HTML).after(singleBookingContainerHTML);
        }else if(insertion.place === 'first'){
            allBookingsContainer.prepend(singleBookingContainerHTML);
        }
    }
}

function createBookingTopHTML(bookingData, projectHTML, projectDetailsHTML) {
    /* This function is used to create a booking
     on the freelancer account*/

    /** Project **/
    let projectContainer = document.createElement('div');
    projectContainer.classList.add(projectHTML);

    let projectName = document.createElement('p');
    projectName.innerText = bookingData.service+' - '+bookingData.projectName;

    let ClientName = document.createElement('p');
    ClientName.innerText = bookingData.customer.name;

    let dueDate = document.createElement('p');
    dueDate.innerText = (new Date(bookingData.dueDateTime)).toLocaleString(locale);

    let status = document.createElement('p');
    status.classList.add('project-status');
    if(bookingData.status === 'booking ongoing'){
        status.innerText = 'booking ongoing';
        $(status).css({'border': '.1rem solid #A37A00', 'background-color':'#A37A00'})
    }else if(bookingData.status === 'awaiting payment'){
        status.innerText = 'awaiting payment';
        $(status).css({'border': '.1rem solid #8d2874', 'background-color':'#8d2874'})
    }else if(bookingData.status === 'accept / modify' ||
        bookingData.status === 'please respond' ||
        bookingData.status === 'awaiting response'){
        status.innerText = bookingData.status;
        $(status).css({'border': '.1rem solid #213e53', 'background-color':'#213e53'})
    }else if(bookingData.status === 'completed' ||
        bookingData.status === 'paid' ||
        bookingData.status === 'processing payout...'){
        status.innerText = bookingData.status;
        $(status).css({'border': '.1rem solid #308634', 'background-color':'#308634'})
    }else if(bookingData.status === 'awaiting resolution' ||
        bookingData.status === 'cancelled'){
        status.innerText = bookingData.status;
        $(status).css({'border': '.1rem solid #FF0000', 'background-color':'#FF0000'})
    }

    /*project options*/
    let optionsDIV = document.createElement('div');
    optionsDIV.classList.add('freelancer-options');

    let trashIcon = document.createElement("i");
    $(trashIcon).attr("class", "far fa-trash-alt");

    optionsDIV.appendChild(trashIcon);

    /*append contents*/
    projectContainer.appendChild(projectName);
    projectContainer.appendChild(ClientName);
    projectContainer.appendChild(dueDate);
    projectContainer.appendChild(status);
    projectContainer.appendChild(optionsDIV);

    return [projectContainer, createBookingToggleDetails(bookingData, projectDetailsHTML),
        createBookingIdInput(bookingData)];
}

function createBookingToggleDetails(bookingData, projectDetailsHTML) {
    let projectDetailsContainer = document.createElement('div');
    projectDetailsContainer.classList.add(projectDetailsHTML);
    $(projectDetailsContainer).attr("style", "display: none;")

    /* Details Description */
    let detailsDIV = document.createElement('div');

    let projectDetailsDescription = `<div>` +
        `<h4>Creation Date: <span>${new Date(bookingData.creationDate).toLocaleString(locale)}</span></h4>`+
        `<div class="bookingDetails-showOnMobileResponsive">`+
        `<h4>Client Name: <span>${bookingData.customer.name}</span></h4>`+
        `<h4>Due Date: <span>${new Date(bookingData.dueDateTime).toLocaleString(locale)}</span></h4>`+
        `</div>`+
        `<div class="freelancer-project-details-descritpion">`+
        `<h4>Description:</h4>`+
        `<p>${bookingData.projectDescription}</p>`+
        `</div>`+
        `<h4> Price: £${bookingData.price}</h4>`+
        `</div>`;
    detailsDIV.innerHTML = projectDetailsDescription;

    /* Details Options */
    let detailsOptionsDIV = document.createElement('div');
    let detailsOptionsHTML;
    let deleteBttn = 'Reject';
    if(bookingData.status === 'booking ongoing'){
        deleteBttn = 'Cancel'
        detailsOptionsHTML = `<button class="freelancer-booking-finish-button">Finish</button>`;
    }
    if(bookingData.status === 'accept / modify'){
        detailsOptionsHTML = `<button class="freelancer-booking-accept-button">Accept</button>`+
            `<button class="freelancer-booking-modify-button">Modify</button>`;
    }
    detailsOptionsHTML += `<button id="freelancer-booking-delete-button">${deleteBttn}</button>`;
    detailsOptionsDIV.innerHTML = detailsOptionsHTML;

    projectDetailsContainer.appendChild(detailsDIV);
    projectDetailsContainer.appendChild(detailsOptionsDIV);
    projectDetailsContainer.appendChild(createBookingFinalMessages(bookingData));

    return projectDetailsContainer
}
function createBookingFinalMessages(bookingData) {
    let projectFinalMessagesContainer = document.createElement('div');
    projectFinalMessagesContainer.classList.add('freelancer-project-final-messages');
    $(projectFinalMessagesContainer).attr("style", "display: none;")

    /* Completion Confirmed*/
    let projectCompletionConfirmed = document.createElement('div');
    projectCompletionConfirmed.classList.add('freelancer-project-completion-confirmed');
    let projectEarning = document.createElement("h4");
    projectEarning.innerText = `Earning: £${(bookingData.price - ((bookingData.price/100)*5)).toFixed(2)}`;
    let failureInfos = document.createElement("p");
    $(failureInfos).css({'font-style': 'normal'});
    failureInfos.innerText = ` Unfortunately, ${bookingData.customer.name} has informed us that `+
        `the project has not been delivered. The management team has been informed and will be in `+
        `contact soon. Please do keep an eye on your inbox. Thank you!`;

    let contactInfos = document.createElement("p");
    contactInfos.innerText = '(contact us on kingshire.team@gmail.com for enquiries)';

    projectCompletionConfirmed.appendChild(projectEarning);
    projectCompletionConfirmed.appendChild(failureInfos);
    projectCompletionConfirmed.appendChild(contactInfos);

    /* Completion rejected*/
    let projectCompletionRejected = document.createElement('div');
    $(projectCompletionRejected).attr("style", "display: none;")
    projectCompletionRejected.classList.add('freelancer-project-completion-rejection');
    let messageInfos_failure = document.createElement("p");
    messageInfos_failure.innerHTML = `${bookingData.customer.name} has decided to `+"<span> cancel </span>"
        +" the project. The management has been informed and will take appropriate actions. Thank you"
        +"<br/><span>(contact us on kingshire.team@gmail.com for enquiries)</span>";

    projectCompletionRejected.appendChild(messageInfos_failure);

    projectFinalMessagesContainer.appendChild(projectCompletionConfirmed);
    projectFinalMessagesContainer.appendChild(projectCompletionRejected);

    return projectFinalMessagesContainer
}

function createBookingIdInput(bookingData) {
    let projectIdHTML = document.createElement("input");
    $(projectIdHTML).attr('type', 'hidden').attr('bookingid');
    projectIdHTML.classList.add('singleBookingID');
    $(projectIdHTML).val(bookingData.bookingID);

    return projectIdHTML
}

function createBookingModificationHTML(originalBookingData, modifyBookingData, detailsDIV) {
    let projectDetailsDescriptionOriginalHTML = `<div class="freelancer-side-originalBooking">`+
        `<div>`+
        `<h4>Original</h4>`+
        `</div>`+
        `<div>`+
        `<h4>Creation Date: `+
        `<span style="font-weight: normal">${new Date(originalBookingData.creationDate).toLocaleString(locale)}</span>`+
        `</h4>`+
        `<div class="bookingDetails-showOnMobileResponsive">`+
        `<h4>Client Name: <span>${originalBookingData.customer.name}</span></h4>`+
        `<h4>Due Date: <span>${new Date(originalBookingData.dueDateTime).toLocaleString(locale)}</span></h4>`+
        `</div>`+
        `<div class="freelancer-project-details-descritpion">`+
        `<h4>Description: </h4>`+
        `<p>${originalBookingData.projectDescription}</p>`+
        `</div>`+
        `<h4>Price: `+
        `<span style="font-weight: normal">£${originalBookingData.requestedPrice}</span>`+
        `</h4>`+
        `</div>`+
        `</div>`;
    detailsDIV.innerHTML += projectDetailsDescriptionOriginalHTML;

    let projectDetailsDescriptionProposedHTML = `<div class="freelancer-side-BookingChangesProposed" style='color: #8d2874; font-style: italic'>`+
        `<div>`+
        `<h4>Your Proposal</h4>`+
        `</div>`+
        `<div>`+
        `<h4 id="newProposedDueDate">Proposed Due Date: `+
        `<span style="font-weight: normal">${new Date(modifyBookingData.newProposedDueDate).toLocaleString(locale)}</span>`+
        `</h4>`+
        `<div class="bookingDetails-showOnMobileResponsive">`+
        `<h4>Client Name: <span>${originalBookingData.customer.name}</span></h4>`+
        `</div>`+
        `<div class="freelancer-project-details-descritpion">`+
        `<h4>Proposed Description: </h4>`+
        `<p>${modifyBookingData.newProposedDescription}</p>`+
        `</div>`+
        `<h4 id="newProposedDueDate">Price: `+
        `<span style="font-weight: normal">£${modifyBookingData.newProposedPrice}</span>`+
        `</h4>`+
        `</div>`+
        `</div>`;
    detailsDIV.innerHTML += projectDetailsDescriptionProposedHTML;
}
function bookingModificationClientSide(originalBookingData, modifyBookingData, insertionDIV){
    let divContainer = document.createElement('div');
    divContainer.classList.add('client-booking-modification-container');

    let originalBookingHTML = `<div class="client-side-originalBooking">`+
        `<div><h4>Original Booking</h4></div><div><h4>Creation Date: `+
        `${new Date(originalBookingData.creationDate).toLocaleString(locale)}</h4>`+
        `<div class="bookingDetails-showOnMobileResponsive"><h4>Freelancer Name: `+
        `<span>${originalBookingData.supplier.name}</span></h4><h4>Due Date: <span>`+
        `${new Date(originalBookingData.dueDateTime).toLocaleString(locale)}</span></h4>`+
        `</div>`+
        `<div class="client-booking-descrption-details"><h4>Description :</h4>`+
        `<p>${originalBookingData.projectDescription}</p></div><h4>Cost: `+
        `£${originalBookingData.requestedPrice}</h4></div></div>`;

    let modifiedBookingHTML = `<div class="client-side-modificationBooking">`+
        `<div><h4>New Proposal</h4></div><div><h4>Proposed Due Date: `+
        `${new Date(modifyBookingData.newProposedDueDate).toLocaleString(locale)}</h4>`+
        `<div class="bookingDetails-showOnMobileResponsive"><h4>Freelancer Name: <span>`+
        `${originalBookingData.supplier.name}</span></h4></div>`+
        `<div class="client-booking-descrption-details"><h4>Proposed Description :</h4>`+
        `<p>${modifyBookingData.newProposedDescription}</p></div><h4>Proposed Cost: `+
        `£${modifyBookingData.newProposedPrice}</h4></div></div>`;

    divContainer.innerHTML += originalBookingHTML;
    divContainer.innerHTML += modifiedBookingHTML;

    $(insertionDIV).append(divContainer);
}
function moveProjectBooking(nextDueProjectHTML, bookingID, projectTopContainer, projectDetailsContainer) {
    let projectTopContainerHTML = document.createElement('div');
    projectTopContainerHTML.classList.add(projectTopContainer);
    $(nextDueProjectHTML.firstChild).children().clone().appendTo(projectTopContainerHTML);

    let projectDetailsContainerHTML = document.createElement('div');
    projectDetailsContainerHTML.classList.add(projectDetailsContainer);
    $(projectDetailsContainerHTML).attr("style", "display: none;")
    $(nextDueProjectHTML.childNodes[1]).children().clone().appendTo(projectDetailsContainerHTML);

    return [projectTopContainerHTML, projectDetailsContainerHTML, createBookingIdInput(bookingID)]
}

export{ pageDispalyStyle, pageNavigation, profileImageChange, profileImageEmpty,
    dataCollection, showNames, showServicesAndPrices, showSkills,
    emptySkills, countServices, showDescription, emptyDescription, priceValidation,
    showPrice, showEducations, emptyEducation, deleteItem, keyBoardAction,
    ajaxFormMessage_generator, disbaleButton, enableButton, createNewRoom,
    createNewConversationContainer, roomConversationsNavigation, createMessageHTML,
    createBookingHTML, createBookingTopHTML, createBookingModificationHTML,
    bookingModificationClientSide, moveProjectBooking }