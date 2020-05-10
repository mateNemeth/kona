const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const axios = require('axios');
const logger = require('../logger/logger');

const mailIt = async (typeText, price, link, avg, median, user) => {
  const config = {
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
    },
  };

  const request = {
    personalizations: [
      {
        to: [{ email: user }],
        dynamic_template_data: {
          typeText: typeText,
          price: price,
          avg: avg,
          median: median,
          link: link,
        },
      },
    ],
    from: { email: process.env.FROM_EMAIL, name: 'Car Alert' },
    reply_to: { email: process.env.REPLY_EMAIL, name: 'Car Alert' },
    template_id: 'd-1dbea2f8c47b4bbb8f7cc31f515f1d6c',
  };

  try {
    const response = await axios.post(
      'https://api.sendgrid.com/v3/mail/send',
      request,
      config
    );

    logger('info', `Email sent: ${response.config.data}`);
  } catch (error) {
    logger('error', error.stack);
  }
};

module.exports = mailIt;
