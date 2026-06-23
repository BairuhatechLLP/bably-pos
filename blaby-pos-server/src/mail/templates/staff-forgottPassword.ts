export const StaffResetPasswordTemplate = (data: any) => {
  console.log(data?.staff?.dataValues?.name, "data");

  const email = `https://www.retailxpress.net/reset-password/${data.token}`;
  const firstName = data?.staff?.dataValues?.name;
  return `
      <html lang='en' xmlns='http://www.w3.org/1999/xhtml' xmlns:o='urn:schemas-microsoft-com:office:office'>
      <head>
        <meta charset='UTF-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta name='x-apple-disable-message-reformatting' />
        <title>Retail Express remainder Email</title>
        <style>
          table, td, div, h1, p { font-family: Arial, sans-serif; }
  
          table {
            border-collapse: collapse;
            width: 100%;
          }
          th, td {
            border: 1px solid black;
            padding: 8px;
            text-align: left;
          }
          .txt4{
            font-size: 11px;
              color: gray;
              text-align: center;
        }
        .txt5{
            font-size: 11px;
              color: gray;
              text-align: center;
              width: 100%
        }
        .txt6{
          height: 40px;
          width: 150px;
          background: #18a762;
          color: #fff !important;
          font-size: 16px;
          border-radius: 10px;
          text-decoration: none;
          padding:10px;
        }
      
        .seperater{
            height: 1px;
            width: 100%;
            background-color: #f92828;
            margin-bottom: 12px;
            border-radius: 50px;
        }
        .logo13 {
            width: 200px;
            height: 120px;
            object-fit: contain;
        }
        .taxgoglobal {
            display: flex;
            justify-content: center;
        }
        .subjectText {
          color: #ffbc49;
        }
        </style>
      </head>
      <body style='margin: 0; padding: 0'>
        <div>
          <img src='https://bairuha-bucket.s3.ap-south-1.amazonaws.com/logoNew-removebg-preview.png' class="logo13" />
          <br />
          <div style='text-align: end;'></div>
        </div>
        <br />
      <br/>
      <p><b class="subjectText">Subject: Action Required: Password Reset</b></p>
      <p><b>Dear ${firstName},</b></p>
    
      <p>As part of our commitment to ensuring the security of your account, we kindly request that you update your password. This routine measure helps safeguard your personal information and ensures continued protection against unauthorized access.</p>
      <br/>
      <a class="txt6" href="${email}">Open Link</a>
      <br/>
      <br/>
      <p class="txt2">Or Paste this link into your browser :</p>
      <a class="" href="${email}" target="”_blank">${email}</a>
      <br />
      <br />
      <div class="txt3">This link will expire in 5 min</div>
      <br/>
      <div class="seperater"></div>
      <p class="txt4">This email was sent from a notification-only address that cannot accept incoming email. Please do not
          reply to this message.</p>
        <p class="txt5"><a class="txt5" href="https://taxgoglobal.com/">© www.taxgoglobal.com</a> </p>
    </div>
      </body>
    </html>
      `;
};
