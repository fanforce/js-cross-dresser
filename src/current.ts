/// <reference path="utils.ts"/>
/// <reference path="conduit.ts"/>

module CrossDresser {
    var CONDUIT_PATH = '/cross-dresser.html';
    var CALLBACKS = {};

    class Current {
        _id: string;
        raw_uri: any;
        raw_url: string;
        raw_params: any;
        url_to_load: string;
        url: string;
        uri: any;
        params: any;
        environment: string;
        parent: any;
        parent_conduit_url: string;
        is_frame: boolean;
        is_popup: boolean;
        is_native: boolean;
        config: any = {
            conduit_path: CONDUIT_PATH
        };
        constructor() {
            this.raw_url = document.location.href
            this.raw_uri = CrossDresser.Utils.parseUrl(this.raw_url);
            this.raw_params = Utils.parseQueryString(this.raw_uri.query_string);
            try {
                if (window.top && window.top != window.self && document.referrer != this.raw_url.replace(document.location.hash,'')) {
                    this.environment = 'frame'
                    this.parent = window.top
                    this.is_frame = true
                    this.is_native = this.isNativeFrame()
                }else if (window.opener || (window.top && window.top.opener)) {
                    this.environment = 'popup'
                    this.parent = window.opener || window.top.opener
                    this.is_popup = true
                } else {
                    this.environment = 'toplevel'
                    this.parent = null
                }
            } catch(err) {
                this.environment = 'toplevel'
            }

            this.initiateDocumentLoad()
            if (this.is_frame) {
                setTimeout(function() { resizer.enableAutosize() })
            }
        }

        isNativeFrame(): boolean {
            try {
                var current_host = this.raw_uri.host
                var parent_host = CrossDresser.Utils.parseUrl(window.top.location.href).host
                return (parent_host == current_host) ? true : false
            } catch(err) {
                return false
            }
        }

        getConduitUrl(): string {
            return this.raw_uri.scheme + '://' + this.raw_uri.host + ([80,443].indexOf(this.raw_uri.port) > -1 ? '' : ':'+this.raw_uri.port) + (this.config.conduit_path || CONDUIT_PATH);
        }

        initiateDocumentLoad(): void {
            if (!this.raw_params.crss_drssr) {
                return
            }

            var array: Array<string> = this.raw_params.crss_drssr.split('::')
            this._id = array[0]
            this.parent_conduit_url = decodeURIComponent(array[1])
            if (array[2]) {
                this.url_to_load = atob(decodeURIComponent(array[2]));
            }

            this.url = this.raw_url;
            this.uri = this.raw_uri;
            this.params = this.raw_params;

            if (this.url_to_load && !this.is_native) {
                var url = this.url_to_load
                var crss_drssr = this._id + '::' +  encodeURIComponent(this.parent_conduit_url)
                window.location.href = ((url.indexOf('?') > -1) ? url+'&' : url+'?') + 'crss_drssr=' + crss_drssr
            } else if (this.url_to_load && this.is_native) {
                this.url = this.url_to_load
                this.uri = CrossDresser.Utils.parseUrl(this.url_to_load)
                this.params = CrossDresser.Utils.parseQueryString(this.uri.query_string)
                var bt = document.createElement('base')
                bt.setAttribute('href', 'http://'+ this.uri.host)
                document.getElementsByTagName('head')[0].appendChild(bt)
                setTimeout(()=> { this.trigger('native-base-ready', this.url_to_load) })
            } else if(this.environment == 'toplevel') {
                console.log('NOTICE: CrossDresser parent not found - running as toplevel')
            }
        }

        trigger(name, ...args) {
            var promise = conduit.run(name, args)
            var callbacks = CALLBACKS[name] || []
            setTimeout(function() {
                for (var i=0, length=callbacks.length; i < length; i++) {
                    callbacks[i].apply(current, args)
                }
            })
            return promise
        }

        on(name, callback): void {
            CALLBACKS[name] = CALLBACKS[name] || []
            CALLBACKS[name].push(callback)
        }
    }

    export function config(config: any) {
        current.config.conduit_path = config.conduit_path || current.config.conduit_path || CONDUIT_PATH
    }

    export function injectIntoPage(html): void {
        $(function() {
            $('body').html(html)
        })
    }

    export var current: Current = new Current()
}

