/// <reference path="jquery.d.ts" />
/// <reference path="utils.ts"/>
/// <reference path="base.ts"/>

module CrossDresser {
    var INSTANCES = {};
    var DEFAULT_WIDTH = 500;
    var DEFAULT_HEIGHT = 450;

    export class ChildPopup {
        _id:string;
        instance:any;
        name:string;
        url:string;
        width:number;
        height:number;

        constructor(_id: string) {
            this._id = _id;
            if (!INSTANCES[_id]) {
                throw new RangeError('No frame exists by the referenced _id')
            }
            this.instance = INSTANCES[_id]
            this.name = this.instance.name
            this.url = this.instance.url
            this.width = this.instance.width
            this.height = this.instance.height
        }

        trigger(name, ...args) {
            var callbacks = this.callbacks(name)
            for (var i=0, size=callbacks.length; i < size; i++) {
                callbacks[i].apply(this, args)
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

        open() {
            setTimeout(function() {
                var width = this.width,
                    height = this.height,
                    top = (window.screen.height/2)-(height/2),
                    left = (window.screen.width/2)-(width/2);
                top = top - (top*0.2);
                window.open(this.url, this.name, 'toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=1,width='+width+',height='+height+',top='+top+',left='+left)
            }.bind(this))
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        static create(url: string): ChildPopup;
        static create(settings: any): ChildPopup {
            if (url) {
                settings = {url: url}
            }

            var _id = Utils.createId()
            var attrs = settings.attrs || {}
            var url = settings.url.replace(/^\/\//, 'http://')
            var width = settings.width || DEFAULT_WIDTH
            var height = settings.height || DEFAULT_HEIGHT
            var name = settings.name || _id

            attrs.crss_drssr = _id + '::' + encodeURIComponent(current.getConduitUrl())

            url = (url.indexOf('?') > -1) ? url+'&' : url+'?'
            url += $.param(attrs)

            INSTANCES[_id] = {
                url: url,
                name: name,
                width: width,
                height: height,
                callbacks: {}
            }
            return new ChildPopup(_id)
        }

        static find(_id: string): ChildPopup {
            if (INSTANCES[_id]) {
                return new ChildPopup(_id)
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