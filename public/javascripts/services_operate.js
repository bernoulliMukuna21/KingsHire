// Mobile Slideshow
$( document ).ready(function() {
    // First check if its a mobile device before integrating the slideshow function
    let is_servicemobile = false;
    if( $('#servicesFrontarrow').css('display')=='block') {
        is_servicemobile = true;
    }
    if (is_servicemobile == true) {
        let slidePosition = 1;
        SlideShow(slidePosition);

        $(document).on("click", "#servicesBackarrow", function (event) {
            plusSlides(-1);
        });

        $(document).on("click", "#servicesFrontarrow", function (event) {
            plusSlides(1);
        });

        // Forward/Back controls
        function plusSlides(n) {
            SlideShow((slidePosition += n));
        }
        // Slide show function
        function SlideShow(n) {
            var i;
            var slides = document.getElementsByClassName("serviceFreelancers");
            if (n > slides.length) {
                slidePosition = 1;
            }
            if (n < 1) {
                slidePosition = slides.length;
            }
            for (i = 0; i < slides.length; i++) {
                slides[i].style.display = "none";
            }

            slides[slidePosition - 1].style.display = "block";
        }
    }
});