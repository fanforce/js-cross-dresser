/// <reference path="child_frame.ts"/>
/// <reference path="child_popup.ts"/>
/// <reference path="resizer.ts"/>
/// <reference path="current.ts"/>

module CrossDresser {

    export function createFrame(...args) {
        return ChildFrame.create.apply(ChildFrame, args)
    }

    export function createPopup(...args) {
        return ChildPopup.create.apply(ChildPopup, args)
    }

    export function resize(args?) {
        resizer.run(args)
    }

    export var trigger = current.trigger
    export var on = current.on
};


