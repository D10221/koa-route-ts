import * as http from 'http';
import * as supertest from 'supertest';
import * as Koa from 'koa';
import * as router from './';
import * as Debug from 'debug';
const debug = Debug('krouter:test:compose')
import Middleware = router.Middleware;

let compose = require('koa-compose');

/**
 * typed helper so we can do (part, part,part) instead of ([part,part,part]) 
 * 
 * @param {...KoaMiddleware[]} middleware
 * @returns {KoaMiddleware}
 */
function k(...middleware: Middleware[]): Middleware {
    return compose(middleware);
}

/**
 * because of the *.d.ts doesn't have the 'optional' parameter on app.listen
 */
function start(app): http.Server {
    return app.listen();
}

/**
 * because I can ...  
 */
function use(app, ...mdl: Middleware[]) {
    for (let m of mdl) {
        app.use(m);
    }
}

const _users = ['admin', 'bob', 'guest'];

function credentials(ctx): string[] {
    return ctx && ctx.headers && ctx.headers.user ?
        /(\w+)?:?(\w+)?:?(\w+)?/.exec(ctx.headers.user)
        : [];
}

async function auth(ctx, next) {
    const [c, name, pass, role] = credentials(ctx);
    const found = _users.find(u =>
        u == name
    );

    if (found) {
        debug(`auth: granted: user: name:${name}, pass:${pass}, role:${role}`);
        next()
        return;
    }

    debug(`auth: denied: user: name:${name}, pass:${pass}, role:${role}`);
    ctx.body = 'I dont know you';
    ctx.status = 401;
}

type Next = () => Promise<any>;

function acl(required): (ctx: Koa.Context, next: Next) => Promise<any> {
    return async (ctx, next) => {
        const [c, name, pass, role] = credentials(ctx);
        if (role == required) {
            debug(`acl: granted: user: name:${name}, pass:${pass}, role:${role}`);
            next();
            return;
        }
        debug(`acl: denied: user: name:${name}, pass:${pass}, role:${role}`);
        ctx.body = `only ${required}s`;
        ctx.status = 403;
    }
}

const endPoint = async (ctx, next) => {
    const [c, name, pass, role] = credentials(ctx);
    const user = name || 'nobody';
    debug(`${user} reached ${ctx.path}`);
    ctx.body = `hello ${user} as ${role || 'nobody'}`;
};

describe('Compose', function () {

    it('works', function (done) {

        const app = new Koa();
        use(app, //...
            router.get('/admin', k(auth, acl('admin'), endPoint)),
            router.get('/users', k(auth, acl('user'), endPoint)),
            router.get('/guest', k(auth, endPoint)),
            router.get('/public', endPoint)
        )
        const request = supertest.agent(start(app));

        request.get('/admin')
            .expect(401)
            .expect('I dont know you')
            .end(error => {
                if (error) throw error;
            })

        request.get('/admin')
            .set('user', 'bob:bob:user')
            .expect(403)
            .expect('only admins')
            .end(error => {
                if (error) throw error;
            })

        request.get('/admin')
            .set('user', 'admin:admin:admin')
            .expect(200)
            .expect(`hello admin as admin`)
            .end(error => {
                if (error) throw error;
            });

        request.get('/users')
            .set('user', 'bob:bob:user')
            .expect(200)
            .expect(`hello bob as user`)
            .end(error => {
                if (error) throw error;
            });

        request.get('/guest')
            .set('user', 'guest:guest')
            .expect(200)
            .expect(`hello guest as nobody`)
            .end(error => {
                if (error) throw error;
            });

        request.get('/public')
            //nobody            
            .expect(200)
            .expect(`hello nobody as nobody`)
            .end(error => {
                if (error) throw error;
                done();
            });
    })
})

