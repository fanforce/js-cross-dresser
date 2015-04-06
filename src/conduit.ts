module CrossDresser {

    export module conduit {

        export function run(command, args) {
            var promise;
            if (current.is_native) {
                promise = toParent(command, args);
            }else {
                promise = toIframe(command, args);
            }
            return promise;
        }

        function executeRemoteCommand(CrossDresser, child_type, child_id, command, args) {
            var methods = {
                frame: function() { CrossDresser.ChildFrame.trigger(child_id, command, args); },
                popup: function() { CrossDresser.ChildPopup.trigger(child_id, command, args); }
            }
            methods[child_type]()
        }

        function toParent(command, args) {
            var dfr = $.Deferred();
            executeRemoteCommand(current.parent.CrossDresser, current.environment, current._id, command, args)
            return dfr.resolve().promise()
        }

        function toIframe(command, args) {
            var dfr = $.Deferred()
            var attrs = {
                _id: current._id,
                command: command,
                environment: current.environment,
                args: args
            }
            var url = current.parent_conduit_url
            url = ((url.indexOf('?') > -1) ? url+'&' : url+'?') + $.param(attrs)

            Utils.documentReady(function() {
                var $iframe = $('ff-frame-controller')
                if ($iframe) $iframe.remove()
                $iframe = $('<iframe id="ff-frame-controller" src="' + url + '" width="10" height="10" style="position : absolute; top : 0px; left : 0px; visibility: hidden"></iframe>')
                $iframe.appendTo('body')

                $iframe.load(function() {
                    dfr.resolve()
                })
            })

            return dfr.promise()
        }

        export function fromIframe(environment, url) {
            var uri:any = Utils.parseUrl(url)
            var params:any = Utils.parseQueryString(uri.query_string)
            if (environment != params.environment) {
                throw Error('environment does not match params.environment')
            }
            executeRemoteCommand(CrossDresser, environment, params._id, params.command, params.args)
        }

    }
}