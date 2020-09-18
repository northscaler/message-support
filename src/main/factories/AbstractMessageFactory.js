'use strict'

const os = require('os')
const uuid = require('uuid').v4

class AbstractMessageFactory {
  constructor ({
    componentName,
    componentVersion,
    hostname = os.hostname(),
    includeErrorStacks = false,
    includeErrorCauses = false
  } = {}) {
    this.componentName = componentName
    this.componentVersion = componentVersion
    this.hostname = hostname

    this.origin = {
      component: this.componentName,
      version: this.componentVersion,
      hostname: this.hostname
    }

    this.includeErrorStacks = includeErrorStacks
    this.includeErrorCauses = includeErrorCauses
  }

  _createBase ({ data, error, traceId, correlationId, includeErrorStacks, includeErrorCauses } = {}) {
    return {
      data,
      error: this._createError(error, { includeErrorStacks, includeErrorCauses }),
      meta: {
        id: uuid(),
        instant: new Date().toISOString(),
        traceId: traceId || uuid(),
        correlationId,
        origin: this.origin
      }
    }
  }

  _createError (error, { includeErrorStacks, includeErrorCauses } = {}) {
    if (!error) return error

    includeErrorStacks = includeErrorStacks === undefined ? this.includeErrorStacks : includeErrorStacks
    includeErrorCauses = includeErrorCauses === undefined ? this.includeErrorCauses : includeErrorCauses

    const omitting = []
    if (!includeErrorCauses) omitting.push('cause')
    if (!includeErrorStacks) omitting.push('stack')

    if (typeof error.toObject === 'function') return error.toObject({ omitting })
    return {
      message: error.message,
      name: error.name,
      code: error.code,
      info: error.info,
      cause: this._createError(error.cause)
    }
  }
}

module.exports = AbstractMessageFactory
