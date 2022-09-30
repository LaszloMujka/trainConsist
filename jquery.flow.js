
(function ($) {
    $.fn.flowArrowTo = function (destination) {
        $(this).each(
            function (srcIndex, sourceElem) {
                $(destination).each(
                    function (dstIndex, destElem) {
                        setTimeout(function () {
                            drawArrow(sourceElem, destElem);
                        },
                            100
                        );
                    }
                );
            }
        );
        return this;
    }

    $.fn.flowShootArrowTo = function (destination, when, duration = 1000) {
        var sources = $(this);
        setTimeout(function () {
            $(sources).each(
                function (srcIndex, sourceElem) {
                    $(destination).each(
                        function (dstIndex, destElem) {
                            setTimeout(function () {
                                var arrowElems = drawArrow(sourceElem, destElem);
                                setTimeout(function () {
                                    $(arrowElems[0]).remove();
                                    $(arrowElems[1]).remove();
                                },
                                    duration
                                );
                            }, 100);
                        }
                    );
                }
            );
        },
            when
        );
        return $(this);
    }

    $.fn.flowMoveTo = function (destinationContainer) {
        return this.each(
            function () {
                var element = $(this);
                var elemPosition = $(this).offset();

                var elemWidth = $(this).width();
                var elemHeight = $(this).height();

                var destinationPlaceHolder =
                    createPlaceholder()
                        .appendTo($(destinationContainer))
                        .width(elemWidth)
                        .height(elemHeight*2)
                        .hide()
                        .slideDown(
                            getStepDelay(),
                            function () // complete
                            {
                                this.remove();
                            }
                        );

                $(this)
                    .css("position", "absolute")
                    .offset({
                        left: elemPosition.left,
                        top: elemPosition.top
                    });

                var destPosition = $(destinationPlaceHolder).offset();

                var sourcePlaceHolder =
                    createPlaceholder()
                        .appendTo(element.parent())
                        .width(elemWidth)
                        .height(elemHeight*2)
                        .slideUp(
                            getStepDelay(),
                            function () // complete
                            {
                                this.remove();
                            }
                        );

                $(this)
                    .animate(
                        {
                            left: destPosition.left,
                            top: destPosition.top
                        },
                        {
                            duration: getStepDelay(),
                            //step: function()
                            //{
                            //    var xDiff = $( destinationPlaceHolder ).offset().left - destPosition.left;
                            //    var yDiff = $( destinationPlaceHolder ).offset().top - destPosition.top;
                            //    $( this ).css( {
                            //        left: $( this ).offset().left += xDiff,
                            //        top: $( this ).offset().top -= yDiff
                            //    } );
                            //    console.log( "shifting by [" + xDiff + ", " + yDiff + "]" );
                            //},
                            complete: function () {
                                $(this)
                                    .appendTo($(destinationContainer))
                                    .css("position", "static");
                            }
                        });
            });
    }

    /**
     * This method will animate the object towards the destination without it being appended to anything
     */
    $.fn.flowSend = function (sourceContainer, destinationContainer) {
        var sourcePosition = $(sourceContainer).offset();
        var destPosition = $(destinationContainer).offset();

        $(this)
            .appendTo($(sourceContainer))
            .css("position", "absolute")
            .css("left", sourcePosition.left)
            .css("top", sourcePosition.top)
            .animate(
                {
                    left: destPosition.left,
                    top: destPosition.top
                },
                getStepDelay(),
                function () // complete
                {
                    $(this)
                        .appendTo($(destinationContainer))
                        .css("position", "static");
                });
    }

    $.fn.flowAppendMessage = function (value) {
        console.log("appending message");
        $(this).append($("<div class=\"message\">" + value + "</div>"));
    }

    /**
     * Schedules is a list of schedule objects in the following format:
     * [ 
     *     {
     *         src : "#lds",
     *         dst : "#dms",
     *         highlight: "#rs",
     *         func : function() {},
     *         duration : 2000,
     *         desc : "LDS sends its checkpoint to DMS"
     *     },
     *     {
     *         ...
     *     }
     * ]
     *
     * $.scheduleState: play, pause, step
     *     This state controls whether we are continuously animating or paused.
     *
     *  
     */
    $.flowSchedule = function (schedules, stepDelay) {
        var timer = 0;

        for (i = 0; i < schedules.length; i++) {
            sc = schedules[i];

            // Set description
            setTimeout(
                displayDescription,
                timer,
                sc.desc,
                sc.duration,
                (sc.src && sc.dst) ? 5 * sc.duration : 3 * sc.duration,
                sc.highlight
            );
            timer = timer + 3 * sc.duration;

            // Draw arrows
            if (sc.src && sc.dst) {
                $(sc.src)
                    .flowShootArrowTo(
                        $(sc.dst),
                        timer,
                        2 * sc.duration
                    );
                timer = timer + sc.duration;
            }

            // Invoke function
            setTimeout(sc.func, timer);
            timer = timer + sc.duration;

            // Remove description
            setTimeout(function () {
                $("#desc").html("<h3>&nbsp;</h3>");
            },
                timer
            );
            timer = timer + sc.duration;
        }
    }

}(jQuery));

//  _    _ _   _ _ _ _         ______                _   _                 
// | |  | | | (_) (_) |       |  ____|              | | (_)                
// | |  | | |_ _| |_| |_ _   _| |__ _   _ _ __   ___| |_ _  ___  _ __  ___ 
// | |  | | __| | | | __| | | |  __| | | | '_ \ / __| __| |/ _ \| '_ \/ __|
// | |__| | |_| | | | |_| |_| | |  | |_| | | | | (__| |_| | (_) | | | \__ \
//  \____/ \__|_|_|_|\__|\__, |_|   \__,_|_| |_|\___|\__|_|\___/|_| |_|___/
//                        __/ |                                            
//                       |___/                                             
// ========================================================================
//     _                               
//    / \   _ __ _ __ _____      _____ 
//   / _ \ | '__| '__/ _ \ \ /\ / / __|
//  / ___ \| |  | | | (_) \ V  V /\__ \
// /_/   \_\_|  |_|  \___/ \_/\_/ |___/

