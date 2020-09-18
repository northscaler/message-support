/* global describe, it */
'use strict'

const os = require('os')
const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect

const uuid = require('uuid').v4
const { ResponseStatus } = require('@northscaler/service-support')
const { ResponseMessageFactory } = require('../../main/factories')

const pkg = require('../../../package.json')
const factory = new ResponseMessageFactory({ componentName: pkg.name, componentVersion: pkg.version })

const { CodedError } = require('@northscaler/error-support')

describe('unit tests of ResponseMessageFactory', function () {
  it('should create response messages correctly', function () {
    const action = 'DO_SOMETHING'
    const data = { foo: 'foo', bar: 'bar' }
    const traceId = uuid()
    const correlationId = uuid()
    const startInstant = Date.now() - 1000

    let response = factory.create({
      action,
      data,
      traceId,
      correlationId,
      startInstant,
      status: ResponseStatus.SUCCESS
    })
    expect(response.meta.id).to.be.ok()
    expect(response.meta.instant).to.be.ok()

    expect(response).to.deep.equal({
      data: data,
      error: undefined,
      meta: {
        response: {
          action,
          status: ResponseStatus.SUCCESS.name,
          elapsedMillis: response.meta.response.elapsedMillis
        },
        traceId,
        correlationId,
        origin: {
          component: pkg.name,
          version: pkg.version,
          hostname: os.hostname()
        },
        id: response.meta.id,
        instant: response.meta.instant
      }
    })

    const TestError = CodedError({ name: 'TestError' })
    const NestedTestError = CodedError({ name: 'NestedTestError' })
    const error = new TestError({ message: 'boom', cause: new NestedTestError({ message: 'bang' }) })

    response = factory.create({
      action,
      data,
      traceId,
      correlationId,
      startInstant,
      status: ResponseStatus.FAILURE,
      error
    })
    expect(response.meta.id).to.be.ok()
    expect(response.meta.instant).to.be.ok()

    expect(response).to.deep.equal({
      data,
      error: {
        name: error.name,
        code: error.code,
        message: error.message,
        stack: null,
        info: undefined,
        cause: null
      },
      meta: {
        response: {
          action,
          status: ResponseStatus.FAILURE.name,
          elapsedMillis: response.meta.response.elapsedMillis
        },
        traceId,
        correlationId,
        origin: {
          component: pkg.name,
          version: pkg.version,
          hostname: os.hostname()
        },
        id: response.meta.id,
        instant: response.meta.instant
      }
    })

    response = factory.create({
      action,
      data,
      traceId,
      correlationId,
      startInstant,
      status: ResponseStatus.FAILURE,
      error,
      includeErrorCauses: true,
      includeErrorStacks: true
    })
    expect(response.meta.id).to.be.ok()
    expect(response.meta.instant).to.be.ok()
    expect(response.error.stack).to.be.ok()

    expect(response).to.deep.equal({
      data,
      error: {
        name: error.name,
        code: error.code,
        message: error.message,
        stack: response.error.stack,
        info: undefined,
        cause: {
          name: error.cause.name,
          code: error.cause.code,
          message: error.cause.message,
          stack: response.error.cause.stack,
          info: undefined,
          cause: undefined
        }
      },
      meta: {
        response: {
          action,
          status: ResponseStatus.FAILURE.name,
          elapsedMillis: response.meta.response.elapsedMillis
        },
        traceId,
        correlationId,
        origin: {
          component: pkg.name,
          version: pkg.version,
          hostname: os.hostname()
        },
        id: response.meta.id,
        instant: response.meta.instant
      }
    })
  })
})
