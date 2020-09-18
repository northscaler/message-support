/* global describe, it */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect

const os = require('os')
const uuid = require('uuid').v4
const pkg = require('../../../package.json')
const { RequestMessageFactory } = require('../../main/factories')

describe('unit tests of RequestMessageFactory', function () {
  it('should create request messages correctly', function () {
    const factory = new RequestMessageFactory({ componentName: pkg.name, componentVersion: pkg.version })

    const action = 'DO_SOMETHING'
    const data = { foo: 'foo' }
    const traceId = uuid()
    const correlationId = uuid()
    const request = factory.create({ data, action, traceId, correlationId })
    expect(request.meta.id).to.be.ok()
    expect(request.meta.instant).to.be.ok()

    expect(request).to.deep.equal({
      data: data,
      error: undefined,
      meta: {
        traceId,
        correlationId,
        request: { action },
        origin: {
          component: pkg.name,
          version: pkg.version,
          hostname: os.hostname()
        },
        id: request.meta.id,
        instant: request.meta.instant
      }
    })
  })
})
