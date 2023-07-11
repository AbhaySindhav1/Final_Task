const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const Settings = require("../../Model/settingModel");

let Crediantials = null;
let oAuth2Client;

async function initializeNodemailer() {
  try {
    if (Crediantials === null) {
      const Setting = await Settings.find({});
      Crediantials = {
        CLIENT_ID: Setting[0].EmailID,
        CLIENT_SECRET: Setting[0].EmailSecret,
        REDIRECT_URI: Setting[0].Redirect_Url,
        REFRESH_TOKEN: Setting[0].EmailToken,
      };
    }

    oAuth2Client = new google.auth.OAuth2(
      Crediantials.CLIENT_ID,
      Crediantials.CLIENT_SECRET,
      Crediantials.REDIRECT_URI
    );

    oAuth2Client.setCredentials({ refresh_token: Crediantials.REFRESH_TOKEN });
  } catch (error) {
    console.log("initializeNodeMailer", error);
  }
}

async function updateNodemailer() {
  try {
    const Setting = await Settings.find({});
    Crediantials = {
      CLIENT_ID: Setting[0].EmailID,
      CLIENT_SECRET: Setting[0].EmailSecret,
      REDIRECT_URI: Setting[0].Redirect_Url,
      REFRESH_TOKEN: Setting[0].EmailToken,
    };

    oAuth2Client = new google.auth.OAuth2(
      Crediantials.CLIENT_ID,
      Crediantials.CLIENT_SECRET,
      Crediantials.REDIRECT_URI
    );

    oAuth2Client.setCredentials({ refresh_token: Crediantials.REFRESH_TOKEN });
    // sendMail("abhayabhay202.ar@gmail.com", "update chal raha hai na", "update");
  } catch (error) {
    console.log("updateStripePrivateKey", error);
  }
}

async function sendMail(to, Subject, Text, html) {
  try {
    await initializeNodemailer();
    const Access_token = await oAuth2Client.getAccessToken();
    const transpost = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAUTH2",
        user: "abhaysindhavellu@gmail.com",
        clientId: Crediantials.CLIENT_ID,
        clientSecret: Crediantials.CLIENT_SECRET,
        refreshToken: Crediantials.REFRESH_TOKEN,
        accessToken: Crediantials.Access_token,
      },
    });

    const mailOption = {
      from: "Abhay Sindhav <abhaysindhavellu@gmail.com>",
      to: to,
      subject: Subject,
      text: Text,
    };

    if (html) {
      mailOption.html = html;
    }

    const result = await transpost.sendMail(mailOption);
    // console.log(result);
    return result;
  } catch (error) {
    console.log(error);
    return error;
  }
}

async function GetHtml(Ride) {
  let html = `<!DOCTYPE html>
  <html>
  <head>
    <title>Invoice</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 20px;
      }
      
      .invoice-container {
        border: 1px solid #ccc;
        max-width: 600px;
        width:100%;
        margin: 0 auto;
        padding: 10px;
        overflow-x: scroll; 
        box-sizing:border-box;
      }
      
      .invoice-header {
        text-align: center;
        margin-bottom: 20px;
      }
      
      .invoice-details {
        margin-bottom: 30px;
        font-size: 12px;
      }
      
      .invoice-details p {
        margin: 5px 0;
      }
      
      .invoice-items {
        max-width: 590px;
        border-collapse: collapse;
        background-color: white;
        margin: 0 auto;
        overflow-x: scroll; /* Added to enable horizontal scrolling */
      }
      
      .invoice-items thead {
        background-color: #6d7ae0;
      }
      
      .invoice-items th, .invoice-items td {
        padding: 10px;
        border: 1px solid #ccc;
      }
      
      .invoice-total {
        max-width:100%;
        text-align: right;
        margin-top: 15px;
        font-size: 15px;
      }
      .table-div{
        width:590px;
      }
      
      .invoice-total p {
        margin: 1px 0;
      }
    </style>
  </head>
  <body>
    <div class="invoice-container">
      <div class="invoice-header">
        <h1>Invoice</h1>
      </div>
      
      <div class="invoice-details">
        <p><strong>Invoice Number:</strong> ${Ride._id}</p>
        <p><strong>Date:</strong> ${new Date(Date.now())}</p>
        <p><strong>Billed To:</strong> ${Ride.UserName}</p>
        <p><strong>TIME To :</strong> ${Ride.ScheduleTime}</p>
      </div>
      
      <div class="table-div"> <!-- Added a container div for the table with horizontal scrolling -->
        <table class="invoice-items" >
          <thead>
            <tr>
              <th>PickupPoint</th>
              <th>DropPoint</th>
              <th>Distance</th>
              <th>Ride Time</th>
              <th>Driver</th>
              <th>PaymentType</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${Ride.PickupPoint}</td>
              <td>${Ride.DropPoint}</td>
              <td>${Ride.Distance}</td>
              <td>${Ride.Time}</td>
              <td>${Ride.Driver}</td>
              <td>${Ride.PaymentType}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="invoice-total">
        <p>Ride Charge</p>
        <p><strong>Total:</strong> ${Ride.TripFee}</p>
      </div>
    </div>
  </body>
  </html>
  
  `;
  return html;
}

// sendMail("abhayabhay202.ar@gmail.com", "kuch nahi", "kya hal chal");

module.exports = { sendMail, updateNodemailer, GetHtml };
