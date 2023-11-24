function validate() {

   // Input fields
   const name = document.getElementById('name')
   const email = document.getElementById('email')
   const password = document.getElementById('password')
   const mobile = document.getElementById('mobile')

   // Error fields
   const nameError = document.getElementById('nameError')
   const emailError = document.getElementById('emailError')
   const passwordError = document.getElementById('passwordError')
   const mobileError = document.getElementById('mobileError');

   // Regular expressions  
   const nameRegex = /^[A-Z]/;
   const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail+\.[a-zA-Z]{3}$/;
   const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
   const mobileRegex = /^[1-9][0-9]{9}$/;
   const allSameDigits = /^(\d)\1+$/;

   // Name field
   if (name.value.trim() === '') {
      nameError.innerHTML = 'Field is required'
      setTimeout(() => {
         nameError.innerHTML = ''
      }, 5000)
      return false;
   }
   if(!nameRegex.test(name.value)){
      nameError.innerHTML = 'First letter should be capital'
      setTimeout(()=>{
         nameError.innerHTML = ''
      },5000)
      return false;
   }

   // Email field   
   if (email.value.trim() === '') {
      emailError.innerHTML = 'Field is required'
      setTimeout(() => {
         emailError.innerHTML = ''
      }, 5000)
      return false;
   }
   if (!emailRegex.test(email.value)) {
      emailError.innerHTML = "Please enter a valid email"
      setTimeout(() => {
         emailError.innerHTML = ''
      }, 5000);
      return false;
   }

   // Password field
   if (password.value.trim() === '') {
      passwordError.innerHTML = 'Field is required'
      setTimeout(() => {
         passwordError.innerHTML = ''
      }, 5000)
      return false;
   }
   if (!passwordRegex.test(password.value)) {
      passwordError.innerHTML = "Please enter a strong password"
      setTimeout(() => {
         passwordError.innerHTML = ''
      }, 5000);
      return false;
   }

   // Mobile field
   if (mobile.value.trim() === '') {
      mobileError.innerHTML = 'Field is required'
      setTimeout(() => {
         mobileError.innerHTML = ''
      }, 5000)
      return false;
   }

   if(!mobileRegex.test(mobile.value)){
      mobileError.innerHTML = 'Please enter a valid number'
      setTimeout(()=>{
         mobileError.innerHTML = ''
      },5000)
      return false;
   }

   if (mobile.value.match(allSameDigits) && parseInt(mobile.value) < 5555555555) {
      mobileError.innerHTML = 'Mobile number should not have all the same digits and the first digit should be greater than or equal to 5';
      setTimeout(()=>{
         mobileError.innerHTML = ''
      },5000)
      return false;
   }
   
   return true;
}

document.getElementById('submitButton').addEventListener('click', function(event) {
   if (!validate()) {
       event.preventDefault();
   }
});

document.addEventListener("DOMContentLoaded", function () {
   const mobileInput = document.getElementById('mobile');
   const mobileError = document.getElementById('mobileError');

   function validateMobile() {
       const mobileValue = mobileInput.value.trim();
       const mobileRegex = /^[1-9][0-9]{9}$/;
       const allSameDigits = /^(\d)\1+$/;
       const firstDigit = mobileValue.substring(0, 1);

       if (mobileValue === '') {
           mobileError.textContent = 'Field is required';
       } else if (!mobileValue.match(mobileRegex)) {
           mobileError.textContent = 'Mobile number should be 10 digits and should not start with zero';
       } else if (firstDigit < 5 && mobileValue.match(allSameDigits)) {
           mobileError.textContent = 'Mobile number should not have all the same digits and the first digit should be greater than or equal to 5';
       } else {
           mobileError.textContent = '';
       }
   }

   mobileInput.addEventListener('input', validateMobile);
});

