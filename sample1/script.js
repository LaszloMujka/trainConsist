$(function () {
    var count = 0;

    setInterval(() => {
        $("#messageInput").val("Planned Consist Created");
        
    }, 1000);
    
    setInterval(() => {
        $("#messageInput1").val("Planned Consist Updated");
        
    }, 1000);

    setInterval(() => {
        $("#messageInput2").val("Planned Consist Deleted");
    }, 1000);


    $("#createButton").click(() => {
        $("#app1").flowAppendMessage($("#messageInput").val());
    });

    $("#createButton1").click(() => {
        $("#app1").flowAppendMessage($("#messageInput1").val());
    });

    $("#createButton2").click(() => {
        $("#app1").flowAppendMessage($("#messageInput2").val());
    });

    $("#sendButton").click(() => {
        //$("#app1").children(".message").flowMoveTo($("#start"));
    });

    $("#process").click(() => {
        $("#app1").children(".message").flowMoveTo($("#start"));
        $.flowSchedule(
            [
                {
                    desc: "Start",
                    highlight: "#start",
                    src: "#start",
                    dst: "#gti",
                    func: function () {
                        $("#start").children(".message").flowMoveTo("#gti");
                        
                    },
                    duration: getStepDelay()
                },
                {
                    desc:  "Invoke TIS to get train information\n"+ "Having the train identifier and the originDepartureDate Get Train API will be invoked",
                    highlight: "#tis1",
                    src: "#gti",
                    dst: "#gti",
                    duration: getStepDelay()
                
                },
            ]
        );
    });

    $("#nonpds").click(() => {
        $("#tis1").flowAppendMessage("Non PDS controlled train");
        $.flowSchedule(
            [
                {
                    desc: "TIS returns:\n cn-pdscorpint-code:\"2006\" and cn-pdscorpint-headerresponsedescription:\"No train found\"",
                    highlight: "#tis1",
                    src: "#tis1",
                    dst: "#trainpdscontrolled",
                    func: function () {
                        $("#tis1").children(".message").flowMoveTo($("#trainpdscontrolled"));
                        $("#gti").children(".message").flowMoveTo($("#trainpdscontrolled"));  
                        $("#trainpdscontrolled").children(".message").hide("Planned Consist Updated");
                        $("#trainpdscontrolled .message").hide("Planned Consist Deleted");
                        $("#trainpdscontrolled .message").hide("Planned Consist Created");
                        
                        //$("#trainpdscontrolled").flowAppendMessage("Non PDS controlled train");   
                    },
                    duration: getStepDelay()
                },
                {
                    desc: "Train is not PDS controlled. Exiting.",
                    highlight: "#tis1",
                    src: "#gti",
                    dst: "#trainpdscontrolled",
                    func: function () {
                        $("#trainpdscontrolled").children(".message").flowMoveTo("#endofprogram"); 
                        //$("#stage2").children(".message").clone().flowSend("#stage2", "#table1");
                        //$("#tis1").flowAppendMessage("Non PDS controlled train");
                       // $("#gti").children(".message").flowMoveTo("#trainpdscontrolled"); 
                       // $("#trainpdscontrolled .message").hide("Non PDS controlled train");
                       // $("#trainpdscontrolled").flowAppendMessage("Non PDS controlled train");
                        
                    },
                    duration: getStepDelay()
                }
            ]
        );
    });
    $("#retired").click(() => {
        $("#tis1").flowAppendMessage("PDS controlled train - retired");
        $.flowSchedule(
            [
                {
                    desc: "TIS returns:\n cn-pdscorpint-code:\"2000\" and sentTrainState: \"retired\"",
                    highlight: "#tis1",
                    src: "#tis1",
                    dst: "#trainpdscontrolled",
                    func: function () {
                        $("#tis1").children(".message").flowMoveTo($("#trainpdscontrolled"));
                        $("#gti").children(".message").flowMoveTo($("#trainpdscontrolled"));  
                        
                        //$("#trainpdscontrolled").flowAppendMessage("Non PDS controlled train");   
                    },
                    duration: getStepDelay()
                },
                {
                    desc: "Train is PDS controlled.",
                    highlight: "#trainpdscontrolled",
                    src: "#trainpdscontrolled",
                    dst: "#trainretired",
                    func: function () {
                        $("#trainpdscontrolled").children(".message").flowMoveTo("#trainretired"); 
                        //$("#stage2").children(".message").clone().flowSend("#stage2", "#table1");
                        //$("#tis1").flowAppendMessage("Non PDS controlled train");
                       // $("#gti").children(".message").flowMoveTo("#trainpdscontrolled"); 
                       // $("#trainpdscontrolled .message").hide("Non PDS controlled train");
                       // $("#trainpdscontrolled").flowAppendMessage("Non PDS controlled train");
                        
                    },
                    duration: getStepDelay()
                },
                {
                    desc: "Train is PDS controlled but retired.",
                    highlight: "#trainretired",
                    src: "#trainretired",
                    dst: "#endofprogram",
                    func: function () {
                        $("#trainretired").children(".message").flowMoveTo("#endofprogram"); 
                        //$("#stage2").children(".message").clone().flowSend("#stage2", "#table1");
                        //$("#tis1").flowAppendMessage("Non PDS controlled train");
                       // $("#gti").children(".message").flowMoveTo("#trainpdscontrolled"); 
                       // $("#trainpdscontrolled .message").hide("Non PDS controlled train");
                       // $("#trainpdscontrolled").flowAppendMessage("Non PDS controlled train");
                        
                    },
                    duration: getStepDelay()
                }
            ]
        );
    });

    // $("#ris .send")
    //     .click(function () {
    //         var value = $("#ris input").val();
    //         $.orderValue = value;

    //         schedule(
    //             [
    //                 {
    //                     desc: "RIS creates order with value [" + value + "]",
    //                     highlight: "#ris",
    //                     func: function () {
    //                         $.message = createMessageWithValue("HL7", "OBR: " + value);
    //                         $("#ris").append($.message);
    //                     },
    //                     duration: getStepDelay()
    //                 },
    //                 {
    //                     desc: "RIS sends OBR message to HL7GatewayServer",
    //                     src: "#ris",
    //                     dst: "#hl7gs",
    //                     highlight: "#ris",
    //                     func: function () {
    //                         $($.message).moveTo($("#hl7gs"));
    //                     },
    //                     duration: getStepDelay()
    //                 },
    //                 {
    //                     desc: "HL7GatewayServer creates the order with value [" + value + "]",
    //                     src: "#hl7gs .message .value",
    //                     dst: "#hl7gs .value",
    //                     highlight: "#hl7gs",
    //                     func: function () {
    //                         $("#hl7order").html(value);
    //                         $("#ris .send").prop("disabled", true)
    //                         $("#ris input").val("ris-updated");
    //                         $("#ris .update").prop("disabled", false);
    //                         $("#ordercorrector .send").prop("disabled", false);
    //                     },
    //                     duration: getStepDelay()
    //                 }
    //             ],
    //             getStepDelay()
    //         );
    //     }
    //     );

    // $("#ris .update")
    //     .click(function () {
    //         var value = $("#ris input").val();
    //         schedule(
    //             [
    //                 {
    //                     desc: "RIS creates an HL7 message of type ADT to update the patient demographics to [" + value + "]",
    //                     highlight: "#ris",
    //                     func: function () {
    //                         $.risUpdate = createMessageWithValue("HL7", "ADT: " + value);
    //                         $("#ris").append($.risUpdate);
    //                     },
    //                     duration: getStepDelay()
    //                 },
    //                 {
    //                     desc: "RIS sends the ADT HL7 message to HL7GatewayServer",
    //                     src: "#ris",
    //                     dst: "#hl7gs",
    //                     highlight: "#ris",
    //                     func: function () {
    //                         $($.risUpdate).send($("#ris"), $("#hl7gs"));
    //                         $("#hl7gs .update").prop("disabled", false);
    //                     },
    //                     duration: getStepDelay()
    //                 },
    //                 {
    //                     desc: "HL7GatewayServer updates the order with value [" + value + "]",
    //                     src: "#hl7gs .message .value",
    //                     dst: "#hl7order",
    //                     highlight: "#hl7gs",
    //                     func: function () {
    //                         $("#hl7order").html(value);
    //                         $.orderValue = value;
    //                     },
    //                     duration: getStepDelay()
    //                 }
    //             ]
    //         );
    //     }
    //     );

    // $("#hl7gs .update")
    //     .click(function () {
    //         if ($.validated) {
    //             schedule(
    //                 [
    //                     {
    //                         desc: "HL7GatewayServer informs DMS about the order update",
    //                         src: "#hl7gs",
    //                         dst: "#dms .requests",
    //                         highlight: "#hl7gs",
    //                         func: function () {
    //                             $.hl7gsCorrection = makeRequest($("#dms"),
    //                                 "Correction",
    //                                 $.orderValue);
    //                             storeDmsRequest($.hl7gsCorrection);
    //                         },
    //                         duration: getStepDelay()
    //                     },
    //                     {
    //                         desc: "DMS applies the correction and updates DicomMaster",
    //                         highlight: "#dms .rp",
    //                         func: function () {
    //                             $("#dicommaster .level .value").html($.orderValue);
    //                         },
    //                         duration: getStepDelay()
    //                     },
    //                     {
    //                         desc: "LDS pulls new DMS requests",
    //                         src: "#globaldicom .requests",
    //                         dst: "#localdicom .requests",
    //                         highlight: "#lds .rs",
    //                         func: function () {
    //                             $($.hl7gsCorrection)
    //                                 .clone()
    //                                 .send($("#globaldicom .requests"), $("#localdicom .requests"));
    //                         },
    //                         duration: getStepDelay()
    //                     },
    //                     {
    //                         des: "LDS applies the correction to the files and DicomImage",
    //                         highlight: "#lds .rp",
    //                         func: function () {
    //                             $("#dicomimage .level .value").html($.orderValue);
    //                             $("#fs .sop .value").html($.orderValue);
    //                         },
    //                         duration: getStepDelay()
    //                     }
    //                 ]
    //             );
    //         }
    //         else // Not validated
    //         {
    //             schedule(
    //                 [
    //                     {
    //                         desc: "HL7GatewayServer informs DMS about the order update, it is ignored :(",
    //                         src: "#hl7gs",
    //                         dst: "#dms .requests",
    //                         highlight: "#hl7gs",
    //                         func: function () {
    //                         },
    //                         duration: getStepDelay()
    //                     },
    //                 ]
    //             );
    //         }
    //     }
    //     );

    // $("#dicomcorrector .send")
    //     .click(function () {
    //         schedule(
    //             [
    //                 {
    //                     desc: "User corrects the Dicom data using InteleBrowser",
    //                     src: "#dicomcorrector",
    //                     dst: "#globaldicom .requests",
    //                     highlight: "#dicomcorrector",
    //                     func: function () {
    //                         $.dicomCorrectionValue = $("#dicomcorrector input").val();
    //                         $.dicomCorrection = makeRequest($("#dms"),
    //                             $.validated ? "Correction" : "Invalid",
    //                             $.dicomCorrectionValue);
    //                         storeDmsRequest($.dicomCorrection);
    //                     },
    //                     duration: getStepDelay()
    //                 },
    //                 {
    //                     desc: $.validated
    //                         ? "DMS applies the correction to DicomMaster"
    //                         : "DMS marks the correction invalid and does not change DicomMaster",
    //                     highlight: "#dms .rp",
    //                     func: function () {
    //                         if ($.validated) {
    //                             $("#dicommaster .level .value").html($.dicomCorrectionValue);
    //                         }
    //                     },
    //                     duration: getStepDelay()
    //                 },
    //                 {
    //                     desc: "LDS pulls new DMS requests",
    //                     src: "#globaldicom .requests",
    //                     dst: "#localdicom .requests",
    //                     highlight: "#lds .rs",
    //                     func: function () {
    //                         $($.dicomCorrection)
    //                             .clone()
    //                             .send($("#globaldicom .requests"), $("#localdicom .requests"));
    //                     },
    //                     duration: getStepDelay()
    //                 },
    //                 {
    //                     desc: $.validated
    //                         ? "LDS applies the correction to DicomImage and files"
    //                         : "LDS marks the correction invalid too",
    //                     highlight: "#lds .rp",
    //                     func: function () {
    //                         if ($.validated) {
    //                             $("#dicomimage .level .value").html($.dicomCorrectionValue);
    //                             $("#fs .sop .value").html($.dicomCorrectionValue);
    //                         }
    //                     },
    //                     duration: getStepDelay()
    //                 }
    //             ]
    //         );
    //     }
    //     );

    // $("#ordercorrector .send")
    //     .click(function () {
    //         var value = $("#ordercorrector input").val();

    //         schedule(
    //             [
    //                 {
    //                     desc: "InteleBrowser creates an HL7 message of type ADT",
    //                     highlight: "#ordercorrector",
    //                     func: function () {
    //                         $.ocMessage = createMessageWithValue("HL7", "ADT: " + value);
    //                         $("#ordercorrector").append($.ocMessage);
    //                     },
    //                     duration: getStepDelay()
    //                 },
    //                 {
    //                     desc: "InteleBrowser sends the ADT HL7 message to HL7GatewayServer",
    //                     src: "#ordercorrector",
    //                     dst: "#hl7gs",
    //                     highlight: "#ris",
    //                     func: function () {
    //                         $($.ocMessage).send($("#ordercorrector"), $("#hl7gs"));
    //                     },
    //                     duration: getStepDelay()
    //                 },
    //                 {
    //                     desc: "HL7GatewayServer updates the order with value [" + value + "]",
    //                     src: "#hl7gs .message .value",
    //                     dst: "#hl7order",
    //                     highlight: "#hl7gs",
    //                     func: function () {
    //                         $("#hl7order").html(value);
    //                         $.orderValue = value;
    //                     },
    //                     duration: getStepDelay()
    //                 }
    //             ]
    //         );
    //     }
    //     );

    // $("#manualvalidation .override")
    //     .click(function () {
    //         alert("Not yet implemented");
    //         //                       schedule(
    //         //                           [
    //         //                               {
    //         //                                   desc: "",
    //         //                                   highlight: "#ordercorrector",
    //         //                                   func: function()
    //         //                                   {
    //         //                                       $.ocMessage = createMessageWithValue( "HL7", "ADT: " + value );
    //         //                                       $( "#ordercorrector" ).append( $.ocMessage );
    //         //                                   },
    //         //                                   duration: getStepDelay()
    //         //                               },
    //         //                           ]
    //         //                       );
    //     }
    //     );

});

