var CrossDresser;
(function (CrossDresser) {
    function deparam(params, coerce) {
        var obj = {}, coerce_types = { 'true': !0, 'false': !1, 'null': null };
        // Iterate over all name=value pairs.
        $.each(params.replace(/\+/g, ' ').split('&'), function (j, v) {
            var param = v.split('='), key = decodeURIComponent(param[0]), val, cur = obj, i = 0, 
            // If key is more complex than 'foo', like 'a[]' or 'a[b][c]', split it
            // into its component parts.
            keys = key.split(']['), keys_last = keys.length - 1;
            // If the first keys part contains [ and the last ends with ], then []
            // are correctly balanced.
            if (/\[/.test(keys[0]) && /\]$/.test(keys[keys_last])) {
                // Remove the trailing ] from the last keys part.
                keys[keys_last] = keys[keys_last].replace(/\]$/, '');
                // Split first keys part into two parts on the [ and add them back onto
                // the beginning of the keys array.
                keys = keys.shift().split('[').concat(keys);
                keys_last = keys.length - 1;
            }
            else {
                // Basic 'foo' style key.
                keys_last = 0;
            }
            // Are we dealing with a name=value pair, or just a name?
            if (param.length === 2) {
                val = decodeURIComponent(param[1]);
                // Coerce values.
                if (coerce) {
                    val = val && !isNaN(val) ? +val : val === 'undefined' ? undefined : coerce_types[val] !== undefined ? coerce_types[val] : val; // string
                }
                if (keys_last) {
                    for (; i <= keys_last; i++) {
                        key = keys[i] === '' ? cur.length : keys[i];
                        var next_key = keys[i + 1];
                        cur = cur[key] = (i < keys_last) ? cur[key] || (next_key && isNaN(next_key) ? {} : []) : val;
                    }
                }
                else {
                    // Simple key, even simpler rules, since only scalars and shallow
                    // arrays are allowed.
                    if ($.isArray(obj[key])) {
                        // val is already an array, so push on the next value.
                        obj[key].push(val);
                    }
                    else if (obj[key] !== undefined) {
                        // val isn't an array, but since a second value has been specified,
                        // convert val into an array.
                        obj[key] = [obj[key], val];
                    }
                    else {
                        // val is a scalar.
                        obj[key] = val;
                    }
                }
            }
            else if (key) {
                // No value was defined, so set something meaningful.
                obj[key] = coerce ? undefined : '';
            }
        });
        return obj;
    }
    CrossDresser.deparam = deparam;
    ;
})(CrossDresser || (CrossDresser = {}));
;
/// <reference path="jquery.d.ts" />
/// <reference path="deparam.ts" />
var CrossDresser;
(function (CrossDresser) {
    var Utils = (function () {
        function Utils() {
        }
        Utils.parseUrl = function (url) {
            var uri_part_names = ["source", "scheme", "authority", "host", "port", "path", "directory_path", "file_name", "query_string", "hash"];
            var uri_parts = new RegExp("^(?:([^:/?#.]+):)?(?://)?(([^:/?#]*)(?::(\\d*))?)?((/(?:[^?#](?![^?#/]*\\.[^?#/.]+(?:[\\?#]|$)))*/?)?([^?#/]*))?(?:\\?([^#]*))?(?:#(.*))?").exec(url);
            var uri = {};
            for (var i = 0, size = uri_part_names.length; i < size; i++) {
                uri[uri_part_names[i]] = (uri_parts[i]) ? uri_parts[i] : '';
            }
            uri.port = uri.port ? parseInt(uri.port) : 80;
            var domain_parts = (/^(.*?)\.?([^\.]*\.\w+)$/).exec(uri.host);
            if (domain_parts) {
                uri.sub_domain = domain_parts[1];
                uri.root_domain = domain_parts[2];
            }
            else {
                uri.sub_domain = uri.root_domain = '';
            }
            if (uri.directory_path.length > 0) {
                uri.directory_path = uri.directory_path.replace(/\/?$/, "/");
            }
            return uri;
        };
        Utils.parseQueryString = function (query_string) {
            return CrossDresser.deparam(query_string);
        };
        Utils.createId = function () {
            var _id = '';
            var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            for (var i = 1; i <= 20; i++) {
                _id += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return _id;
        };
        //docReady(fn, context);
        //the context argument is optional - if present, it will be passed
        //as an argument to the callback
        Utils.documentReady = function (callback, context) {
            // if ready has already fired, then just schedule the callback
            // to fire asynchronously, but right away
            if (readyFired) {
                setTimeout(function () {
                    callback(context);
                }, 1);
                return;
            }
            else {
                // add the function and context to the list
                readyList.push({ fn: callback, ctx: context });
            }
            // if document already ready to go, schedule the ready function to run
            if (document.readyState === 'complete') {
                setTimeout(ready, 1);
            }
            else if (!readyEventHandlersInstalled) {
                // otherwise if we don't have event handlers installed, install them
                if (document.addEventListener) {
                    // first choice is DOMContentLoaded event
                    document.addEventListener('DOMContentLoaded', ready, false);
                    // backup is window load event
                    window.addEventListener('load', ready, false);
                }
                else {
                    // must be IE
                    document.attachEvent('onreadystatechange', readyStateChange);
                    window.attachEvent('onload', ready);
                }
                readyEventHandlersInstalled = true;
            }
        };
        return Utils;
    })();
    CrossDresser.Utils = Utils;
})(CrossDresser || (CrossDresser = {}));
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
    if (document.readyState === "complete") {
        ready();
    }
}
/// <reference path="jquery.d.ts" />
/// <reference path="utils.ts"/>
var CrossDresser;
(function (CrossDresser) {
    var INSTANCES = {};
    CrossDresser.frames = INSTANCES;
    var ChildFrame = (function () {
        function ChildFrame(_id) {
            this._id = _id;
            if (!INSTANCES[_id]) {
                throw new RangeError('No frame exists by the referenced _id');
            }
            this.instance = INSTANCES[_id];
            this.url = this.instance.url;
            this.height = this.instance.height;
            this.is_native = this.instance.is_native;
        }
        ChildFrame.prototype.trigger = function (name) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var callbacks = this.callbacks(name);
            for (var i = 0, size = callbacks.length; i < size; i++) {
                callbacks[i].apply(this, args);
            }
            if (name == 'native-base-ready') {
                this.loadContent();
            }
            else if (name == 'resize-frame') {
                this.resize.apply(this, args);
            }
        };
        ChildFrame.prototype.on = function (name, callback) {
            this.callbacks(name).push(callback);
        };
        ChildFrame.prototype.callbacks = function (name) {
            if (!this.instance.callbacks[name]) {
                this.instance.callbacks[name] = [];
            }
            return this.instance.callbacks[name];
        };
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ChildFrame.prototype.getElement = function () {
            return this.element = this.element || $('iframe#' + this._id);
        };
        ChildFrame.prototype.loadContent = function () {
            if (this.instance.content_request) {
                var frame = this;
                this.instance.content_request.then(function (html) {
                    frame.getElement()[0].contentWindow.CrossDresser.injectIntoPage(html);
                });
            }
        };
        ChildFrame.prototype.resize = function (new_height) {
            new_height = (!new_height || parseInt(new_height) < 150) ? 150 : parseInt(new_height);
            this.getElement().attr('height', new_height);
            return null;
        };
        ChildFrame.create = function (settings) {
            if (url) {
                settings = { url: url };
            }
            var _id = CrossDresser.Utils.createId();
            var url = settings.url.replace(/^\/\//, 'http://');
            var attrs = settings.attrs || {};
            var width = settings.width || 500;
            var height = settings.height || 450;
            var is_native = false;
            if (settings.use_native_base) {
                var goto_url = ((url.indexOf('?') > -1) ? url + '&' : url + '?') + $.param(attrs);
                var content_request = $.ajax({
                    url: goto_url,
                    dataType: 'jsonp',
                    jsonp: 'callback'
                });
                url = settings.use_native_base;
                attrs = {};
                is_native = true;
            }
            attrs.crss_drssr = _id + '::' + encodeURIComponent(CrossDresser.current.getConduitUrl());
            if (goto_url) {
                attrs.crss_drssr += '::' + encodeURIComponent(btoa(goto_url));
            }
            url = (url.indexOf('?') > -1) ? url + '&' : url + '?';
            url += $.param(attrs);
            INSTANCES[_id] = {
                callbacks: {},
                width: width,
                height: height,
                url: url,
                is_native: is_native,
                content_request: content_request
            };
            return new ChildFrame(_id);
        };
        ChildFrame.find = function (_id) {
            if (INSTANCES[_id]) {
                return new ChildFrame(_id);
            }
        };
        ChildFrame.trigger = function (_id, name, args) {
            var instance = this.find(_id);
            if (!instance) {
                throw ('could not find instance: ' + _id);
            }
            args = args.slice(0);
            args.unshift(name);
            instance.trigger.apply(instance, args);
        };
        return ChildFrame;
    })();
    CrossDresser.ChildFrame = ChildFrame;
})(CrossDresser || (CrossDresser = {}));
/// <reference path="jquery.d.ts" />
/// <reference path="utils.ts"/>
/// <reference path="base.ts"/>
var CrossDresser;
(function (CrossDresser) {
    var INSTANCES = {};
    var DEFAULT_WIDTH = 500;
    var DEFAULT_HEIGHT = 450;
    var ChildPopup = (function () {
        function ChildPopup(_id) {
            this._id = _id;
            if (!INSTANCES[_id]) {
                throw new RangeError('No frame exists by the referenced _id');
            }
            this.instance = INSTANCES[_id];
            this.name = this.instance.name;
            this.url = this.instance.url;
            this.width = this.instance.width;
            this.height = this.instance.height;
        }
        ChildPopup.prototype.trigger = function (name) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var callbacks = this.callbacks(name);
            for (var i = 0, size = callbacks.length; i < size; i++) {
                callbacks[i].apply(this, args);
            }
        };
        ChildPopup.prototype.on = function (name, callback) {
            this.callbacks(name).push(callback);
        };
        ChildPopup.prototype.callbacks = function (name) {
            if (!this.instance.callbacks[name]) {
                this.instance.callbacks[name] = [];
            }
            return this.instance.callbacks[name];
        };
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ChildPopup.prototype.open = function () {
            setTimeout(function () {
                var width = this.width, height = this.height, top = (window.screen.height / 2) - (height / 2), left = (window.screen.width / 2) - (width / 2);
                top = top - (top * 0.2);
                window.open(this.url, this.name, 'toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=1,width=' + width + ',height=' + height + ',top=' + top + ',left=' + left);
            }.bind(this));
        };
        ChildPopup.create = function (settings) {
            if (url) {
                settings = { url: url };
            }
            var _id = CrossDresser.Utils.createId();
            var attrs = settings.attrs || {};
            var url = settings.url.replace(/^\/\//, 'http://');
            var width = settings.width || DEFAULT_WIDTH;
            var height = settings.height || DEFAULT_HEIGHT;
            var name = settings.name || _id;
            attrs.crss_drssr = _id + '::' + encodeURIComponent(CrossDresser.current.getConduitUrl());
            url = (url.indexOf('?') > -1) ? url + '&' : url + '?';
            url += $.param(attrs);
            INSTANCES[_id] = {
                url: url,
                name: name,
                width: width,
                height: height,
                callbacks: {}
            };
            return new ChildPopup(_id);
        };
        ChildPopup.find = function (_id) {
            if (INSTANCES[_id]) {
                return new ChildPopup(_id);
            }
        };
        ChildPopup.trigger = function (_id, name, args) {
            var instance = this.find(_id);
            if (!instance) {
                throw ('could not find instance: ' + _id);
            }
            args = args.slice(0);
            args.unshift(name);
            instance.trigger.apply(instance, args);
        };
        return ChildPopup;
    })();
    CrossDresser.ChildPopup = ChildPopup;
})(CrossDresser || (CrossDresser = {}));
var CrossDresser;
(function (CrossDresser) {
    var resizer;
    (function (resizer) {
        var ELEMENTS_IN_HEIGHT = {};
        var ELEMENT_HEIGHT_COUNT = 0;
        var MIN_HEIGHT = 150;
        var HEIGHT = 'auto';
        var CURRENT_HEIGHT;
        var CALLBACKS = {};
        var AUTOSIZE_INTERVAL;
        function run(args) {
            if (!CrossDresser.current.is_frame)
                return console.log('Notice: Skipping resize since we\'re not inside an iframe');
            if (args == false)
                return disableAutosize();
            if (!args)
                return calculateResize();
            var has_changes = false;
            var new_min_height = extractMinHeight(args);
            if (new_min_height != MIN_HEIGHT) {
                MIN_HEIGHT = new_min_height;
                has_changes = true;
            }
            var new_height = extractHeight(args);
            if (new_height != HEIGHT) {
                if (new_height == 'auto')
                    enableAutosize();
                if (!isNaN(new_height))
                    HEIGHT = new_height;
                has_changes = true;
            }
            if (has_changes)
                calculateResize();
        }
        resizer.run = run;
        function addToHeightCalculations(element) {
            var $element = $(element);
            if (!$element.data('ffcore-element-id')) {
                $element.data('ffcore-element-id', ELEMENT_HEIGHT_COUNT++);
            }
            ELEMENTS_IN_HEIGHT[$element.data('ffcore-element-id')] = $element;
        }
        resizer.addToHeightCalculations = addToHeightCalculations;
        function removeFromHeightCalculations(element) {
            delete ELEMENTS_IN_HEIGHT[$(element).data('ffcore-element-id')];
        }
        resizer.removeFromHeightCalculations = removeFromHeightCalculations;
        function enableAutosize(interval) {
            interval = interval || (CrossDresser.current.is_native ? 500 : 1000);
            interval = interval < 100 ? 100 : interval;
            if (AUTOSIZE_INTERVAL)
                clearInterval(AUTOSIZE_INTERVAL);
            HEIGHT = 'auto';
            AUTOSIZE_INTERVAL = setInterval(function () {
                calculateResize();
            }, interval);
            run();
        }
        resizer.enableAutosize = enableAutosize;
        function disableAutosize() {
            if (AUTOSIZE_INTERVAL) {
                clearInterval(AUTOSIZE_INTERVAL);
            }
        }
        resizer.disableAutosize = disableAutosize;
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        function calculateResize() {
            var new_height = $('html').css('height', 'auto').height();
            for (var k in ELEMENTS_IN_HEIGHT) {
                var $elem = ELEMENTS_IN_HEIGHT[k];
                if ($elem.css('position') != 'absolute')
                    continue;
                var element_bottom = $elem.offset().top + $elem.outerHeight();
                if (element_bottom > new_height)
                    new_height = element_bottom;
            }
            if (CURRENT_HEIGHT && new_height < MIN_HEIGHT)
                new_height = MIN_HEIGHT;
            var viewport_height = $(window).height();
            if (CURRENT_HEIGHT && ((CURRENT_HEIGHT == viewport_height) || (CURRENT_HEIGHT < viewport_height + 10 && CURRENT_HEIGHT > viewport_height - 10))) {
                if ((CURRENT_HEIGHT == new_height) || (CURRENT_HEIGHT < new_height + 10 && CURRENT_HEIGHT > new_height - 10))
                    return;
            }
            CURRENT_HEIGHT = (new_height < MIN_HEIGHT) ? MIN_HEIGHT : new_height;
            CrossDresser.trigger('resize-frame', CURRENT_HEIGHT);
        }
        function extractMinHeight(args) {
            var height;
            if (args['min-height'])
                height = args['min-height'];
            if (args.minHeight)
                height = args.minHeight;
            if (args.min_height)
                height = args.min_height;
            height = parseInt(height);
            return height == NaN ? 0 : height;
        }
        function extractHeight(args) {
            var height;
            if (args['height'])
                height = args['height'];
            height = parseInt(height);
            return height == NaN ? 'auto' : height;
        }
    })(resizer = CrossDresser.resizer || (CrossDresser.resizer = {}));
})(CrossDresser || (CrossDresser = {}));
var CrossDresser;
(function (_CrossDresser) {
    var conduit;
    (function (conduit) {
        function run(command, args) {
            var promise;
            if (_CrossDresser.current.is_native) {
                promise = toParent(command, args);
            }
            else {
                promise = toIframe(command, args);
            }
            return promise;
        }
        conduit.run = run;
        function executeRemoteCommand(CrossDresser, child_type, child_id, command, args) {
            var methods = {
                frame: function () {
                    CrossDresser.ChildFrame.trigger(child_id, command, args);
                },
                popup: function () {
                    CrossDresser.ChildPopup.trigger(child_id, command, args);
                }
            };
            methods[child_type]();
        }
        function toParent(command, args) {
            var dfr = $.Deferred();
            executeRemoteCommand(_CrossDresser.current.parent.CrossDresser, _CrossDresser.current.environment, _CrossDresser.current._id, command, args);
            return dfr.resolve().promise();
        }
        function toIframe(command, args) {
            var dfr = $.Deferred();
            var attrs = {
                _id: _CrossDresser.current._id,
                command: command,
                environment: _CrossDresser.current.environment,
                args: args
            };
            var url = _CrossDresser.current.parent_conduit_url;
            url = ((url.indexOf('?') > -1) ? url + '&' : url + '?') + $.param(attrs);
            _CrossDresser.Utils.documentReady(function () {
                var $iframe = $('ff-frame-controller');
                if ($iframe)
                    $iframe.remove();
                $iframe = $('<iframe id="ff-frame-controller" src="' + url + '" width="10" height="10" style="position : absolute; top : 0px; left : 0px; visibility: hidden"></iframe>');
                $iframe.appendTo('body');
                $iframe.load(function () {
                    dfr.resolve();
                });
            });
            return dfr.promise();
        }
        function fromIframe(environment, url) {
            var uri = _CrossDresser.Utils.parseUrl(url);
            var params = _CrossDresser.Utils.parseQueryString(uri.query_string);
            if (environment != params.environment) {
                throw Error('environment does not match params.environment');
            }
            executeRemoteCommand(CrossDresser, environment, params._id, params.command, params.args);
        }
        conduit.fromIframe = fromIframe;
    })(conduit = _CrossDresser.conduit || (_CrossDresser.conduit = {}));
})(CrossDresser || (CrossDresser = {}));
/// <reference path="utils.ts"/>
/// <reference path="conduit.ts"/>
var CrossDresser;
(function (CrossDresser) {
    var CONDUIT_PATH = '/cross-dresser.html';
    var CALLBACKS = {};
    var Current = (function () {
        function Current() {
            this.config = {
                conduit_path: CONDUIT_PATH
            };
            this.raw_url = document.location.href;
            this.raw_uri = CrossDresser.Utils.parseUrl(this.raw_url);
            this.raw_params = CrossDresser.Utils.parseQueryString(this.raw_uri.query_string);
            try {
                if (window.top && window.top != window.self && document.referrer != this.raw_url.replace(document.location.hash, '')) {
                    this.environment = 'frame';
                    this.parent = window.top;
                    this.is_frame = true;
                    this.is_native = this.isNativeFrame();
                }
                else if (window.opener || (window.top && window.top.opener)) {
                    this.environment = 'popup';
                    this.parent = window.opener || window.top.opener;
                    this.is_popup = true;
                }
                else {
                    this.environment = 'toplevel';
                    this.parent = null;
                }
            }
            catch (err) {
                this.environment = 'toplevel';
            }
            this.initiateDocumentLoad();
            if (this.is_frame) {
                setTimeout(function () {
                    CrossDresser.resizer.enableAutosize();
                });
            }
        }
        Current.prototype.isNativeFrame = function () {
            try {
                var current_host = this.raw_uri.host;
                var parent_host = CrossDresser.Utils.parseUrl(window.top.location.href).host;
                return (parent_host == current_host) ? true : false;
            }
            catch (err) {
                return false;
            }
        };
        Current.prototype.getConduitUrl = function () {
            return this.raw_uri.scheme + '://' + this.raw_uri.host + ([80, 443].indexOf(this.raw_uri.port) > -1 ? '' : ':' + this.raw_uri.port) + (this.config.conduit_path || CONDUIT_PATH);
        };
        Current.prototype.initiateDocumentLoad = function () {
            var _this = this;
            if (!this.raw_params.crss_drssr) {
                return;
            }
            var array = this.raw_params.crss_drssr.split('::');
            this._id = array[0];
            this.parent_conduit_url = decodeURIComponent(array[1]);
            if (array[2]) {
                this.url_to_load = atob(decodeURIComponent(array[2]));
            }
            this.url = this.raw_url;
            this.uri = this.raw_uri;
            this.params = this.raw_params;
            if (this.url_to_load && !this.is_native) {
                var url = this.url_to_load;
                var crss_drssr = this._id + '::' + encodeURIComponent(this.parent_conduit_url);
                window.location.href = ((url.indexOf('?') > -1) ? url + '&' : url + '?') + 'crss_drssr=' + crss_drssr;
            }
            else if (this.url_to_load && this.is_native) {
                this.url = this.url_to_load;
                this.uri = CrossDresser.Utils.parseUrl(this.url_to_load);
                this.params = CrossDresser.Utils.parseQueryString(this.uri.query_string);
                var bt = document.createElement('base');
                bt.setAttribute('href', 'http://' + this.uri.host);
                document.getElementsByTagName('head')[0].appendChild(bt);
                setTimeout(function () {
                    _this.trigger('native-base-ready', _this.url_to_load);
                });
            }
            else if (this.environment == 'toplevel') {
                console.log('NOTICE: CrossDresser parent not found - running as toplevel');
            }
        };
        Current.prototype.trigger = function (name) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var promise = CrossDresser.conduit.run(name, args);
            var callbacks = CALLBACKS[name] || [];
            setTimeout(function () {
                for (var i = 0, length = callbacks.length; i < length; i++) {
                    callbacks[i].apply(CrossDresser.current, args);
                }
            });
            return promise;
        };
        Current.prototype.on = function (name, callback) {
            CALLBACKS[name] = CALLBACKS[name] || [];
            CALLBACKS[name].push(callback);
        };
        return Current;
    })();
    function config(config) {
        CrossDresser.current.config.conduit_path = config.conduit_path || CrossDresser.current.config.conduit_path || CONDUIT_PATH;
    }
    CrossDresser.config = config;
    function injectIntoPage(html) {
        $(function () {
            $('body').html(html);
        });
    }
    CrossDresser.injectIntoPage = injectIntoPage;
    CrossDresser.current = new Current();
})(CrossDresser || (CrossDresser = {}));
/// <reference path="child_frame.ts"/>
/// <reference path="child_popup.ts"/>
/// <reference path="resizer.ts"/>
/// <reference path="current.ts"/>
var CrossDresser;
(function (CrossDresser) {
    function createFrame() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return CrossDresser.ChildFrame.create.apply(CrossDresser.ChildFrame, args);
    }
    CrossDresser.createFrame = createFrame;
    function createPopup() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return CrossDresser.ChildPopup.create.apply(CrossDresser.ChildPopup, args);
    }
    CrossDresser.createPopup = createPopup;
    function resize(args) {
        CrossDresser.resizer.run(args);
    }
    CrossDresser.resize = resize;
    CrossDresser.trigger = CrossDresser.current.trigger;
    CrossDresser.on = CrossDresser.current.on;
})(CrossDresser || (CrossDresser = {}));
;
