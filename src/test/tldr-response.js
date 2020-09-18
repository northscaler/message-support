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

message = responseFactory.createFailureFromRequest({
  request,
  data: request.data,
  error: new TestError({ message: 'boom', cause: new NestedTestError({ message: 'bang' }) })
})

console.log(JSON.stringify(message, null, 2))