function updateDicomImage(value) {
    $("#dicomimage .level .value").html(value);
}

function makeCheckpoint() {
    var value = $($.sop).find(".value").html();

    $.checkpoint = makeRequest($("#lds"),
        "Checkpoint",
        value);

    storeLdsRequest($.checkpoint);
}

function storeLdsRequest(request) {
    $("#localdicom .requests").append(request);
}

function storeDmsRequest(request) {
    $("#globaldicom .requests").append(request);
}

function sendToDms(request) {
    $(request)
        .clone()
        .send($("#localdicom .requests"),
            $("#globaldicom .requests"));
}

function sendToLds(request) {
    $(request)
        .clone()
        .send($("#globaldicom .requests"),
            $("#localdicom .requests"));
}

function updateDicomMaster(value) {
    $("#dicommaster .level .value").html(value);
}

function getPacsId() {
    return $("#pacs").attr("pacsid");
}

function getServerId(elem) {
    return $(elem).parents(".host").attr("serverid");
}

function getAppId(elem) {
    var app = $(elem).hasClass("application") ? elem : $(elem).parents(".application");
    return app.attr("appid");
}

function getColor(elem) {
    var pacsid = getPacsId();
    var serverid = getServerId(elem);
    var appid = getAppId(elem);
    return $.colour["" + pacsid + "-" + serverid + "-" + appid];
}

