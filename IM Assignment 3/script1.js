carousels.forEach(carousel => {
  const images = carousel.querySelector('.carousel__images');
  const buttons = carousel.querySelectorAll('.carousel__button');
  const numberOfImages = carousel.querySelectorAll('.carousel__images img').length;
  let imageIndex = 0;

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const carouselWidth = carousel.offsetWidth;
      const isPrevious = button.classList.contains('previous');
      
      if (isPrevious) {
        imageIndex = imageIndex > 0 ? imageIndex - 1 : numberOfImages - 1;
      } else {
        imageIndex = imageIndex < numberOfImages - 1 ? imageIndex + 1 : 0;
      }
      
      const translateX = -imageIndex * carouselWidth;
      images.style.transform = `translateX(${translateX}px)`;
    });
  });
});


  document.addEventListener('DOMContentLoaded', function() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const book = document.getElementById('book');
  
    const papers = document.querySelectorAll('.paper');
  
    // Event listeners
    prevBtn.addEventListener("click", goPrevPage);
    nextBtn.addEventListener("click", goNextPage);
  
    // Business Logic
    let currentLocation = 1;
    let numOfPapers = papers.length;
    let maxLocation = numOfPapers + 1;
  
    function openBook() {
      book.style.transform = "translateX(50%)";
      prevBtn.style.transform = "translateX(-180px)";
      nextBtn.style.transform = "translateX(180px)";
    }
  
    function closeBook(isAtBeginning) {
      if(isAtBeginning) {
        book.style.transform = "translateX(0%)";
      } else {
        book.style.transform = "translateX(100%)";
      }
      
      prevBtn.style.transform = "translateX(0px)";
      nextBtn.style.transform = "translateX(0px)";
    }
  });