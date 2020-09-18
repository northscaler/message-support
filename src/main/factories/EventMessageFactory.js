'use strict'

const { MissingRequiredArgumentError } = require('@northscaler/error-support')
const { ResponseStatus } = require('@northscaler/service-support').enums
const AbstractMessageFactory = require('./AbstractMessageFactory')
const { OverspecifiedMessageError } = require('../errors')

class EventMessageFactory extends AbstractMessageFactory {
  createSuccessFromRequest ({ request, includeErrorStacks, includeErrorCauses }) {
    return this.createSuccess({
      action: request.meta.request.action,
      data: request.data,
      traceId: request.meta.traceId,
      correlationId: request.meta.correlationId,
      includeErrorStacks,
      includeErrorCauses
    })
  }

  createFailureFromRequest ({ request, error, includeErrorStacks, includeErrorCauses }) {
    return this.createFailure({
      action: request.meta.request.action,
      data: request.data,
      error,
      traceId: request.meta.traceId,
      correlationId: request.meta.correlationId,
      includeErrorStacks,
      includeErrorCauses
    })
  }

  createFutureFromRequest ({ request, includeErrorStacks, includeErrorCauses }) {
    return this.createFuture({
      action: request.meta.request.action,
      data: request.data,
      traceId: request.meta.traceId,
      correlationId: request.meta.correlationId,
      includeErrorStacks,
      includeErrorCauses
    })
  }

  createSuccess ({ action, data, traceId, correlationId, includeErrorStacks, includeErrorCauses } = {}) {
    return this._create({
      did: action,
      status: ResponseStatus.SUCCESS,
      data,
      traceId,
      correlationId,
      includeErrorStacks,
      includeErrorCauses
    })
  }

  createFailure ({ action, error, data, traceId, correlationId, includeErrorStacks, includeErrorCauses } = {}) {
    return this._create({
      did: action,
      status: ResponseStatus.FAILURE,
      error,
      data,
      traceId,
      correlationId,
      includeErrorStacks,
      includeErrorCauses
    })
  }

  createFuture ({ action, traceId, correlationId, data, includeErrorStacks, includeErrorCauses } = {}) {
    return this._create({ will: action, traceId, correlationId, data, includeErrorStacks, includeErrorCauses })
  }

  _create ({ data, error, will, did, status, traceId, correlationId, includeErrorStacks, includeErrorCauses } = {}) {
    if (did && !status) throw new MissingRequiredArgumentError({ message: 'status required' })
    if (did && will) throw new OverspecifiedMessageError({ message: 'will & did given' })
    if (!(did || will)) throw new MissingRequiredArgumentError({ message: 'will or did required' })
    if (status === ResponseStatus.FAILURE && !error) throw new MissingRequiredArgumentError({ message: 'error required' })
    status = status && status.name

    const message = this._createBase({ data, error, traceId, correlationId, includeErrorStacks, includeErrorCauses })
    message.meta.event = { will, did, status }

    return message
  }
}

module.exports = EventMessageFactory
