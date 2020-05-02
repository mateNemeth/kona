require('dotenv').config();
const axios = require('axios');

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
        to: [{ email: 'mate.nemeth@outlook.hu' }],
        dynamic_template_data: {
          typeText: typeText,
          price: price,
          avg: avg,
          median: median,
          link: link,
        },
      },
    ],
    from: { email: user, name: 'Car Alert' },
    reply_to: { email: 'no-reply@matenemeth.hu', name: 'Car Alert' },
    template_id: 'd-1dbea2f8c47b4bbb8f7cc31f515f1d6c',
  };

  try {
    const response = await axios.post(
      'https://api.sendgrid.com/v3/mail/send',
      request,
      config
    );

    console.log(response.config.data);
  } catch (error) {
    console.error(error);
  }
};

module.exports = mailIt;
