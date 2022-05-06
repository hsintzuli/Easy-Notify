const { AWS_REGION, ACCESS_ID, ACCESS_KEY, SQS_URL } = process.env;

// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');

// Create an SQS service object
const sqs = new AWS.SQS({ apiVersion: '2012-11-05', region: AWS_REGION, accessKeyId: ACCESS_ID, secretAccessKey: ACCESS_KEY });

const sendMessage = async (messageBody) => {
  const params = {
    MessageBody: messageBody,
    QueueUrl: SQS_URL,
    MessageGroupId: 'webpush',
    MessageDeduplicationId: '0',
  };

  sqs.sendMessage(params, function (err, data) {
    if (err) {
      console.log('Error', err);
    } else {
      console.log('Success', data.MessageId);
    }
  });
};

module.exports = {
  sendMessage,
};
