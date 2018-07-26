# Event Gateway REST API

This example shows a simple way to deploy a REST API via the Event Gateway and AWS Lambda. It uses the hosted version provided by Serverless, Inc. -- [Sign up here](https://dashboard.serverless.com)!

This service will deploy three functions:

- `createUser`: an HTTP endpoint for creating and storing a User in a DynamoDB table;
- `getUser`: an HTTP endpoint for retrieving a User from DynamoDB; and
- `emailUser`: a function that is triggered by a `user.created` event and pretends to email the user with a welcome message.

The `createUser` function allows you to create a new User by sending a JSON payload to `/users`, and the `getUser` function lets you retrieve that User by making a GET request to `/users/{id}`.

In the `createUser` function, we're using the [Event Gateway SDK](https://github.com/serverless/event-gateway-sdk) to emit a custom event of `user.created` into the Event Gateway. You can then subscribe functions to react to this custom event. The `emailUser` function is subscribed to this event as an example -- imagine a Marketing department that wants to handle emails.

Let's get started!

## Quick-Start

Follow this [guide](https://github.com/serverless/platform/blob/master/docs/getting-started.md) to get the Serverless Framework & Event Gateway set up.

Clone this repository, `cd` into it and run `npm i`

Make sure you have created an Application in the [Serverless Dashboard](https://dashboard.serverless.com) and filled in your `tenant` and `app` in your `serverless.yml` file.

```yaml
# serverless.yml

tenant: mytenant # Insert your tenant
app: demos # Insert your app
service: v1-eg-rest-api # Come up with a service name
```

Deploy your service

```bash
$ serverless deploy
```

Create a new user by hitting the createUser endpoint:

```bash
$ APP="<appURL>"
$ curl -X POST -H "Content-Type: application/json" https://${APP}/users \
    --data '{
    	"id": "10",
    	"firstName": "Donald",
    	"lastName": "Duck",
    	"email": "donald.duck@disney.com"
    }'

# {"id":10,"firstName":"Donald","lastName":"Duck","email":"donald.duck@disney.com"}
```

You can now retrieve your user by using the getUser endpoint:

```bash
$ APP="<appURL>"
$ curl -X GET https://${APP}/users/10

# {"id":"10","email":"donald.duck@disney.com","firstName":"Donald","lastName":"Duck"}
```

In your createUser code, it emits a `user.created` event to the Event Gateway, which triggers the `emailUser` function, which then emits a `email.sent` event. You can check the logs for the Event Gateway in the [Dashboard](https://dashboard.serverless.com), just navigate to your Service and click the "logs" tab.

## Additional Resources:

- [Serverless Platform Docs](https://github.com/serverless/platform)
- [Event Gateway plugin](https://github.com/serverless/serverless-event-gateway-plugin) for the Serverless Framework
- [Event Gateway SDK](https://github.com/serverless/event-gateway-sdk) for interacting with the Event Gateway in your application code
