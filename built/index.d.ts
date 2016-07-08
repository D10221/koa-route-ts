import * as Koa from 'koa';
import * as pathToRegexp from 'path-to-regexp';
import Options = pathToRegexp.Options;
export declare type Middleware = (ctx: Koa.Context, next: () => Promise<void>) => Promise<void>;
export declare type Next = () => Promise<any>;
/**
 * params are route segmens, last parameter is 'next' and is a function;
 * Can't be a generator* function,
 * Return Type should be a promise 'just add async""
 */
/**
 * @pathExpression: string 'route to match'
 * @action: RoueteAction  'route specific action'
 * @opts: pathToRegexp.Options
 * returns: Koa.Middleware?
 */
export declare type Route = (pathExpression: string, action: Middleware, opts?: Options) => Middleware;
/**
 * for Dynamic access, Note: keys are lowercase
 */
export declare const Methods: Map<string, Route>;
export declare const all: Route;
export declare const del: Route;
export declare const get: Route;
export declare const patch: Route;
export declare const post: Route;
export declare const propfind: Route;
export declare const proppatch: Route;
export declare const purge: Route;
export declare const put: Route;
export declare const rebind: Route;
export declare const report: Route;
export declare const search: Route;
export declare const subscribe: Route;
export declare const trace: Route;
export declare const unbind: Route;
export declare const unlink: Route;
export declare const unlock: Route;
export declare const unsubscribe: Route;
export declare const acl: Route;
export declare const bind: Route;
export declare const checkout: Route;
export declare const connect: Route;
export declare const copy: Route;
export declare const head: Route;
export declare const link: Route;
export declare const lock: Route;
export declare const m_search: Route;
export declare const merge: Route;
export declare const mkactivity: Route;
export declare const mkcalendar: Route;
export declare const mkcol: Route;
export declare const move: Route;
export declare const notify: Route;
export declare const options: Route;
