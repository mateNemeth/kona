const API_KEY = '56cab9b3fc207f738c565084ee0c6114-dc5f81da-4ea9eea1';
const DOMAIN = 'sandboxe933a015db3e465ca29369f7f6dc10e6.mailgun.org';
const mailgun = require('mailgun-js')({apiKey: API_KEY, domain: DOMAIN});

const data = {
  from: 'Excited User <me@samples.mailgun.org>',
  to: 'mate.nemeth@outlook.hu',
  subject: 'Hello',
  text: 'Testing some Mailgun awesomeness!'
};

mailgun.messages().send(data, (error, body) => {
  console.log(body);
});