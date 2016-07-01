import {assert} from 'chai';
import * as request from 'supertest';
import * as Koa from 'koa';
import *  as route from './';

const methods = require('methods').map(function (method) {
  // normalize method names for tests
  if (method == 'delete') method = 'del';
  if (method == 'connect') return; // WTF  
  return method;
}).filter(Boolean)

let listen = (app) => {
  return app.listen();
}

methods.forEach(function (method) {
  const app = new Koa();
  let fn = route.Methods.get(method);
  //!!!
  app.use(fn('/:user(tj)', async function (ctx, next) {
    let [user] = ctx['args'];
    ctx.body = user
    next();
  }))

  describe('route.' + method + '()', function () {
    describe('when method and path match', function () {
      it('should 200', function (done) {
        request(listen(app))[method]('/tj')
          .expect(200)
          .expect(method === 'head' ? '' : 'tj', done);
      })
    })

    describe('when only method matches', function () {
      it('should 404', function (done) {
        request(listen(app))
        [method]('/tjayyyy')
          .expect(404, done);
      })
    })

    describe('when only path matches', function () {
      it('should 404', function (done) {
        request(listen(app))
        [method === 'get' ? 'post' : 'get']('/tj')
          .expect(404, done);
      })
    })
  })
})

describe('route.all()', function () {
  describe('should work with', function () {
    methods.forEach(function (method) {
      const app = new Koa();
      //!!!
      let all = route.all('/:user(tj)', async function (ctx, next) {
        let [user] = ctx['args'];
        ctx.body = user;
        next();
      });
      app.use(all);

      it(method, function (done) {
        request(listen(app))
        [method]('/tj')
          .expect(200)
          .expect(method === 'head' ? '' : 'tj', done);
      })
    })
  })

  describe('when patch does not match', function () {
    it('should 404', function (done) {
      const app = new Koa();
      //!!!
      app.use(route.all('/:user(tj)', async function (ctx, next) {
        let [user] = ctx['args'];
        ctx.body = user;
        next();
      }))

      request(listen(app))
        .get('/tjayyyyyy')
        .expect(404, done);
    })
  })
})

describe('route params', function () {

  methods.forEach(function (method) {
    const app = new Koa();
    //!!! 
    app.use(route.Methods.get(method)('/:user(tj)', async function (ctx, next) {
      let [user] = ctx['args'];
      ctx.body = user;
      next();
    }))
    //!!! 
    app.use(route.Methods.get(method)('/:user(tj)', async function (ctx, next) {
      let [user] = ctx['args'];
      ctx.body = user;
      next();
    }))
    //!!! 
    app.use(route.Methods.get(method)('/:user(tj)', async function (ctx, next) {
      ctx.status = 201;

    }))

    it('should work with method ' + method, function (done) {
      request(listen(app))
      [method]('/tj')
        .expect(201)
        .expect(method === 'head' ? '' : 'tj', done);
    })
  })

  it('should work with method head when get is defined', function (done) {
    const app = new Koa();
    //!!! 
    app.use(route.get('/tj', async function (ctx, next) {
      ctx.body = 'foo';
      next();
    }));

    request(listen(app))
    ['head']('/tj')
      .expect(200, done)
  })

  it('should be decoded', function (done) {
    const app = new Koa();
    //!!! 
    app.use(route.get('/package/:name', async function (ctx, next) {
      let [name] = ctx['args'];
      assert.equal(name, 'http://github.com/component/tip');
      done();
    }));

    request(listen(app))
      .get('/package/' + encodeURIComponent('http://github.com/component/tip'))
      .end(function () { });
  })

  it('should be null if not matched', function (done) {
    const app = new Koa();
    //!!! 
    app.use(route.get('/api/:resource/:id?', async function (ctx, next) {
      let [resource, id] = ctx['args'];      
      assert.equal(resource, 'users');
      assert.isTrue(id == null);
      done();
    }));

    request(listen(app))
      .get('/api/users')
      .end(function () { });
  })

  it('should use the given options', function (done) {
    const app = new Koa();
    //!!! 
    app.use(route.get('/api/:resource/:id', async function (ctx, next) {
      let [resource, id] = ctx['args'];
      assert.equal(resource, 'users');
      assert.equal(id, '1')
      done();
    }, { end: false }));

    request(listen(app))
      .get('/api/users/1/posts')
      .end(function () { });
  })

  //   it('it waits', (done) => {

  //     const app = new Koa();
  //     app.use(route.get('/this', async function (ctx, next) {
  //         let ctx = this as Koa.Context;
  //         return new Promise((resolve, reject) => {
  //             setTimeout(() => {
  //                 try {
  //                     ctx.body = "ok"
  //                     console.log('Body Set');
  //                     resolve(true)
  //                 } catch (error) {
  //                     console.log(error.mesasge);
  //                     reject(error);
  //                 }
  //             }, 1000);
  //         });
  //     }));

  //     request(listen(app))
  //         .get('/this')
  //         .expect(200)
  //         .expect('ok')
  //         .end((err, res) => {
  //             if (err) {
  //                 throw err;
  //             }             
  //             done();            
  //         });
  // })
})