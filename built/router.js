"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const pathToRegexp = require('path-to-regexp');
const Debug = require('debug');
const debug = Debug('koa-route');
/**
 * for Dynamic access, Note: keys are lowercase
 */
exports.Methods = new Map();
/**
 * Route factory
 * @method: string, as name from module 'methods'
 * returns: Route() function
 */
let create = (method) => {
    if (method)
        method = method.toUpperCase();
    let fty = (path, routeAction, opts) => {
        const re = pathToRegexp(path, opts);
        debug('%s %s -> %s', method || 'ALL', path, re);
        return function (ctx, next) {
            return __awaiter(this, void 0, void 0, function* () {
                // match method 
                if (!matches(ctx, method)) {
                    next();
                    return;
                }
                ;
                // match path
                const m = re.exec(ctx.path);
                if (m) {
                    //collect route segments 
                    const args = m.slice(1).map(decode);
                    debug('%s %s matches %s %j', ctx.method, path, ctx.path, args);
                    args.push(next);
                    // Apply ctx:Koa.Context to cAction.this, sends url's segments + next as args 
                    yield routeAction.apply(ctx, args);
                    //additional test needed to see side effect of sending next as last parameter 
                    next();
                    return;
                }
                // miss      
                next();
            });
        };
    };
    // set dynamic access to this method 
    exports.Methods.set((method || 'ALL').toLowerCase(), fty);
    return fty;
};
//Let Typescript know about the methods  
exports.all = create();
exports.del = create('del');
exports.get = create('get');
exports.patch = create('patch');
exports.post = create('post');
exports.propfind = create('propfind');
exports.proppatch = create('proppatch');
exports.purge = create('purge');
exports.put = create('put');
exports.rebind = create('rebind');
exports.report = create('report');
exports.search = create('search');
exports.subscribe = create('subscribe');
exports.trace = create('trace');
exports.unbind = create('unbind');
exports.unlink = create('unlink');
exports.unlock = create('unlock');
exports.unsubscribe = create('unsubscribe');
exports.acl = create('acl');
exports.bind = create('bind');
exports.checkout = create('checkout');
exports.connect = create('connect');
exports.copy = create('copy');
exports.head = create('head');
exports.link = create('link');
exports.lock = create('lock');
exports.m_search = create('m-search');
exports.merge = create('merge');
exports.mkactivity = create('mkactivity');
exports.mkcalendar = create('mkcalendar');
exports.mkcol = create('mkcol');
exports.move = create('move');
exports.notify = create('notify');
exports.options = create('options');
/**
 * Decode value.
 */
function decode(val) {
    if (val)
        return decodeURIComponent(val);
}
/**
 * Check request method.
 */
function matches(ctx, method) {
    // sorry...
    method = method == 'DEL' ? 'DELETE' : method;
    if (!method)
        return true;
    if (ctx.method === method)
        return true;
    if (method === 'GET' && ctx.method === 'HEAD')
        return true;
    return false;
}
//# sourceMappingURL=router.js.map