function getMiddle(start, end) {
    return {
        x: (start.x + end.x) / 2,
        y: (start.y + end.y) / 2
    };
}

function drawArrow(source, destination) {
    var sourcePosition = $(source).offset();
    var start = {
        x: sourcePosition.left + ($(source).width() / 2),
        y: sourcePosition.top + ($(source).height() / 2)
    };
    var srcRange = {
        min: {
            x: sourcePosition.left,
            y: sourcePosition.top
        },
        max: {
            x: sourcePosition.left + $(source).width(),
            y: sourcePosition.top + $(source).height()
        }
    }

    var destPosition = $(destination).offset();
    var end = {
        x: destPosition.left + ($(destination).width() / 2),
        y: destPosition.top + ($(destination).height() / 2)
    };
    var dstRange = {
        min: {
            x: destPosition.left,
            y: destPosition.top
        },
        max: {
            x: destPosition.left + $(destination).width(),
            y: destPosition.top + $(destination).height()
        }
    }

    start = intersect(start, end, srcRange);
    end = intersect(end, start, dstRange);

    var deltaX = end.x - start.x;
    var deltaY = end.y - start.y;
    var diagonal = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
    var angle = Math.atan(deltaY / deltaX) * 180 / Math.PI;

    /*console.log( "source height = " + $( source ).height() );
    console.log( "delta = [" + deltaX + ", " + deltaY + "]" );
    console.log( "diagonal = " + diagonal );
    console.log( "angle = " + angle );*/

    var arrowHead = $((start.x < end.x) ? "<span>&gt;</span>" : "<span>&lt;</span>")
        .css("position", "absolute")
        .css("left", end.x - 5)
        .css("top", end.y - 8)
        .css("transform", "rotate(" + angle + "deg)")
        .appendTo($(source));

    var mid = getMiddle(start, end);
    var midUnrotated = getMiddle(start, { x: start.x + diagonal, y: start.y });
    var startUnrotated = { x: start.x - (midUnrotated.x - mid.x), y: mid.y };

    var line = $("<hr />")
        .css("position", "absolute")
        .css("left", startUnrotated.x)
        .css("top", startUnrotated.y)
        .css("width", "" + diagonal + "px")
        .css("height", "0px")
        .css("transform", "rotate(" + angle + "deg)")
        .css("margin", "0px")
        .css("padding", "0px")
        .appendTo($(source));

    return [line, arrowHead];

}

function isOutside(point, range) {
    return point.x <= range.min.x || point.x >= range.max.x || point.y <= range.min.y || point.y >= range.max.y;
}

//       range
// +--------------+
// | start *======|========* end
// +--------------+
//
// Assumptions:
//  - start is inside the range
//  - end is outside the range
//  - start and end are points { x: 0, y: 0 };
//  - range is { min: , max: };
function intersectRecursive(start, end, range, count) {
    //console.log( "start = [" + start.x + ", " + start.y + "],\tend = [" + end.x + ", " + end.y + "]" );
    if (count == 0) {
        //console.log( "intersect = [" + end.x + ", " + end.y + "]" );
        return end;
    }

    var mid = getMiddle(start, end);

    if (isOutside(mid, range)) {
        return intersectRecursive(start, mid, range, count - 1);
    }
    else {
        return intersectRecursive(mid, end, range, count - 1);
    }
}

function intersect(start, end, range) {
    return intersectRecursive(start, end, range, 10);
}

//  ____       _              _       _      
// / ___|  ___| |__   ___  __| |_   _| | ___ 
// \___ \ / __| '_ \ / _ \/ _` | | | | |/ _ \
//  ___) | (__| | | |  __/ (_| | |_| | |  __/
// |____/ \___|_| |_|\___|\__,_|\__,_|_|\___|

function getStepDelay() {
    return 500;
}

function displayDescription(desc, duration, highlightDuration, highlight) {
    var dialog = $("<div>" + desc + "</div>").dialog({
        autoOpen: true,
        show: {
          effect: "blind",
          duration: 500
        },
        hide: {
          effect: "blind",
          duration: 500
        }
      });
    // $("<h3>" + desc + "</h3>")
    //     .appendTo("#desc")
    //     .css("opacity", 0.0)
    //     .css("position", "relative")
    //     .css("top", -100)
    //     .animate(
    //         {
    //             opacity: 1.0,
    //             top: 0
    //         }, duration);

    // Highlight component
    if (highlight) {
        var oldColor =
            $(highlight)
                .css("color");

        var oldBgColor =
            $(highlight)
                .css("background-color");

        $(highlight)
            .css("color", "Blue");

        $(highlight)
            .css("background-color", "pink");

        // Restore old color
        setTimeout(() => {
            $(highlight)
                .css("color", oldColor)
                .css("background-color", oldBgColor);
                dialog.dialog("close");
            },
            highlightDuration
        );
    }
}

//  _____          _                   
// |  ___|_ _  ___| |_ ___  _ __ _   _ 
// | |_ / _` |/ __| __/ _ \| '__| | | |
// |  _| (_| | (__| || (_) | |  | |_| |
// |_|  \__,_|\___|\__\___/|_|   \__, |
//                               |___/ 

function createPlaceholder()
{
    return $("<div></div>");
}