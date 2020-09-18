# `@northscaler/message-support`

Message factories to use in your [CQRS](https://www.martinfowler.com/bliki/CQRS.html) or asynchronous, message-based architectures.

## Types of messages

This library supports three types of messages:
* request,
* response, and
* event

messages.

### Key message features

There are three top-level sections to each message:

* `data`: the payload of the message, which is usually an object,
* `meta`: data about the message, including
  * `id`: the unique message id,
  * `origin`: the location (component & hostname) where the message was created,
  * `instant`: the instant in time the message was created,
  * `traceId`: a trace id that can be used for distributed tracing which can be given or is generated, and
  * `correlationId`: an id that, if present, indicates that something is awaiting a response,
* `error`: present if there is an error processing a message, including
  * `name`: the `Error.name` value,
  * `message`: the `Error.message` value,
  * `stack`: if so configured (false by default), the `Error.stack` value,
  * `code`: the `Error.code` value, if present,
  * `info`: the `Error.info` value, containing contextual information provided with the `Error`, if present,
  * `cause`: if so configured (false by default), the `Error.cause` value, holding the cause of the `Error`, if present.

In addition, all message types have an `action` in a type-dependent location.
* For a request message, it's in the `meta.request` section.
* For an event message, it's the `meta.event` section.
* For a response message, it's in the `meta.response` section.

Each message type may include other, type-specific fields as documented.

### Custom data
The `data` section is never inspected, as it is always application-specific.
Sometimes, applications need more than just an `action` property in the message.
You are free to add properties anywhere you like after the factory has created the message.
Common properties like this include
* `scope`, `domain` or `context`, indicating some conceptual boundary that only applies to certain message processors and usually placed next to `action`,
* `type`, indicating the type of the entity being manipulated for CRUD operations and is also usually placed next to `action`, and
* `auth`, `security`, `securityContext`, `user` or `userContext`, holding information about the authenticated user (like user id, roles played, scopes granted, etc) causing the activity and is usually placed directly in the `meta` section.

### Request messages

Use the `RequestMessageFactory` to create a request message.

```javascript
const { RequestMessageFactory } = require('@northscaler/message-support').factories
const pkg = require('.../package.json') // or whatever

const factory = new RequestMessageFactory({
  componentName: pkg.name,
  componentVersion: pkg.version
})

const message = factory.create({
  data: { username: 'matthew', email: 'me@me.com' },
  action: 'CREATE_USER',
  traceId: '456',
  correlationId: '789'
})

console.log(JSON.stringify(message, null, 2))

/* logs something like:
{
  "data": {
    "username": "matthew",
    "email": "me@me.com"
  },
  "meta": {
    "id": "c6cac4e6-47e4-4e6c-b0eb-95984c04b9f3",
    "instant": "2020-09-18T18:40:52.069Z",
    "traceId": "456",
    "origin": {
      "component": "@northscaler/message-support",
      "version": "0.1.0-pre.0",
      "hostname": "rocky.local"
    },
    "request": {
      "action": "CREATE_USER"
    },
    "correlationId": "789"
  }
}
*/
```

### Event messages

Use the `EventMessageFactory` to create event messages.
There are two temporal kinds of event messages, past & future, and two kinds of past events, successful & unsuccessful.

The most common is a success event:

```javascript
const { CodedError } = require('@northscaler/error-support')
const { EventMessageFactory } = require('../main/factories') // require('@northscaler/message-support').factories
const pkg = require('../../package.json') // or whatever

const TestError = CodedError({ name: 'TestError' })
const NestedTestError = CodedError({ name: 'NestedTestError' })

const factory = new EventMessageFactory({
  componentName: pkg.name,
  componentVersion: pkg.version,
  includeErrorStacks: true,
  includeErrorCauses: true
})

let message = factory.createSuccess({
  data: { username: 'matthew', email: 'me@me.com' },
  action: 'CREATE_USER',
  traceId: '456',
  correlationId: '789'
})

/* logs something like:
{
  "data": {
    "username": "matthew",
    "email": "me@me.com"
  },
  "meta": {
    "id": "5cfc0636-c1a8-4878-b2fd-d954db7157ea",
    "instant": "2020-09-18T19:10:56.072Z",
    "traceId": "456",
    "origin": {
      "component": "@northscaler/message-support",
      "version": "0.1.0-pre.0",
      "hostname": "rocky.local"
    },
    "event": {
      "did": "CREATE_USER",
      "status": "SUCCESS"
    }
  }
}
*/
```

Another common one is a failure event:

```javascript
message = factory.createFailure({
  data: { username: 'matthew', email: 'me@me.com' },
  action: 'CREATE_USER',
  error: new TestError({ message: 'boom', cause: new NestedTestError({ message: 'bang' }) }),
  traceId: '456',
  correlationId: '789'
})

console.log(JSON.stringify(message, null, 2))

/* logs something like:
{
  "data": {
    "username": "matthew",
    "email": "me@me.com"
  },
  "error": {
    "name": "TestError",
    "code": "E_TEST",
    "cause": {
      "name": "NestedTestError",
      "code": "E_NESTED_TEST",
      "message": "E_NESTED_TEST: bang",
      "stack": null
    },
    "message": "E_TEST: boom: E_NESTED_TEST: bang",
    "stack": null
  },
  "meta": {
    "id": "e6232595-35cd-461f-9488-a7b69efd31b1",
    "instant": "2020-09-18T19:07:52.359Z",
    "traceId": "456",
    "origin": {
      "component": "@northscaler/message-support",
      "version": "0.1.0-pre.0",
      "hostname": "rocky.local"
    },
    "event": {
      "did": "CREATE_USER",
      "status": "FAILURE"
    }
  }
}
*/
```

You can also send events indicating that something is about to happen:

```javascript
message = factory.createFuture({
  data: { username: 'matthew', email: 'me@me.com' },
  action: 'CREATE_USER',
  traceId: '456',
  correlationId: '789'
})

console.log(JSON.stringify(message, null, 2))

/* logs something like:
{
  "data": {
    "username": "matthew",
    "email": "me@me.com"
  },
  "meta": {
    "id": "d5f024da-2ad9-43a2-aa9c-7d992088db96",
    "instant": "2020-09-18T19:14:46.625Z",
    "traceId": "456",
    "origin": {
      "component": "@northscaler/message-support",
      "version": "0.1.0-pre.0",
      "hostname": "rocky.local"
    },
    "event": {
      "will": "CREATE_USER"
    }
  }
}
*/
```

### Response messages

Use the `ResponseMessageFactory` to create response messages for request messages that include a `correlationId`, indicating that something is expecting a response after the request is handled.
There are two kinds of response messages, successful & unsuccessful.

The most common is a successful response.
This example uses the convenience method `createSuccessFromRequest`.

```javascript
const { CodedError } = require('@northscaler/error-support')
const { ResponseMessageFactory, RequestMessageFactory } = require('../main/factories') // require('@northscaler/message-support').factories
const pkg = require('../../package.json') // or whatever

const TestError = CodedError({ name: 'TestError' })
const NestedTestError = CodedError({ name: 'NestedTestError' })

const requestFactory = new RequestMessageFactory({
  componentName: pkg.name,
  componentVersion: pkg.version,
  includeErrorStacks: false,
  includeErrorCauses: true
})

const responseFactory = new ResponseMessageFactory({
  componentName: pkg.name,
  componentVersion: pkg.version,
  includeErrorStacks: false,
  includeErrorCauses: true
})

// this is the request to which we're going to send a response message
const request = requestFactory.create({
  data: { username: 'matthew', email: 'me@me.com' },
  action: 'CREATE_USER',
  traceId: '456',
  correlationId: '789'
})

// say the service we delegated to assigned id '246' to the user, so add that to the data
let message = responseFactory.createSuccessFromRequest({ request, data: { ...request.data, id: '246' } })

console.log(JSON.stringify(message, null, 2))

/* logs something like:
{
  "data": {
    "username": "matthew",
    "email": "me@me.com",
    "id": "246"
  },
  "meta": {
    "id": "cdd0617b-d6f8-46be-ae84-700b86d7ac30",
    "instant": "2020-09-18T19:25:33.464Z",
    "traceId": "456",
    "origin": {
      "component": "@northscaler/message-support",
      "version": "0.1.0-pre.0",
      "hostname": "rocky.local"
    },
    "response": {
      "status": "SUCCESS",
      "elapsedMillis": 134
    },
    "correlationId": "789"
  }
}
*/
```

Here is a failure response.
This example uses the convenience method `createFailureFromRequest`.

```javascript
message = responseFactory.createFailureFromRequest({
  request,
  data: request.data,
  error: new TestError({ message: 'boom', cause: new NestedTestError({ message: 'bang' }) })
})

console.log(JSON.stringify(message, null, 2))

/* logs something like:
{
  "data": {
    "username": "matthew",
    "email": "me@me.com"
  },
  "error": {
    "name": "TestError",
    "code": "E_TEST",
    "cause": {
      "name": "NestedTestError",
      "code": "E_NESTED_TEST",
      "message": "E_NESTED_TEST: bang",
      "stack": null
    },
    "message": "E_TEST: boom: E_NESTED_TEST: bang",
    "stack": null
  },
  "meta": {
    "id": "840f5486-fe35-4661-9435-796aa0ce3483",
    "instant": "2020-09-18T19:35:36.181Z",
    "traceId": "456",
    "origin": {
      "component": "@northscaler/message-support",
      "version": "0.1.0-pre.0",
      "hostname": "rocky.local"
    },
    "response": {
      "status": "FAILURE",
      "elapsedMillis": 4
    },
    "correlationId": "789"
  }
}
*/
```

There is also a more general method called `create` to which these convenience methods delegate.
