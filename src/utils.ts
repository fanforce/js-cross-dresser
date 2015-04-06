/// <reference path="jquery.d.ts" />
/// <reference path="deparam.ts" />

module CrossDresser {

    export class Utils {
        static parseUrl(url: string) {
            var uri_part_names = ["source", "scheme", "authority", "host", "port", "path", "directory_path", "file_name", "query_string", "hash"]
            var uri_parts = new RegExp("^(?:([^:/?#.]+):)?(?://)?(([^:/?#]*)(?::(\\d*))?)?((/(?:[^?#](?![^?#/]*\\.[^?#/.]+(?:[\\?#]|$)))*/?)?([^?#/]*))?(?:\\?([^#]*))?(?:#(.*))?").exec(url)
            var uri: any = {};
            for (var i=0, size=uri_part_names.length; i < size; i++) {
                uri[uri_part_names[i]] = (uri_parts[i]) ? uri_parts[i] : ''
            }
            uri.port = uri.port ? parseInt(uri.port) : 80
            var domain_parts = (/^(.*?)\.?([^\.]*\.\w+)$/).exec(uri.host)
            if (domain_parts) {
                uri.sub_domain = domain_parts[1]
                uri.root_domain = domain_parts[2]
            } else {
                uri.sub_domain = uri.root_domain = ''
            }
            if (uri.directory_path.length > 0) {
                uri.directory_path = uri.directory_path.replace(/\/?$/, "/")
            }
            return uri
        }
        static parseQueryString(query_string: string) {
            return CrossDresser.deparam(query_string)
        }
        static createId() {
            var _id = ''
            var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            for (var i = 1; i <= 20; i++) {
                _id += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return _id
        }

        //docReady(fn, context);
        //the context argument is optional - if present, it will be passed
        //as an argument to the callback
        static documentReady(callback, context?) {
            // if ready has already fired, then just schedule the callback
            // to fire asynchronously, but right away
            if (readyFired) {
                setTimeout(function() {callback(context);}, 1);
                return;
            } else {
                // add the function and context to the list
                readyList.push({fn: callback, ctx: context});
            }
            // if document already ready to go, schedule the ready function to run
            if (document.readyState === 'complete') {
                setTimeout(ready, 1);
            } else if (!readyEventHandlersInstalled) {
                // otherwise if we don't have event handlers installed, install them
                if (document.addEventListener) {
                    // first choice is DOMContentLoaded event
                    document.addEventListener('DOMContentLoaded', ready, false);
                    // backup is window load event
                    window.addEventListener('load', ready, false);
                } else {
                    // must be IE
                    document.attachEvent('onreadystatechange', readyStateChange);
                    window.attachEvent('onload', ready);
                }
                readyEventHandlersInstalled = true;
            }
        }
    }
}

// DOCUMENT READY HELPERS //////////////////////////////////////////////////////////////////////////////////////////////

var readyList = [];
var readyFired = false;
var readyEventHandlersInstalled = false;

// call this when the document is ready
// this function protects itself against being called more than once
function ready() {
    if (!readyFired) {
        // this must be set to true before we start calling callbacks
        readyFired = true;
        for (var i = 0; i < readyList.length; i++) {
            // if a callback here happens to add new ready handlers,
            // the docReady() function will see that it already fired
            // and will schedule the callback to run right after
            // this event loop finishes so all handlers will still execute
            // in order and no new ones will be added to the readyList
            // while we are processing the list
            readyList[i].fn.call(window, readyList[i].ctx);
        }
        // allow any closures held by these functions to free
        readyList = [];
    }
}

function readyStateChange() {
    if ( document.readyState === "complete" ) {
        ready();
    }
}