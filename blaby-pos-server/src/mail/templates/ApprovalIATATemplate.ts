export const ApprovalIATATemplate = (data: any) => {
  return `
  <html lang='en' xmlns='http://www.w3.org/1999/xhtml' xmlns:o='urn:schemas-microsoft-com:office:office'>
  <head>
    <meta charset='UTF-8' />
    <meta name='viewport' content='width=device-width, initial-scale=1' />
    <meta name='x-apple-disable-message-reformatting' />
    <title>Tax GO Stock remainder Email</title>
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
      <img src='https://www.taxgoglobal.com/static/media/taxgo%20logo%20small.9ed9870b.png' class="logo13" />
      <br />
      <div style='text-align: end;'></div>
    </div>
    <br />
  <br/>
  <p><b class="subjectText">Subject: Important: Low Stock Alert for ${data.stockLimit[0].idescription}</b></p>
  <p><b>Dear ${data.email},</b></p>
  <p>This is to inform you about an important update regarding the stock levels of ${data.stockLimit[0].idescription}. Our latest inventory review has indicated that the stock for this item is running low.</p>
  <p>Currently, we have ${data.stockLimit[0].stock} units left.</p>
  <p>Warm regards,</p>
  <p>Support Team</p>
  <p>Tax Go Global</p>
  <p>company@taxgoglobal.com</p>
  <br/>
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
