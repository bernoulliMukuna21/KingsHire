var slidePosition = 1;
SlideShow(slidePosition);

$(document).on("click", ".Back", function (event) {
  plusSlides(-1);
});

$(document).on("click", ".forward", function (event) {
  plusSlides(1);
});

$(".dots").click(function () {
  let n = $(".dots").index(this);
  currentSlide(n + 1);
});

$(".image-portfolio-item").click(function () {
  let n = $(".image-portfolio-item").index(this);
  currentSlide(n + 1);
});

function setCurrentValue(value) {
  $(".delete-current-image").val(value);
}

// forward/Back controls
function plusSlides(n) {
  SlideShow((slidePosition += n));
}

//  images controls
function currentSlide(n) {
  SlideShow((slidePosition = n));
}

function SlideShow(n) {
  var i;
  var slides = document.getElementsByClassName("Containers");
  var circles = document.getElementsByClassName("dots");
  if (n > slides.length) {
    slidePosition = 1;
  }
  if (n < 1) {
    slidePosition = slides.length;
  }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < circles.length; i++) {
    circles[i].className = circles[i].className.replace(" enable", "");
  }
  slides[slidePosition - 1].style.display = "block";
  circles[slidePosition - 1].className += " enable";

  const index = slidePosition - 1;
  const src = $("img", ".image-portfolio-item").get(index).src;
  setCurrentValue(src);
}

// var slidePosition = 1;
// SlideShow();

// function SlideShow() {
//   var i;
//   var slides = document.getElementsByClassName("Containers");
//   for (i = 0; i < slides.length; i++) {
//     slides[i].style.display = "none";
//   }
//   slidePosition++;
//   if (slidePosition > slides.length) {
//     slidePosition = 1;
//   }
//   slides[slidePosition - 1].style.display = "block";
//   setTimeout(SlideShow, 2000); // Change image every 2 seconds
// }