'use strict'

const { MissingRequiredArgumentError } = require('@northscaler/error-support')
const { ResponseStatus } = require('@northscaler/service-support')
const AbstractMessageFactory = require('./AbstractMessageFactory')

class ResponseMessageFactory extends AbstractMessageFactory {
  createSuccessFromRequest ({ request, data, includeErrorStacks, includeErrorCauses }) {
    return this._createFromRequest({
      request,
      data,
      status: ResponseStatus.SUCCESS,
      includeErrorStacks,
      includeErrorCauses
    })
  }

  createFailureFromRequest ({ request, error, data, includeErrorStacks, includeErrorCauses }) {
    return this._createFromRequest({
      request,
      error,
      data,
      status: ResponseStatus.FAILURE,
      includeErrorStacks,
      includeErrorCauses
    })
  }

  _createFromRequest ({ request, status, data, error, includeErrorStacks, includeErrorCauses }) {
    if (!request) throw new MissingRequiredArgumentError({ message: 'request required' })

    return this.create({
      action: request.meta.action,
      traceId: request.meta.traceId,
      correlationId: request.meta.correlationId,
      status,
      data,
      error,
      startInstant: request.meta.instant,
      includeErrorStacks,
      includeErrorCauses
    })
  }

  create ({ action, status, data, error, traceId, correlationId, startInstant, includeErrorStacks, includeErrorCauses } = {}) {
    if (!status) throw new MissingRequiredArgumentError({ message: 'status required' })
    status = ResponseStatus.of(status)

    if (status === ResponseStatus.FAILURE && !error) throw new MissingRequiredArgumentError({ message: 'error required when FAILURE' })
    status = status.name

    const start = Date.parse(startInstant) || undefined

    const message = this._createBase({ data, error, traceId, correlationId, includeErrorStacks, includeErrorCauses })
    message.meta.response = {
      action,
      status,
      elapsedMillis: start && (Date.now() - start)
    }

    return message
  }
}

module.exports = ResponseMessageFactory
