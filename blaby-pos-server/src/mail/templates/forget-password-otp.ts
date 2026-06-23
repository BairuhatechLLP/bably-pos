export const StaffResetPasswordOtpTemplate = ({email, otp}: any) => {  
    return `
    <!DOCTYPE html>
<html>
<head>
<title>Page Title</title>
</head>
<body style="font-family: Helvetica, Arial, sans-serif; padding: 2% 15%;">

<div class="container" style="min-width: 100%; overflow: auto; line-height: 2; margin: 50px auto; width: 70%; padding: 20px; border: 1px solid #d3d3d3;">
  <div class="logo" style=" min-width: 100%; display: flex; justify-content: center; align-items: center;">
    <img src="https://bairuha-bucket.s3.ap-south-1.amazonaws.com/logoNew-removebg-preview.png" class="logo13" style="height: 155px; width: 205px;">
  </div>
  <p><b class="subjectText" style="color: #00466a;">Subject: Password Reset OTP</b></p>
  <div class="content">
    <p>Hi,</p>
    <p>Dear <span class="email" style="font-weight: bold;">${email}</span>,</p>
    <p>Thank you for choosing Retail Xpress. Use the following OTP to complete your forgot password procedures. Your OTP is <b style="color: #18a762;">${otp}</b>  and is valid for 2 minutes.</p>
    <div class="otpBox" style=" min-width: 100%; display: flex; justify-content: center; align-items: center;">
      <div style="width: 150px; background: #18a762; padding: 5px; color: #fff; border-radius: 4px; text-align: center; font-size: 19px;">${otp}</div>
    </div>
  </div>
  <hr style="border:none;border-top:1px solid #eee;">
  <div class="footer" style="display: flex; justify-content: center; margin-top: 20px; min-width: 100%;">
    <a href="https://www.retailxpress.net" style="color: #18a762; font-size: 14px; font-weight: 300;">Retail Xpress</a>
  </div>
</div>

</body>
</html>
        `;
  };
  