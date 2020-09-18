/* global describe, it */
'use strict'

const os = require('os')
const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect

const uuid = require('uuid').v4
const { ResponseStatus } = require('@northscaler/service-support')
const { EventMessageFactory } = require('../../main/factories')

const pkg = require('../../../package.json')
const factory = new EventMessageFactory({ componentName: pkg.name, componentVersion: pkg.version })

const { CodedError } = require('@northscaler/error-support')

describe('unit tests of EventMessageFactory', function () {
  it('should create event messages correctly', function () {
    const action = 'DO_SOMETHING'
    const data = { foo: 'foo', bar: 'bar' }
    const traceId = uuid()
    const correlationId = uuid()

    let event = factory.createFuture({ data, action, traceId, correlationId })
    expect(event.meta.id).to.be.ok()
    expect(event.meta.instant).to.be.ok()

    expect(event).to.deep.equal({
      data: data,
      error: undefined,
      meta: {
        event: {
          will: action,
          did: undefined,
          status: undefined
        },
        traceId,
        correlationId,
        origin: {
          component: pkg.name,
          version: pkg.version,
          hostname: os.hostname()
        },
        id: event.meta.id,
        instant: event.meta.instant
      }
    })

    event = factory.createSuccess({ data, action, traceId, correlationId })
    expect(event.meta.id).to.be.ok()
    expect(event.meta.instant).to.be.ok()

    expect(event).to.deep.equal({
      data: data,
      error: undefined,
      meta: {
        event: {
          did: action,
          status: ResponseStatus.SUCCESS.name,
          will: undefined
        },
        traceId,
        correlationId,
        origin: {
          component: pkg.name,
          version: pkg.version,
          hostname: os.hostname()
        },
        id: event.meta.id,
        instant: event.meta.instant
      }
    })

    const TestError = CodedError({ name: 'TestError' })
    const NestedTestError = CodedError({ name: 'NestedTestError' })
    const error = new TestError({ message: 'boom', cause: new NestedTestError({ message: 'bang' }) })

    event = factory.createFailure({ action, error, traceId, correlationId })
    expect(event.meta.id).to.be.ok()
    expect(event.meta.instant).to.be.ok()

    expect(event).to.deep.equal({
      data: undefined,
      error: {
        name: error.name,
        code: error.code,
        message: error.message,
        stack: null,
        info: undefined,
        cause: null
      },
      meta: {
        event: {
          did: action,
          status: ResponseStatus.FAILURE.name,
          will: undefined
        },
        traceId,
        correlationId,
        origin: {
          component: pkg.name,
          version: pkg.version,
          hostname: os.hostname()
        },
        id: event.meta.id,
        instant: event.meta.instant
      }
    })

    event = factory.createFailure({
      action,
      error,
      traceId,
      correlationId,
      includeErrorStacks: true,
      includeErrorCauses: true
    })
    expect(event.meta.id).to.be.ok()
    expect(event.meta.instant).to.be.ok()
    expect(event.error.stack).to.be.ok()

    expect(event).to.deep.equal({
      data: undefined,
      error: {
        name: error.name,
        code: error.code,
        message: error.message,
        stack: event.error.stack,
        info: undefined,
        cause: {
          name: error.cause.name,
          code: error.cause.code,
          message: error.cause.message,
          stack: event.error.cause.stack,
          info: undefined,
          cause: undefined
        }
      },
      meta: {
        event: {
          did: action,
          status: ResponseStatus.FAILURE.name,
          will: undefined
        },
        traceId,
        correlationId,
        origin: {
          component: pkg.name,
          version: pkg.version,
          hostname: os.hostname()
        },
        id: event.meta.id,
        instant: event.meta.instant
      }
    })
  })

  it('should create event messages correctly from request messages', function () {
    const action = 'DO_SOMETHING'
    const data = { foo: 'foo', bar: 'bar' }
    const traceId = uuid()
    const correlationId = uuid()

    const request = {
      data,
      meta: {
        request: { action },
        id: uuid(),
        traceId,
        correlationId,
        instant: new Date().toISOString(),
        origin: {
          component: pkg.name,
          version: pkg.version,
          os: os.hostname()
        }
      }
    }

    let event = factory.createFutureFromRequest({ request })
    expect(event.meta.id).to.be.ok()
    expect(event.meta.instant).to.be.ok()

    expect(event).to.deep.equal({
      data: data,
      error: undefined,
      meta: {
        event: {
          will: action,
          did: undefined,
          status: undefined
        },
        traceId,
        correlationId,
        origin: {
          component: pkg.name,
          version: pkg.version,
          hostname: os.hostname()
        },
        id: event.meta.id,
        instant: event.meta.instant
      }
    })

    event = factory.createSuccessFromRequest({ request })
    expect(event.meta.id).to.be.ok()
    expect(event.meta.instant).to.be.ok()

    expect(event).to.deep.equal({
      data: data,
      error: undefined,
      meta: {
        event: {
          did: action,
          status: ResponseStatus.SUCCESS.name,
          will: undefined
        },
        traceId,
        correlationId,
        origin: {
          component: pkg.name,
          version: pkg.version,
          hostname: os.hostname()
        },
        id: event.meta.id,
        instant: event.meta.instant
      }
    })

    const TestError = CodedError({ name: 'TestError' })
    const NestedTestError = CodedError({ name: 'NestedTestError' })
    const error = new TestError({ message: 'boom', cause: new NestedTestError({ message: 'bang' }) })

    event = factory.createFailureFromRequest({ request, error })
    expect(event.meta.id).to.be.ok()
    expect(event.meta.instant).to.be.ok()

    expect(event).to.deep.equal({
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
        event: {
          did: action,
          status: ResponseStatus.FAILURE.name,
          will: undefined
        },
        traceId,
        correlationId,
        origin: {
          component: pkg.name,
          version: pkg.version,
          hostname: os.hostname()
        },
        id: event.meta.id,
        instant: event.meta.instant
      }
    })

    event = factory.createFailureFromRequest({
      request,
      error,
      includeErrorStacks: true,
      includeErrorCauses: true
    })
    expect(event.meta.id).to.be.ok()
    expect(event.meta.instant).to.be.ok()
    expect(event.error.stack).to.be.ok()

    expect(event).to.deep.equal({
      data,
      error: {
        name: error.name,
        code: error.code,
        message: error.message,
        stack: event.error.stack,
        info: undefined,
        cause: {
          name: error.cause.name,
          code: error.cause.code,
          message: error.cause.message,
          stack: event.error.cause.stack,
          info: undefined,
          cause: undefined
        }
      },
      meta: {
        event: {
          did: action,
          status: ResponseStatus.FAILURE.name,
          will: undefined
        },
        traceId,
        correlationId,
        origin: {
          component: pkg.name,
          version: pkg.version,
          hostname: os.hostname()
        },
        id: event.meta.id,
        instant: event.meta.instant
      }
    })
  })
})
