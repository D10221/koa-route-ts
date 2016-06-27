import * as test from 'tape';
import * as assert from 'assert';
import * as request from 'supertest';
import * as Koa from 'koa';
import *  as router from './';

function listen(app) {
    return app.listen();
}

test.onFinish( err => {
    if(err){
        console.log(err)
    }
    process.exit();
})

test('it waits', (t) => {
    
    const app = new Koa();
    app.use(router.get('/this', async function (args) {
        let ctx = this as Koa.Context;
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    ctx.body = "ok"
                    console.log('Body Set');
                    resolve(true)
                } catch (error) {
                    console.log(error.mesasge);
                    reject(error);
                }
            }, 1000);
        });
    }));
    
    request(listen(app))
        .get('/this')
        .expect(200)
        .expect('ok')
        .end((err, res) => {
            if (err) {
                t.fail(err.message);
            }             
            t.end();
        });
})