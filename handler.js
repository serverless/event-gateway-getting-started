'use strict'

const AWS = require('aws-sdk')
const client = new AWS.DynamoDB.DocumentClient()
const SDK = require('@serverless/event-gateway-sdk')
const USERS_TABLE = process.env.USERS_TABLE
const URL = process.env.URL
const eventGateway = new SDK({
  url: URL,
})

/*
* Create User
*/

module.exports.createUser = (event, context, callback) => {
  const user = event.data.body
  if (!user.firstName || !user.lastName || !user.email || !user.id) {
      callback(null, {
        statusCode: 400,
        body: JSON.stringify({errors: [`Invalid request. Missing required field.`]})
      })
      return
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
      console.error(error)
      callback(null, {
        statusCode: error.statusCode || 501,
        body: JSON.stringify({errors: ['Could not create user']})
      })
      return
    }

    eventGateway
      .emit({
        eventID: '1',
        eventType: 'user.created',
        cloudEventsVersion: '0.1',
        source: '/services/users',
        contentType: 'application/json',
        data: params.Item
      })
      .then(() => console.log('Emitted user.created event'))

    const response = {
      statusCode: 200,
      body: JSON.stringify(params.Item),
    }
    callback(null, response)
  })
}

/*
* Get User
*/

module.exports.getUser = (event, context, callback) => {

  const params = {
    TableName: USERS_TABLE,
    Key: {
      id: event.data.params.id
    }
  }

  client.get(params, (error, result) => {
    if (error) {
      console.error(error)
      callback(null, {
        statusCode: error.statusCode || 501,
        body: JSON.stringify({errors: [`Could not retrieve user with ID ${event.data.params.id}`]})
      })
      return
    }

    if (result.Item === undefined) {
      const response = {
        statusCode: 404,
        body: JSON.stringify({errors: [`Could not retrieve user with ID ${event.data.params.id}`]})
      }
      callback(null, response)
      return
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Item),
    }
    callback(null, response)
  })
}

/*
* Email User
*/

module.exports.emailUser = (event, context, callback) => {

  const user = event.data
  console.log(`Received ${event.eventType} event with user:`)
  console.dir(user)

  // Email your user here

  callback(null, { message: 'Success' })
}
