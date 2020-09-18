const { CodedError } = require('@northscaler/error-support')
const { EventMessageFactory } = require('../main/factories') // require('@northscaler/message-support').factories
const pkg = require('../../package.json') // or whatever

const TestError = CodedError({ name: 'TestError' })
const NestedTestError = CodedError({ name: 'NestedTestError' })

const factory = new EventMessageFactory({
  componentName: pkg.name,
  componentVersion: pkg.version,
  includeErrorStacks: false,
  includeErrorCauses: true
})

let message = factory.createSuccess({
  data: { username: 'matthew', email: 'me@me.com' },
  action: 'CREATE_USER',
  traceId: '456',
  correlationId: '789'
})

console.log(JSON.stringify(message, null, 2))

message = factory.createFailure({
  data: { username: 'matthew', email: 'me@me.com' },
  action: 'CREATE_USER',
  error: new TestError({ message: 'boom', cause: new NestedTestError({ message: 'bang' }) }),
  traceId: '456',
  correlationId: '789'
})

console.log(JSON.stringify(message, null, 2))

message = factory.createFuture({
  data: { username: 'matthew', email: 'me@me.com' },
  action: 'CREATE_USER',
  traceId: '456',
  correlationId: '789'
})

console.log(JSON.stringify(message, null, 2))
