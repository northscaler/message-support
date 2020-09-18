'use strict'

const { MissingRequiredArgumentError } = require('@northscaler/error-support')
const { ResponseStatus } = require('@northscaler/service-support')
const { InvalidMessageError, MessageSchemaError } = require('../errors')
const { error, event, response, request, origin } = require('../schemas')

const validator = require('ajv')()

class MessageValidatorTODO {
  static validateMessageFormat ({ message } = {}) {
    try {
      if (!message) throw new MissingRequiredArgumentError({ msg: 'message' })
      if (message.meta?.eventOrigin) {
        this._validateMessageFormat({ message, schema: event })
        return
      }

      if (message.meta?.status) {
        this._validateMessageFormat({ message, schema: response })
        return
      }

      this._validateMessageFormat({ message, schema: request })
    } catch (e) {
      throw new InvalidMessageError({ cause: e, info: message })
    }
  }

  /**
   * Validates that a message is in the right format.
   * Supports request, response & event messages.
   *
   * @param message
   */
  static _validateMessageFormat ({ message, schema } = {}) {
    if (!validator.getSchema(error.$id)) validator.compile(error)
    if (!validator.getSchema(origin.$id)) validator.compile(origin)

    const valid = validator.validate(schema, message)
    if (!valid) throw new MessageSchemaError({ msg: 'message failed schema validation' })

    if (message.meta.status && message.meta.status === ResponseStatus.FAILURE.name) {
      if (!message.error) throw new MessageSchemaError({ msg: `error is required when status is ${ResponseStatus.FAILURE.name}` })
    }
  }
}

module.exports = MessageValidatorTODO
