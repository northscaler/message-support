const { RequestMessageFactory } = require('../main/factories')// require('@northscaler/message-support').factories
const pkg = require('../../package.json') // or whatever

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
