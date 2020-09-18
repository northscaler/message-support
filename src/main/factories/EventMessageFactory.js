'use strict'

const { MissingRequiredArgumentError } = require('@northscaler/error-support')
const { ResponseStatus } = require('@northscaler/service-support').enums
const AbstractMessageFactory = require('./AbstractMessageFactory')
const { OverspecifiedMessageError } = require('../errors')

class EventMessageFactory extends AbstractMessageFactory {
  createSuccess ({ action, data, traceId, includeErrorStacks, includeErrorCauses } = {}) {
    return this._create({ did: action, status: ResponseStatus.SUCCESS, data, traceId, includeErrorStacks, includeErrorCauses })
  }

  createFailure ({ action, error, data, traceId, includeErrorStacks, includeErrorCauses } = {}) {
    return this._create({ did: action, status: ResponseStatus.FAILURE, error, data, traceId, includeErrorStacks, includeErrorCauses })
  }

  createFuture ({ action, traceId, data, includeErrorStacks, includeErrorCauses } = {}) {
    return this._create({ will: action, traceId, data, includeErrorStacks, includeErrorCauses })
  }

  _create ({ data, error, will, did, status, traceId, includeErrorStacks, includeErrorCauses } = {}) {
    if (did && !status) throw new MissingRequiredArgumentError({ message: 'status required' })
    if (did && will) throw new OverspecifiedMessageError({ message: 'will & did given' })
    if (!(did || will)) throw new MissingRequiredArgumentError({ message: 'will or did required' })
    if (status === ResponseStatus.FAILURE && !error) throw new MissingRequiredArgumentError({ message: 'error required' })
    status = status && status.name

    const message = this._createBase({ data, error, traceId, includeErrorStacks, includeErrorCauses })
    message.meta.event = { will, did, status }

    return message
  }
}

module.exports = EventMessageFactory
