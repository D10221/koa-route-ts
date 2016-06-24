import * as Koa from 'koa';

export function auth(getUser: (name:string, pass:string)=> any ) : Koa.Middleware {
    
    let regex = /Basic\s+(.*)/i;    
    
    return async function(ctx, next)  {                
        
        let r =  regex.exec(ctx.headers['authentication']);
        if(!r) ctx.throw(401);

        let auth =   new Buffer(r[1], 'base64').toString();    
        if(!auth) ctx.throw(401);
        
        let parts = /^([^:]*):(.*)$/.exec(auth);
                             
        let user = getUser(parts[1], parts[2]);
        if(!user) ctx.throw(401);

        (ctx.request as any).user = user;        
        next();
    }
}