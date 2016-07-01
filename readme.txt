krouter: koa.router
tweaked node 6+ version of 'koa-route'(1) for Typescript and Koa 2.+

Accepts Koa.Middleware signature...
routed middleware must call next() if its not the endPoint; 

this allows to use 'koa-compose' as in :

// where: step* is "(ctx. next) => Promise" 
router.get('/whatever', compose([step1, step2, step2]))

..or

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

const isFriday = () => new Date(Date.now()).getDay() == 5;

/**
* only on fridays...
*/
const onlyOnFridays = async (ctx, next) => {
    if (isFriday) {
        next();
        return;
    }
    ctx.body = 'only on fridays';
    ctx.status = 404;
}

describe('sometimes', () => {     
    it('may...work', (done) => {
        const app = new Koa();
        use(app,
            //...route
            router.get('/always', async (ctx, next) => { 
                ctx.status = 200
             }),
            //..route
            router.get('/sometimes', compose([
                //... conditions, aggregations ... 
                onlyOnFridays,
                //...endPoint
                async (ctx, next) => {
                    ctx.body = 'is Friday :)'
                }]))
        ); 

        supertest.agent(start(app))
            .get('/sometimes')
            .expect(isFriday()? 200: 404)
            .end(e=>{
                if(e) throw e;
                done();
            })               
    })
})

(1)https://github.com/koajs/route