function makeRequest(source, type, value) {
    var pacsid = getPacsId();
    var serverid = getServerId(source);
    var appid = getAppId(source);

    return createRequestWithTypeValue(pacsid,
        serverid,
        appid,
        type,
        value);
}

function validate() {
    if (!$.validated) {
        // if we already ingested
        if ($.sop) {
            $("#validator")
                .shootArrowTo($("#hl7gs"), 0, getStepDelay());

            var value = $("#hl7order").html();
            console.log("[" + value + "]");
            if (value && $.trim(value) != "") {
                $.validated = true;

                schedule(
                    [
                        {
                            desc: "Create validation correction with value [" + $.orderValue + "]",
                            highlight: "#validator",
                            func: function () {
                                $.validation = makeRequest($("#lds"),
                                    "Validation",
                                    value);

                                storeLdsRequest($.validation);
                            },
                            duration: getStepDelay()
                        },
                        {
                            desc: "LDS applies correction to DicomImage",
                            src: "#localdicom .requests",
                            dst: "#dicomimage .level",
                            highlight: "#lds .rp",
                            func: applyDicomImageCorrection,
                            duration: getStepDelay()
                        },
                        {
                            desc: "LDS applies correction to .dcm files on disk",
                            src: "#localdicom .requests",
                            dst: "#fs",
                            highlight: "#lds .rp",
                            func: applyFilesystemCorrection,
                            duration: getStepDelay()
                        },
                        {
                            desc: "LDS sends validation to DMS",
                            src: "#localdicom .requests",
                            dst: "#globaldicom .requests",
                            highlight: "#rs",
                            func: function () { sendToDms($.validation); },
                            duration: getStepDelay()
                        },
                        {
                            desc: "DMS applies the correction to DicomMaster",
                            src: "#globaldicom .requests",
                            dst: "#dicommaster .level",
                            highlight: "#dms .rp",
                            func: applyDicomMasterCorrection,
                            duration: getStepDelay()
                        }
                    ]
                );

            }
            else {
                // Recurse
                setTimeout(validate, 2 * getStepDelay());
            }
        }
    }
}

function applyDicomImageCorrection() {
    var value = $("#localdicom .requests .value").last().html();
    $("#dicomimage .level .value").html(value);
}

function applyDicomMasterCorrection() {
    var value = $("#globaldicom .requests .value").last().html();
    $("#dicommaster .level .value").html(value);
}

function applyFilesystemCorrection() {
    var value = $("#localdicom .requests .value").last().html();
    $("#fs .sop .value").html(value);
}

