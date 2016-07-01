"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const supertest = require('supertest');
const Koa = require('koa');
const router = require('./');
const Debug = require('debug');
const debug = Debug('krouter:test:compose');
let compose = require('koa-compose');
/**
 * typed helper so we can do (part, part,part) instead of ([part,part,part])
 *
 * @param {...KoaMiddleware[]} middleware
 * @returns {KoaMiddleware}
 */
function k(...middleware) {
    return compose(middleware);
}
/**
 * because of the *.d.ts doesn't have the 'optional' parameter on app.listen
 */
function start(app) {
    return app.listen();
}
/**
 * because I can ...
 */
function use(app, ...mdl) {
    for (let m of mdl) {
        app.use(m);
    }
}
const _users = ['admin', 'bob', 'guest'];
function credentials(ctx) {
    return ctx && ctx.headers && ctx.headers.user ?
        /(\w+)?:?(\w+)?:?(\w+)?/.exec(ctx.headers.user)
        : [];
}
function auth(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const [c, name, pass, role] = credentials(ctx);
        const found = _users.find(u => u == name);
        if (found) {
            debug(`auth: granted: user: name:${name}, pass:${pass}, role:${role}`);
            next();
            return;
        }
        debug(`auth: denied: user: name:${name}, pass:${pass}, role:${role}`);
        ctx.body = 'I dont know you';
        ctx.status = 401;
    });
}
function acl(required) {
    return (ctx, next) => __awaiter(this, void 0, void 0, function* () {
        const [c, name, pass, role] = credentials(ctx);
        if (role == required) {
            debug(`acl: granted: user: name:${name}, pass:${pass}, role:${role}`);
            next();
            return;
        }
        debug(`acl: denied: user: name:${name}, pass:${pass}, role:${role}`);
        ctx.body = `only ${required}s`;
        ctx.status = 403;
    });
}
const endPoint = (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    const [c, name, pass, role] = credentials(ctx);
    const user = name || 'nobody';
    debug(`${user} reached ${ctx.path}`);
    ctx.body = `hello ${user} as ${role || 'nobody'}`;
});
describe('Compose', function () {
    it('works', function (done) {
        const app = new Koa();
        use(app, //...
        router.get('/admin', k(auth, acl('admin'), endPoint)), router.get('/users', k(auth, acl('user'), endPoint)), router.get('/guest', k(auth, endPoint)), router.get('/public', endPoint));
        const request = supertest.agent(start(app));
        request.get('/admin')
            .expect(401)
            .expect('I dont know you')
            .end(error => {
            if (error)
                throw error;
        });
        request.get('/admin')
            .set('user', 'bob:bob:user')
            .expect(403)
            .expect('only admins')
            .end(error => {
            if (error)
                throw error;
        });
        request.get('/admin')
            .set('user', 'admin:admin:admin')
            .expect(200)
            .expect(`hello admin as admin`)
            .end(error => {
            if (error)
                throw error;
        });
        request.get('/users')
            .set('user', 'bob:bob:user')
            .expect(200)
            .expect(`hello bob as user`)
            .end(error => {
            if (error)
                throw error;
        });
        request.get('/guest')
            .set('user', 'guest:guest')
            .expect(200)
            .expect(`hello guest as nobody`)
            .end(error => {
            if (error)
                throw error;
        });
        request.get('/public')
            .expect(200)
            .expect(`hello nobody as nobody`)
            .end(error => {
            if (error)
                throw error;
            done();
        });
    });
});
//# sourceMappingURL=compose_test.js.map