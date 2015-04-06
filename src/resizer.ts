module CrossDresser {
    export module resizer {

        var ELEMENTS_IN_HEIGHT = {}
        var ELEMENT_HEIGHT_COUNT = 0

        var MIN_HEIGHT = 150
        var HEIGHT = 'auto'
        var CURRENT_HEIGHT:number

        var CALLBACKS = {}
        var AUTOSIZE_INTERVAL:number

        export function run(args?) {
            if (!current.is_frame) return console.log('Notice: Skipping resize since we\'re not inside an iframe')
            if (args == false) return disableAutosize()
            if (!args) return calculateResize()
            var has_changes = false
            var new_min_height = extractMinHeight(args)

            if (new_min_height != MIN_HEIGHT) {
                MIN_HEIGHT = new_min_height
                has_changes = true
            }
            var new_height = extractHeight(args)
            if (new_height != HEIGHT) {
                if (new_height == 'auto') enableAutosize()
                if (!isNaN(new_height)) HEIGHT = new_height
                has_changes = true
            }
            if (has_changes) calculateResize()
        }

        export function addToHeightCalculations(element) {
            var $element = $(element)
            if (!$element.data('ffcore-element-id')) {
                $element.data('ffcore-element-id', ELEMENT_HEIGHT_COUNT++)
            }
            ELEMENTS_IN_HEIGHT[$element.data('ffcore-element-id')] = $element
        }

        export function removeFromHeightCalculations(element) {
            delete ELEMENTS_IN_HEIGHT[$(element).data('ffcore-element-id')]
        }

        export function enableAutosize(interval?:number) {
            interval = interval || (current.is_native ? 500 : 1000)
            interval = interval < 100 ? 100 : interval
            if (AUTOSIZE_INTERVAL) clearInterval(AUTOSIZE_INTERVAL)
            HEIGHT = 'auto'
            AUTOSIZE_INTERVAL = setInterval(function() { calculateResize() }, interval)
            run()
        }

        export function disableAutosize(){
            if (AUTOSIZE_INTERVAL) {
                clearInterval(AUTOSIZE_INTERVAL)
            }
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function calculateResize() {
            var new_height = $('html').css('height', 'auto').height()
            for (var k in ELEMENTS_IN_HEIGHT) {
                var $elem = ELEMENTS_IN_HEIGHT[k]
                if ($elem.css('position') != 'absolute') continue
                var element_bottom = $elem.offset().top + $elem.outerHeight()
                if (element_bottom > new_height) new_height = element_bottom
          }
          if (CURRENT_HEIGHT && new_height < MIN_HEIGHT) new_height = MIN_HEIGHT
          var viewport_height = $(window).height()

          if (CURRENT_HEIGHT && ((CURRENT_HEIGHT == viewport_height) || (CURRENT_HEIGHT < viewport_height + 10 && CURRENT_HEIGHT > viewport_height - 10))) {
              if ((CURRENT_HEIGHT == new_height) || (CURRENT_HEIGHT < new_height + 10 && CURRENT_HEIGHT > new_height - 10)) return
          }
          CURRENT_HEIGHT = (new_height < MIN_HEIGHT) ? MIN_HEIGHT : new_height
          trigger('resize-frame', CURRENT_HEIGHT)
        }

        function extractMinHeight(args):number {
            var height
            if (args['min-height']) height = args['min-height']
            if (args.minHeight) height = args.minHeight
            if (args.min_height) height = args.min_height
            height = parseInt(height)
            return height == NaN ? 0 : height
        }

        function extractHeight(args):any {
            var height
            if (args['height']) height = args['height']
            height = parseInt(height)
            return height == NaN ? 'auto': height
        }

    }
}