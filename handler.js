'use strict';

const AWS = require('aws-sdk');
const client = new AWS.DynamoDB.DocumentClient();
const SDK = require('@serverless/event-gateway-sdk')
const USERS_TABLE = process.env.USERS_TABLE;
const URL = process.env.URL;

const eventGateway = new SDK({
  url: URL,
})

module.exports.getUser = (event, context, callback) => {

  const params = {
    TableName: USERS_TABLE,
    Key: {
      id: event.data.params.id
    }
  }

  client.get(params, (error, result) => {
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        body: JSON.stringify({errors: [`Could not retrieve user with ID ${event.data.params.id}`]})
      });
      return;
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Item),
    };
    callback(null, response);
  });
};

module.exports.createUser = (event, context, callback) => {
  const user = event.data.body
  if (!user.firstName || !user.lastName || !user.email || !user.id) {
      callback(null, {
        statusCode: 400,
        body: JSON.stringify({errors: [`Invalid request. Missing required field.`]})
      });
  }

  const params = {
    TableName: USERS_TABLE,
    Item: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    }
  }

  client.put(params, (error, result) => {
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        body: JSON.stringify({errors: ['Could not create user']})
      });
      return;
    }

    eventGateway
      .emit({
        event: 'user.created',
        data: params.Item
      })
      .then(() => console.log('Emitted user.created event'))

    const response = {
      statusCode: 200,
      body: JSON.stringify(params.Item),
    };
    callback(null, response);
  });

};

module.exports.addUserToCRM = (event, context, callback) => {

  const user = event.data
  console.log(`Received ${event.event} event with user:`)
  console.dir(user)

  // Add your CRM logic here
  // saveUserToCRM(user)

  callback(null, { message: 'Success' })

};
