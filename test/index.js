'use strict'

const assert = require('assert')
const TrailsApp = require('..')
const testAppDefinition = require('./testapp')

describe('Trails', () => {
  describe('@TrailsApp', () => {
    describe('idempotence', () => {
      it('should be able to start and stop many times in a single node process', () => {

        let cycles = [ ]
        for (let i = 0; i < 10; ++i) {
          cycles.push(new Promise (resolve => {
            console.log('loading application; iteration', i)
            let app = new TrailsApp(testAppDefinition)
            app.start()
              .then(app => {
                assert.equal(app.started, true)
                resolve(app)
              })
          }))
        }

        return Promise.all(cycles)
          .then(apps => {
            return Promise.all(apps.map(app => {
              return app.stop()
            }))
          })
          .then(apps => {
            apps.map(app => {
              assert.equal(app.stopped, true)
            })
          })
      })
    })
    describe('#constructor', () => {
      let app
      before(() => {
        app = new TrailsApp(testAppDefinition)
      })

      it('should be instance of EventEmitter', () => {
        assert(app instanceof require('events').EventEmitter)
      })
      it('should set max number of event listeners', () => {
        assert.equal(app.getMaxListeners(), 128)
      })
      it('should set app properties', () => {
        assert(app.pkg)
        assert(app.config)
        assert(app.api)
      })
      it('should set NODE_ENV', () => {
        assert.equal(process.env.NODE_ENV, 'development')
      })
    })

    describe('#after', () => {
      let app
      before(() => {
        app = new TrailsApp(testAppDefinition)
      })

      it('should invoke listener when listening for a single event', () => {
        const eventPromise = app.after([ 'test1' ])
        app.emit('test1')
        return eventPromise
      })
      it('should accept a single event as an array or a string', () => {
        const eventPromise = app.after('test1')
        app.emit('test1')
        return eventPromise
      })
      it('should invoke listener when listening for multiple events', () => {
        const eventPromise = app.after([ 'test1', 'test2', 'test3' ])
        app.emit('test1')
        app.emit('test2')
        app.emit('test3')

        return eventPromise
      })
    })
  })
})
