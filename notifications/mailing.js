const AWS = require('aws-sdk');
const path = require('path');
const logger = require('../logger/logger');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

AWS.config.update({
  accessKeyId: process.env.AMAZON_ACCESS_KEY,
  secretAccessKey: process.env.AMAZON_SECRET_KEY,
  region: process.env.AMAZON_REGION,
});

const mailError = async (error) => {
  const params = {
    Destination: {
      ToAddresses: [process.env.LOGGER_EMAIL],
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: `${JSON.stringify(error)}`,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: 'Error',
      },
    },
    Source: process.env.FROM_EMAIL,
    ReplyToAddresses: [process.env.REPLY_EMAIL],
  };

  const sendPromise = new AWS.SES({ apiVersion: '2010-12-01' })
    .sendEmail(params)
    .promise();

  sendPromise
    .then(function (data) {
      logger('warn', `Error notification sent.`);
    })
    .catch(function (err) {
      logger('error', err.stack);
    });
};

const mailIt = async (typeText, price, link, avg, median, user) => {
  const params = {
    Destination: {
      ToAddresses: [user],
      BccAddresses: [process.env.BCC_EMAIL],
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: 'UTF-8',
          Data: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  
          <html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml">
          <head>
          <!--[if gte mso 9]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
          <meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>
          <meta content="width=device-width" name="viewport"/>
          <!--[if !mso]><!-->
          <meta content="IE=edge" http-equiv="X-UA-Compatible"/>
          <!--<![endif]-->
          <title></title>
          <!--[if !mso]><!-->
          <!--<![endif]-->
          <style type="text/css">
              body {
                margin: 0;
                padding: 0;
              }
          
              table,
              td,
              tr {
                vertical-align: top;
                border-collapse: collapse;
              }
          
              * {
                line-height: inherit;
              }
          
              a[x-apple-data-detectors=true] {
                color: inherit !important;
                text-decoration: none !important;
              }
            </style>
          <style id="media-query" type="text/css">
              @media (max-width: 520px) {
          
                .block-grid,
                .col {
                  min-width: 320px !important;
                  max-width: 100% !important;
                  display: block !important;
                }
          
                .block-grid {
                  width: 100% !important;
                }
          
                .col {
                  width: 100% !important;
                }
          
                .col_cont {
                  margin: 0 auto;
                }
          
                img.fullwidth,
                img.fullwidthOnMobile {
                  max-width: 100% !important;
                }
          
                .no-stack .col {
                  min-width: 0 !important;
                  display: table-cell !important;
                }
          
                .no-stack.two-up .col {
                  width: 50% !important;
                }
          
                .no-stack .col.num2 {
                  width: 16.6% !important;
                }
          
                .no-stack .col.num3 {
                  width: 25% !important;
                }
          
                .no-stack .col.num4 {
                  width: 33% !important;
                }
          
                .no-stack .col.num5 {
                  width: 41.6% !important;
                }
          
                .no-stack .col.num6 {
                  width: 50% !important;
                }
          
                .no-stack .col.num7 {
                  width: 58.3% !important;
                }
          
                .no-stack .col.num8 {
                  width: 66.6% !important;
                }
          
                .no-stack .col.num9 {
                  width: 75% !important;
                }
          
                .no-stack .col.num10 {
                  width: 83.3% !important;
                }
          
                .video-block {
                  max-width: none !important;
                }
          
                .mobile_hide {
                  min-height: 0px;
                  max-height: 0px;
                  max-width: 0px;
                  display: none;
                  overflow: hidden;
                  font-size: 0px;
                }
          
                .desktop_hide {
                  display: block !important;
                  max-height: none !important;
                }
              }
            </style>
          </head>
          <body class="clean-body" style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #FFFFFF;">
          <!--[if IE]><div class="ie-browser"><![endif]-->
          <table bgcolor="#FFFFFF" cellpadding="0" cellspacing="0" class="nl-container" role="presentation" style="table-layout: fixed; vertical-align: top; min-width: 320px; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #FFFFFF; width: 100%;" valign="top" width="100%">
          <tbody>
          <tr style="vertical-align: top;" valign="top">
          <td style="word-break: break-word; vertical-align: top;" valign="top">
          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color:#FFFFFF"><![endif]-->
          <div style="background-color:transparent;overflow:hidden">
          <div class="block-grid" style="min-width: 320px; max-width: 500px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; Margin: 0 auto; width: 100%; background-color: #ffa818;">
          <div style="border-collapse: collapse;display: table;width: 100%;background-color:#ffa818;">
          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:transparent;"><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:500px"><tr class="layout-full-width" style="background-color:#ffa818"><![endif]-->
          <!--[if (mso)|(IE)]><td align="center" width="500" style="background-color:#ffa818;width:500px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:5px; padding-bottom:5px;"><![endif]-->
          <div class="col num12" style="min-width: 320px; max-width: 500px; display: table-cell; vertical-align: top; width: 500px;">
          <div class="col_cont" style="width:100% !important;">
          <!--[if (!mso)&(!IE)]><!-->
          <div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;">
          <!--<![endif]-->
          <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 10px; padding-left: 10px; padding-top: 10px; padding-bottom: 10px; font-family: 'Trebuchet MS', Tahoma, sans-serif"><![endif]-->
          <div style="color:#555555;font-family:'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;">
          <div style="line-height: 1.2; font-size: 12px; color: #555555; font-family: 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif; mso-line-height-alt: 14px;">
          <p style="text-align: center; line-height: 1.2; word-break: break-word; font-size: 16px; mso-line-height-alt: 19px; margin: 0;"><span style="font-size: 16px;"><strong><span style="color: #ffffff;">Figyelem! Új olcsó autó hirdetést találtunk!</span></strong></span></p>
          </div>
          </div>
          <!--[if mso]></td></tr></table><![endif]-->
          <!--[if (!mso)&(!IE)]><!-->
          </div>
          <!--<![endif]-->
          </div>
          </div>
          <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
          <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
          </div>
          </div>
          </div>
          <div style="background-color:transparent;overflow:hidden">
          <div class="block-grid" style="min-width: 320px; max-width: 500px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; Margin: 0 auto; width: 100%; background-color: transparent;">
          <div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;">
          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:transparent;"><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:500px"><tr class="layout-full-width" style="background-color:transparent"><![endif]-->
          <!--[if (mso)|(IE)]><td align="center" width="500" style="background-color:transparent;width:500px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:5px; padding-bottom:5px;"><![endif]-->
          <div class="col num12" style="min-width: 320px; max-width: 500px; display: table-cell; vertical-align: top; width: 500px;">
          <div class="col_cont" style="width:100% !important;">
          <!--[if (!mso)&(!IE)]><!-->
          <div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;">
          <!--<![endif]-->
          <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 10px; padding-left: 10px; padding-top: 10px; padding-bottom: 10px; font-family: 'Trebuchet MS', Tahoma, sans-serif"><![endif]-->
          <div style="color:#555555;font-family:'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;">
          <div style="line-height: 1.2; font-size: 12px; color: #555555; font-family: 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif; mso-line-height-alt: 14px;">
          <p style="font-size: 14px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 17px; margin: 0;">Találat: ${typeText} - <span style="font-weight: bold;">${new Intl.NumberFormat(
            'de-DE',
            {
              style: 'currency',
              currency: 'EUR',
            }
          ).format(price)}</span></p>
          </div>
          </div>
          <!--[if mso]></td></tr></table><![endif]-->
          <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 10px; padding-left: 10px; padding-top: 10px; padding-bottom: 10px; font-family: 'Trebuchet MS', Tahoma, sans-serif"><![endif]-->
          <div style="color:#555555;font-family:'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;">
          <div style="line-height: 1.2; font-size: 12px; color: #555555; font-family: 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif; mso-line-height-alt: 14px;">
          <p style="font-size: 14px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 17px; margin: 0;">A típus átlagos ára: <span style="font-weight: bold;">${new Intl.NumberFormat(
            'de-DE',
            {
              style: 'currency',
              currency: 'EUR',
            }
          ).format(avg)}</span></p>
          </div>
          </div>
          <!--[if mso]></td></tr></table><![endif]-->
          <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 10px; padding-left: 10px; padding-top: 10px; padding-bottom: 10px; font-family: 'Trebuchet MS', Tahoma, sans-serif"><![endif]-->
          <div style="color:#555555;font-family:'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;">
          <div style="line-height: 1.2; font-size: 12px; color: #555555; font-family: 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif; mso-line-height-alt: 14px;">
          <p style="font-size: 14px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 17px; margin: 0;">A típus medián ára: <span style="font-weight: bold;">${new Intl.NumberFormat(
            'de-DE',
            {
              style: 'currency',
              currency: 'EUR',
            }
          ).format(median)}</span></p>
          </div>
          </div>
          <!--[if mso]></td></tr></table><![endif]-->
          <!--[if (!mso)&(!IE)]><!-->
          </div>
          <!--<![endif]-->
          </div>
          </div>
          <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
          <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
          </div>
          </div>
          </div>
          <div style="background-color:transparent;overflow:hidden">
          <div class="block-grid mixed-two-up" style="min-width: 320px; max-width: 500px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; Margin: 0 auto; width: 100%; background-color: transparent;">
          <div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;">
          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:transparent;"><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:500px"><tr class="layout-full-width" style="background-color:transparent"><![endif]-->
          <!--[if (mso)|(IE)]><td align="center" width="333" style="background-color:transparent;width:333px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:10px; padding-bottom:5px;"><![endif]-->
          <div class="col num8" style="display: table-cell; vertical-align: top; min-width: 320px; max-width: 328px; width: 333px;">
          <div class="col_cont" style="width:100% !important;">
          <!--[if (!mso)&(!IE)]><!-->
          <div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:10px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;">
          <!--<![endif]-->
          <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 10px; padding-left: 10px; padding-top: 10px; padding-bottom: 10px; font-family: 'Trebuchet MS', Tahoma, sans-serif"><![endif]-->
          <div style="color:#555555;font-family:'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;">
          <div style="line-height: 1.2; font-size: 12px; color: #555555; font-family: 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif; mso-line-height-alt: 14px;">
          <p style="font-size: 14px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 17px; margin: 0;">A hirdetést a gombra kattintva érheti el:</p>
          </div>
          </div>
          <!--[if mso]></td></tr></table><![endif]-->
          <!--[if (!mso)&(!IE)]><!-->
          </div>
          <!--<![endif]-->
          </div>
          </div>
          <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
          <!--[if (mso)|(IE)]></td><td align="center" width="166" style="background-color:transparent;width:166px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:5px; padding-bottom:5px;"><![endif]-->
          <div class="col num4" style="display: table-cell; vertical-align: top; max-width: 320px; min-width: 164px; width: 166px;">
          <div class="col_cont" style="width:100% !important;">
          <!--[if (!mso)&(!IE)]><!-->
          <div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;">
          <!--<![endif]-->
          <div align="left" class="button-container" style="padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;">
          <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing: 0; border-collapse: collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;"><tr><td style="padding-top: 10px; padding-right: 10px; padding-bottom: 10px; padding-left: 10px" align="left"><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${link}" style="height:21.75pt; width:97.5pt; v-text-anchor:middle;" arcsize="14%" stroke="false" fillcolor="#3AAEE0"><w:anchorlock/><v:textbox inset="0,0,0,0"><center style="color:#ffffff; font-family:'Trebuchet MS', Tahoma, sans-serif; font-size:16px"><![endif]--><a href="${link}" style="-webkit-text-size-adjust: none; text-decoration: none; display: inline-block; color: #ffffff; background-color: #3AAEE0; border-radius: 4px; -webkit-border-radius: 4px; -moz-border-radius: 4px; width: auto; width: auto; border-top: 1px solid #3AAEE0; border-right: 1px solid #3AAEE0; border-bottom: 1px solid #3AAEE0; border-left: 1px solid #3AAEE0; padding-top: 5px; padding-bottom: 5px; font-family: 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif; text-align: center; mso-border-alt: none; word-break: keep-all;" target="_blank"><span style="padding-left:20px;padding-right:20px;font-size:16px;display:inline-block;"><span style="font-size: 16px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 19px;">Megtekintés</span></span></a>
          <!--[if mso]></center></v:textbox></v:roundrect></td></tr></table><![endif]-->
          </div>
          <!--[if (!mso)&(!IE)]><!-->
          </div>
          <!--<![endif]-->
          </div>
          </div>
          <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
          <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
          </div>
          </div>
          </div>
          <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
          </td>
          </tr>
          </tbody>
          </table>
          <!--[if (IE)]></div><![endif]-->
          </body>
          </html>`,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: `${typeText} - ${new Intl.NumberFormat('de-DE', {
          style: 'currency',
          currency: 'EUR',
        }).format(price)}`,
      },
    },
    Source: process.env.FROM_EMAIL /* required */,
    ReplyToAddresses: [
      process.env.REPLY_EMAIL,
      /* more items */
    ],
  };

  const sendPromise = new AWS.SES({ apiVersion: '2010-12-01' })
    .sendEmail(params)
    .promise();

  // Handle promise's fulfilled/rejected states
  sendPromise
    .then(function (data) {
      logger('info', `Email sent: ${user}`);
    })
    .catch(function (err) {
      logger('error', err.stack);
    });
};

module.exports = { mailIt, mailError };
