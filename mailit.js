const API_KEY = '56cab9b3fc207f738c565084ee0c6114-dc5f81da-4ea9eea1';
const DOMAIN = 'mail.matenemeth.hu';
const HOST = 'api.eu.mailgun.net'
const mailgun = require('mailgun-js')({apiKey: API_KEY, domain: DOMAIN, host: HOST});

const data = {
  from: 'Car Alert <no-reply@mail.matenemeth.hu>',
  to: 'mate.nemeth@outlook.hu',
  subject: 'Hello',
  text: 'Testing some Mailgun awesomeness!'
};

mailgun.messages().send(data, (error, body) => {
  console.log(body);
});

const mailIt = async () => {
    return true
}



module.exports = mailIt