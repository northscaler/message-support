'use strict'

const AbstractMessageFactory = require('./AbstractMessageFactory')

class RequestMessageFactory extends AbstractMessageFactory {
  create ({ action, data, traceId, correlationId } = {}) {
    const message = this._createBase({ data, traceId, correlationId })
    message.meta = {
      ...message.meta,
      request: { action }
    }

    return message
  }
}

module.exports = RequestMessageFactory
