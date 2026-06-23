import moment from "moment";

export const paymentTemplate = ({
  pagetype,
  user,
  saleComplete,
  customer,
  sale,
  productlist,
  netTotal,
  vatTotal,
  Discount,
  round,
  isPaymentInfo,
  selectedBank,
  payHref,
}: any) => {
  return `<!DOCTYPE html
      PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
      xmlns:o="urn:schemas-microsoft-com:office:office">
    
    <head>
      <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="format-detection" content="date=no" />
      <meta name="format-detection" content="address=no" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="x-apple-disable-message-reformatting" />
      <title>Tax GO Invoice</title>
    </head>
    
    <body style="width: 100%;align-content: center;margin: auto;font-family:pins, 'Segoe UI', Tahoma, sans-serif">
      <div style="margin: 20px;">
        <table style="margin: auto;
            width: 100%;
            text-align: right;
            background: #fafafa;
            padding: 8px;
            font-size: 14px;">
          <tbody style="text-align: right;">
         
            <tr style="text-align: right;">
              <td></td>
            </tr>
            <tr style="line-height:25px;">
              <td style="text-align: left"><img style="border-radius: 50%;width: 180px;"
                  src="https://taxgo-v2.s3.eu-west-1.amazonaws.com/logo/${
                    user?.companyInfo?.logo
                  }" />
              </td>
              <td style="padding-left: 25px;vertical-align:super; font-size:20px;">
                <b>
                  ${user?.companyInfo?.bname ? user?.companyInfo?.bname : "-"}
                </b>
                <br>
                ${
                  user?.companyInfo?.fulladdress
                    ? user?.companyInfo?.fulladdress
                    : "-"
                }
                <br>
                ${user?.countryInfo?.name ? user?.countryInfo?.name : "-"}
                <br>
                ${
                  user?.companyInfo?.taxno
                    ? `Tax No: ${user?.companyInfo?.taxno}`
                    : ""
                }
                <br>
                ${
                  user?.companyInfo?.registerno
                    ? `Reg. No: ${user?.companyInfo?.registerno}`
                    : ""
                }
                <br>
                Phone:
                ${user?.phonenumber ? user?.phonenumber : ""}
                <br>
                ${user?.email ? user?.email : ""}
              </td>
              ${
                saleComplete
                  ? `
                <td>
                  <div>
                    <div style="padding: 5px;
                                  float: right;
                                  text-align: center;
                                  border: 1px solid green;
                                  border-radius: 4px;
                                  color: green;
                                  font-weight: 700;
                                  font-size: 12px;
                                  width: 32px;">Paid
                    </div>
                  </div>
                </td>`
                  : ""
              }
            </tr>
          </tbody>
        </table>
        <table style="width: 100%;
            font-size: 14px;
            border-spacing: 0px;
            line-height: 22px;">
          <tbody>
          <tr style="text-align: center;
          font-size: 16px;
          font-weight: 750;
          text-transform: uppercase;
          text-decoration: underline;">
  <td colspan="3"> <b  style="padding-top: 20px; padding-bottom: 20px;" >${
    pagetype ? pagetype : "Invoice"
  }</b></td>
  </tr>
            <tr style="line-height:30px;">
              <td style="padding: 10px 0px;">
                <b>INVOICE ADDRESS</b><br>
                ${customer?.bus_name ? `${customer?.bus_name} <br> ` : ""}
                  ${customer?.address ? `${customer?.address} <br> ` : ""}
                    ${customer?.mobile ? `${customer?.mobile} <br> ` : ""}
  
                      ${customer?.email ? `${customer?.email} <br> ` : ""}
                 
                
                ${
                  sale.deladdress
                    ? `<b>Delivery Address</b><br>
                  ${sale?.deladdress}
                  `
                    : ""
                }
              </td>
              <td colspan="2" style="background-color: #febb54;
                            color: black; font-size:16px; padding-right: 15px;text-align:right;">
                <b>Invoice number: ${sale?.invoiceno}<br>
                  Issued Date: ${moment(sale?.sdate).format("DD/MM/YYYY")}<br>
                  Due Date: ${moment(sale?.ldate).format("DD/MM/YYYY")}<br>
                   ${sale?.reference ? `Reference: ${sale?.reference}` : ""}</b>
              </td>
            </tr>
          </tbody>
        </table>
    
        <table style="margin-top: 10px !important;margin: auto;width: 100%;">
          <tbody style="text-align: center;">
            <tr
              style="background: black;color: white;text-align: center;font-size: 8px; text-transform: uppercase;">
              <td style="height: 30px; " width="10%"><b>Item Code</b></td>
              <td width="10%"><b>Description</b></td>
              <td width="10%"><b>Price</b></td>
              <td width="10%"><b>Qtn</b></td>
              <td width="10%"><b>Unit</b></td>
              <td width="10%"><b>Discount <br>(Amt & %)</b></td>
              <td width="10%"><b>VAT <br>(Amt & %)</b></td>
              <td width="10%"><b>Amount(${user?.countryInfo?.symbol})</b></td>
            </tr>
            ${productlist
              .map(
                (product: any) => `
              <tr style="font-size: 12px;">
                <td>
                  ${
                    product?.product.icode
                      ? product?.product?.icode
                      : product.product?.idescription
                      ? `- ${product?.product?.idescription}`
                      : ""
                  }
                </td>
                <td>
                  ${product.description ? product.description : ""}
                </td>
                <td>
                  ${product.costprice ? product.costprice : ""}
                </td>
                <td>
                  ${product.quantity ? product.quantity : ""}
                </td>
                <td>
                  ${product.product.unit ? product.product.unit : ""}
                </td>
                
                <td>
                  ${product.discount ? product.discount : "-"}
                </td>
                <td>
                  ${
                    product.incomeTaxAmount
                      ? `${product.incomeTaxAmount} @ ${product.incomeTax}`
                      : "0 @ 0.00"
                  }
                </td>
                <td>
                  ${
                    product.total
                      ? `${user?.countryInfo?.symbol}${product.total}`
                      : ""
                  }
                </td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
        <hr style="border: 0.5px solid lightgray;">
      
          <!-- Payment Information Table -->
          <table style="border-spacing: 0px;margin-top: 10px !important;margin: auto;width: 100%; line-height: 22px;">
            <tbody style="text-align: center; background-color: #febb54;">
              <tr style="border: none;background: febb54;color: black;text-align: center;font-size: 12px;">
                <td style="text-align: left;line-height: 15px;padding: 20px; width:65%;">
                  <b>Invoice Descriptions</b><br><br>
                  <div style="margin-left:12px;">
                    ${sale.quotes}
                  </div>
                  <br>
                  <br>
                  <b>Terms and Conditions</b><br><br>
                  <div style="margin-left:12px;">
                  ${sale.terms}
                  </div>
                </td>
                <td style="text-align: left; line-height: 25px; padding: 20px; width: 35%">
         
                <b>Taxable Value</b>: ${
                  netTotal
                    ? `${user?.countryInfo?.symbol} ${parseFloat(
                        netTotal
                      )}`
                    : ""
                }
                 <br>
                 <b>Total VAT</b>:  ${
                   vatTotal
                     ? `${user?.countryInfo?.symbol} ${
                         parseFloat(vatTotal) || ""
                       }`
                     : ""
                 }
                 <br>
                 <b>Overall Discount</b>:  ${
                   vatTotal
                     ? `${user?.countryInfo?.symbol} ${
                         parseFloat(Discount) || ""
                       }`
                     : ""
                 }
                 <br>
                 <b>Grand Total</b>: ${
                   sale.total
                     ? `${user?.countryInfo?.symbol} ${sale.total}`
                     : ""
                 }
  
                 <div>${numberToWords(parseInt(sale.total)) || ""} ${
    user?.countryInfo?.currency
  }s
                 </div>
             </td>
            </tr>
            </tbody>
          </table>
    
        
        <div style="text-align: end; margin:20px 0px 20px 0px;">
        <a href=${payHref}>
        <button  style="padding: 20px 100px; background-color: #008000; color: #fff; border: none; border-radius: 5px; cursor: pointer;">Pay Now</button>
        </a>
    </div>
        <div style="font-size: 10px; margin-top: 25px;">
          <p style="text-align: center;">Created by <a href="https://www.taxgoglobal.com/">taxglobal.com</a></p>
        </div>
      </div>
    </body>
    
    </html>`;
};

function numberToWords(amount: any) {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const teens = [
    "",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "Ten",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function convertBelow100(num: any) {
    if (num < 10) {
      return ones[num];
    } else if (num >= 11 && num <= 19) {
      return teens[num - 11];
    } else {
      return (
        tens[Math.floor(num / 10)] +
        (num % 10 !== 0 ? " " + ones[num % 10] : "")
      );
    }
  }

  function convertBelow1000(num: any) {
    if (num < 100) {
      return convertBelow100(num);
    } else {
      return (
        ones[Math.floor(num / 100)] +
        " Hundred" +
        (num % 100 !== 0 ? " and " + convertBelow100(num % 100) : "")
      );
    }
  }

  function convert(amount: any) {
    if (amount === 0) {
      return "Zero";
    } else {
      const millions = Math.floor(amount / 1000000);
      const thousands = Math.floor((amount % 1000000) / 1000);
      const remainder = amount % 1000;

      let result = "";

      if (millions > 0) {
        result += convertBelow1000(millions) + " Million";
        if (thousands > 0 || remainder > 0) {
          result += " ";
        }
      }

      if (thousands > 0) {
        result += convertBelow1000(thousands) + " Thousand";
        if (remainder > 0) {
          result += " ";
        }
      }

      if (remainder > 0) {
        result += convertBelow1000(remainder);
      }

      return result;
    }
  }

  return convert(amount);
}


// <table style="width:100%">
//           <tr style="width:100%;height:20px">
//             <td style="width:50%">
//           </td>
//             <td style="width:50%"></td>
//           </tr>
//           <tr style="width:100%;height:70px">
//             <td style="width:50%"></td>
//             <td
//               style="width:50%;border-top:1px solid gray;border-right:1px solid gray;border-left:1px solid gray">
//             </td>
//           </tr>
//           <tr style="width:100%;height:10px">
//           <td style="text-align: left; line-height: 25px; padding: 20px; width: 50%">
//           ${
//             selectedBank
//               ? `
//               <b>Company's Bank Details</b>
//               <br>
//               Bank Name: ${selectedBank?.laccount}
//               <br>
//               Account No: ${selectedBank?.accnum}
//               <br>
//               ${
//                 selectedBank?.branch == "" || selectedBank?.branch == null
//                   ? ""
//                   : `
//               Branch: ${selectedBank?.branch}
//               <br>
//               `
//               }
//               ${
//                 selectedBank?.ifsc == "" || selectedBank?.ifsc == null
//                   ? ""
//                   : `
//               IFSC: ${selectedBank?.ifsc}
//               <br>
//               `
//               }
//               ${
//                 selectedBank?.bicnum == "" || selectedBank?.bicnum == null
//                   ? ""
//                   : `
//               Bank Swift: ${selectedBank?.bicnum}
//               `
//               }
//             `
//               : ""
//           }
//         </td>
//             <td
//               style="width:50%;border-bottom:1px solid gray;border-right:1px solid gray;border-left:1px solid gray;padding-left:120px">
//               Authorised Signatory</td>
//           </tr>
        // </table>