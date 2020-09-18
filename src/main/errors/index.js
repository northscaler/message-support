const { CodedError } = require('@northscaler/error-support')

const InvalidMessageError = CodedError({ name: 'InvalidMessageError' })

module.exports = {
  InvalidMessageError,
  OverspecifiedMessageError: InvalidMessageError.subclass({ name: 'OverspecifiedMessageError' }),
  MessageSchemaError: InvalidMessageError.subclass({ name: 'MessageSchemaError' })
}
