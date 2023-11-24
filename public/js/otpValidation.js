const { loadOtp } = require("../../controllers/userController")

function validate(){

    const otp = document.getElementById('otp')
    const otpRegex = /^\d{4}$/
    const otpError = document.getElementById('otpError')
    if (otp.value.trim() === '') {
        otpError.innerHTML = 'Field is required'
        setTimeout(() => {
           otpError.innerHTML = ''
        }, 5000)
        return false;
     }
     if(!otpRegex.test(otp.value)){
        otpError.innerHTML = 'Enter valid otp'
        setTimeout(()=>{
           otpError.innerHTML = ''
        },5000)
        return false;
     }

}
