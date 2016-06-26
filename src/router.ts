import * as Koa from 'koa'
import * as methods from 'methods';
import * as pathToRegexp from 'path-to-regexp';
import Options = pathToRegexp.Options;

const Debug = require('debug')
const debug = Debug('koa-route');

export type KoaMiddleware  = (ctx:Koa.Context, next:()=> any) => any ;

/**  
 * params are route segmens, last parameter is 'next' and is a function;
 * Can't be a generator* function,
 * it's this, is Koa.Context.
 * Return Type should be a promise, I think...
 */
export type RouteAction = (...params:any[]) => void ;

/**
 * @pathExpression: string 'route to match'
 * @action: RoueteAction  'route specific action'
 * @opts: pathToRegexp.Options
 * returns: Koa.Middleware? 
 */
export type Route = (pathExpression:string, action:RouteAction , opts?: Options ) => (ctx:Koa.Context, next:()=> any) => any ;  

/**
 * for Dynamic access, Note: keys are lowercase 
 */
export const Methods: Map<string,Route> = new Map<string,Route>();

/**
 * Route factory
 * @method: string, as name from module 'methods'
 * returns: Route() function
 */
let create = (method?:string) : Route => {
  
  if (method) method = method.toUpperCase();
  
  let fty:Route = (path, rAcrtion, opts?) : KoaMiddleware => {
    
    const re = pathToRegexp(path, opts);

    debug('%s %s -> %s', method || 'ALL', path, re);

    return async function (ctx, next: any ) {
      // match method 
      if (!matches(ctx, method)) {
          next();
          return 
        };
      
      // match path
      const m = re.exec(ctx.path);
      if (m) {
        //collect route segments 
        const args = m.slice(1).map(decode);
        debug('%s %s matches %s %j', ctx.method, path, ctx.path, args);
        args.push(next);    
        // Apply ctx:Koa.Context to cAction.this, sends url's segments + next as args 
        await rAcrtion.apply(ctx, args);
        //additional test needed to see side effect of sending next as last parameter 
        next();
        return;
      }

      // miss      
      next();
    }
  }  
  // set dynamic access to this method 
  Methods.set((method ||'ALL').toLowerCase(), fty) ;
  return fty;
}

//Let Typescript know about the methods  
export const all : Route = create();
export const del: Route = create('del');
export const get: Route = create ('get') ;
export const patch: Route = create ('patch') ;
export const post: Route = create ('post') ;
export const propfind: Route = create('propfind');
export const proppatch: Route = create('proppatch');
export const purge: Route = create('purge');
export const put: Route = create('put');
export const rebind: Route = create('rebind');
export const report: Route = create('report');
export const search: Route = create('search');
export const subscribe: Route = create('subscribe');
export const trace : Route = create('trace');
export const unbind : Route = create('unbind');
export const unlink: Route = create('unlink');
export const unlock:Route = create('unlock');
export const unsubscribe: Route = create('unsubscribe');
export const acl: Route = create('acl');
export const bind: Route = create('bind');
export const checkout: Route = create('checkout');
export const connect: Route = create('connect');
export const copy: Route = create('copy');
export const head: Route = create('head');
export const link: Route = create('link');
export const lock: Route = create('lock');
export const m_search: Route = create('m-search');
export const merge: Route = create('merge');
export const mkactivity: Route = create('mkactivity');
export const mkcalendar: Route = create('mkcalendar');
export const mkcol: Route = create('mkcol');
export const move: Route = create('move');
export const notify: Route = create('notify');
export const options: Route = create('options');


/**
 * Decode value.
 */
function decode(val:string) : string| void {
  if (val) return decodeURIComponent(val);
}

/**
 * Check request method.
 */
function matches(ctx:Koa.Context, method:string) {
  // sorry...
  method = method == 'DEL' ? 'DELETE' : method;
  if (!method) return true;
  if (ctx.method === method) return true;
  if (method === 'GET' && ctx.method === 'HEAD') return true;
  return false;
}


