const { AWS_REGION, ACCESS_ID, ACCESS_KEY, SQS_URL } = process.env;
const moment = require('moment');

// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');

// Create an SQS service object
const sqs = new AWS.SQS({ region: AWS_REGION, accessKeyId: ACCESS_ID, secretAccessKey: ACCESS_KEY });

const sendMessage = async (messageBody) => {
  const params = {
    MessageBody: messageBody,
    QueueUrl: SQS_URL,
  };
  console.log('Send message to SQS at:', moment());
  sqs.sendMessage(params, function (err, data) {
    if (err) {
      console.log('Error', err);
    } else {
      console.log('SQS Success', data.MessageId);
    }
  });
};

module.exports = {
  sendMessage,
};
