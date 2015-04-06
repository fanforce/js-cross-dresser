/// <reference path="jquery.d.ts" />
/// <reference path="utils.ts"/>

module CrossDresser {
    var INSTANCES = {}

    export var frames = INSTANCES
    export class ChildFrame {
        _id: string;
        instance: any;
        url: string;
        width: number;
        height: number;
        is_native: boolean;
        element: any;

        constructor(_id: string) {
            this._id = _id;
            if (!INSTANCES[_id]) {
                throw new RangeError('No frame exists by the referenced _id')
            }
            this.instance = INSTANCES[_id]
            this.url = this.instance.url
            this.height = this.instance.height
            this.is_native = this.instance.is_native
        }

        trigger(name, ...args) {
            var callbacks = this.callbacks(name)
            for (var i=0, size=callbacks.length; i < size; i++) {
                callbacks[i].apply(this, args)
            }
            if (name == 'native-base-ready') {
                this.loadContent()
            }else if (name == 'resize-frame') {
                this.resize.apply(this, args)
            }
        }

        on(name: string, callback: () => any) {
            this.callbacks(name).push(callback)
        }

        callbacks(name: string) {
            if (!this.instance.callbacks[name]) {
                this.instance.callbacks[name] = []
            }
            return this.instance.callbacks[name]
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        getElement() {
            return this.element = this.element || $('iframe#'+this._id)
        }

        loadContent() {
            if (this.instance.content_prms) {
                var frame = this
                this.instance.content_prms.then(function(html) {
                    frame.getElement()[0].contentWindow.CrossDresser.injectIntoPage(html)
                })
            }
        }

        resize(new_height) {
            new_height = (!new_height || parseInt(new_height) < 150) ? 150 : parseInt(new_height)
            this.getElement().attr('height', new_height)
            return null
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        static create(url: string): ChildFrame;
        static create(settings: any): ChildFrame {
            if (url) {
                settings = {url: url}
            }

            var _id = Utils.createId()
            var url = settings.url.replace(/^\/\//, 'http://')
            var attrs = settings.attrs || {}
            var width = settings.width || 500
            var height = settings.height || 450
            var is_native = false

            if (settings.use_native_base) {
                var goto_url = ((url.indexOf('?') > -1) ? url+'&' : url+'?') + $.param(attrs)
                var content_prms = $.ajax({
                    url: goto_url,
                    dataType: 'jsonp',
                    jsonp: 'callback'
                })
                url = settings.use_native_base
                attrs = {}
                is_native = true
            }

            attrs.crss_drssr = _id + '::' + encodeURIComponent(current.getConduitUrl())
            if (goto_url) {
                attrs.crss_drssr += '::' + encodeURIComponent(goto_url)
            }

            url = (url.indexOf('?') > -1) ? url+'&' : url+'?'
            url += $.param(attrs)

            INSTANCES[_id] = {
                callbacks: {},
                width: width,
                height: height,
                url: url,
                is_native: is_native,
                content_prms: content_prms
            }
            return new ChildFrame(_id)
        }

        static find(_id: string) {
            if (INSTANCES[_id]) {
                return new ChildFrame(_id)
            }
        }

        static trigger(_id: string, name: string, args: Array<any>) {
            var instance = this.find(_id)
            if (!instance) {
                throw('could not find instance: '+_id)
            }
            args = args.slice(0)
            args.unshift(name)
            instance.trigger.apply(instance, args)
        }
    }
}