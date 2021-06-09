PennController.ResetPrefix(null) // Shorten command names (keep this line here))
Sequence("consent", "instructions" , randomize("warmup"), "ready", randomize("experiment"), "exit", "send")

Header(/*void*/)
    // This .log command will apply to all trials
    .log("ID", GetURLParameter("id") ) // Append the "ID" URL parameter to each result line

// Consent form
newTrial( "consent" ,
    newHtml("consent_form", "consent.html")
        .print()
        .log()
    ,
    newText("warning", "Please type fill out all items above to continue.")
        .color("red")
        .italic()
        //.css('position','absolute')
        .bold()
        .center()
    ,
    newButton("consent_button", "By clicking this button I indicate my consent.")
        .center()
        .print()
        .wait( getHtml("consent_form").test.complete()
                    .failure( getText("warning").print() ) )
).setOption("hideProgressBar", true)

newTrial("instructions" ,
    newHtml("instructions", "instructions.html")
       .log()
       .print("center at 50vw","middle at 50vh")
    ,
    newKey("J").wait() // finish trial upon press of the spacebar
)
.setOption("hideProgressBar", true)


// WARM-UP
Template( "warmup.csv" ,
    row => newTrial( "warmup" ,
        defaultText.center().print("center at 50vw","middle at 50vh").log()
        ,
        // Automatically start and wait for Timer elements when created, and log those events
       defaultTimer.log().start().wait()
       ,
       // count the number of trials and show question and break screens after n trials
       newVar("warmup_nTrial", 0)
       .global()
       .set(v=>v+1)
       .test.is(v=>v==10)
        .success(
            newHtml("question_warmup", "question_warmup.html")
            //.cssContainer({"width":"720px"})
            .print()
            .log()
            ,
            newText("wp_warning", "Please type an answer to continue.")
            .color("red")
            .italic()
            .cssContainer({
                    "margin-top": "7px",
                    position: "relative",
                    left: "unset",
                    top: "unset",
                    height: 0,
                    'line-height': '1em'
                 })
            .bold()
            .remove()
            ,
            newButton("qw_button", "Next")
            .center()
            .print()
            //.after( getText("warning") )
            .wait(
                getHtml("question_warmup").test.complete()
                    .failure( getText("wp_warning")
                                .print() )
                )
        )
       ,
       clear() // clear screen
       ,
       // Mask, shown on screen for 500ms
       newText("mask", "######"),
       newTimer("maskTimer", 500),
       getText("mask").remove()
       ,
       // Prime, shown on screen for 42ms
       newText("prime", row.prime),
       newTimer("primeTimer", 34),
       getText("prime").remove()
        ,
        // Target, shown on screen until F or J is pressed
        newText("target",row.target),
        newKey("answerTarget", "fj").log().wait(),
        getText("target").remove()
    )
.setOption("hideProgressBar", true)
// Logging participant's group
.log("group", row.group)
// Logging type of prime and target
.log( "condition", row.condition)
// Logging expected answer
.log("corrAns", row.corrAns )
// Logging if prime is related or not
.log("primetype", row.primetype )
// logging prime word
.log("prime", row.prime)
// logging target word
.log("target", row.target)
)

newTrial("ready", //this trial routine and the next one needs to appear in the middle of the Template above
    newHtml("ready", "ready.html")
        //.cssContainer({"width":"720px"})
        .print("center at 50vw","middle at 50vh")
        .log()
    ,
    newKey("J").wait()
)
.setOption("hideProgressBar", true)

// Executing experiment from the csv table, where participants may or may not be divided into two groups
Template( "items.csv" ,
    row => newTrial( "experiment" ,
       // Automatically start and wait for Timer elements when created, and log those events
       defaultTimer.log().start().wait()
       ,
      // count the number of trials and show question and break screens after n trials decrementally
       newVar("nRemainingTrials", 320).global().set(v=> v-1)
       ,
        // count the number of trials and show question and break screens after n trials incrementally
       newVar("nTrial", 0)
       .global()
       .set(v=>v+1)
       .test.is(v=> v===80) // the first question appears after 80 items (2 breaks)
        .success(
            newHtml("q1", "question1.html")
                //.cssContainer({"width":"720px"})
                .print()
                .log()
                ,
                newText("warning", "Please type an answer to continue.")
                .color("red")
                .italic()
                .cssContainer({
                    "margin-top": "7px",
                    position: "relative",
                    left: "unset",
                    top: "unset",
                    height: 0,
                    'line-height': '1em'
                 })
                .bold()
                .remove()
                ,
                newButton("q1_button", "Resume the experiment.")
                .center().print()
                .wait(
                    getHtml("q1").test.complete()
                        .failure( getText("warning")
                                    .print() )
                )
        ), clear(), //clear screen
        getVar('nTrial').test.is(v=> v===200) // the second question appears after 200 items (5 breaks)
        .success(
            newHtml("q2", "question2.html")
                //.cssContainer({"width":"720px"})
                .print()
                .log()
                ,
                newText("warning2", "Please type an answer to continue.")
                .color("red")
                .italic()
                .cssContainer({
                    "margin-top": "7px",
                    position: "relative",
                    left: "unset",
                    top: "unset",
                    height: 0,
                    'line-height': '1em'
                 })
                .bold()
                .remove()
                ,
                newButton("q2_button", "Resume the experiment.")
                .center().print()
                //.after( getText("warning") )
                .wait(
                    getHtml("q2").test.complete()
                        .failure( getText("warning2")
                                    .print() )
                )
        ), clear(), // clear screen
        getVar("nTrial").test.is(v=> v>0 && v<320 && v%40===0) // the break screen appears after every 40 items (but not at the end of the experiment)
        .success(
            newText("remainingTrials", "Number of words left: ")
                .css({height:0, 'line-height':0, 'font-size': 22, 'font-style': 'italic', 'margin-left': '5em'})
                .after(newText()
                          .text( getVar("nRemainingTrials"))
                            .css({'font-size': 22, 'font-style': 'italic'})
                            .after(newText('totTrials', "/320")
                                    .css({'font-size': 22, 'font-style': 'italic'})
                                  )
                        )
            ,
            newHtml("break", "break.html")
                //.cssContainer({"width":"720px"})
                .print("center at 50vw","middle at 50vh")
                .after(getText("remainingTrials"))
            ,
            newKey("J").wait()
            ,
            newVar("breakTime").set(v=>Date.now()).log()
            )
       ,
       clear() // clear screen
       ,
       // Mask, shown on screen for 500ms
       newText("mask", "######")
          .print("center at 50vw","middle at 50vh")
          .log(),
       newTimer("maskTimer", 500),
       getText("mask").remove()
       ,
       // Prime, shown on screen for 42ms
       newText("prime", row.prime)
          .print("center at 50vw","middle at 50vh")
          .log(),
       newTimer("primeTimer", 34),
       getText("prime").remove()
       ,
       // Target, shown on screen until F or J is pressed
       newText("target",row.target)
          .print("center at 50vw","middle at 50vh")
          .log(),
       newKey("answerTarget", "fj").log().wait(),
       getText("target").remove()
    )
.setOption("hideProgressBar", true)
// Logging participant's group
.log("Group", row.group)
// Logging type of prime and target
.log( "Condition", row.condition)
// Logging expected answer
.log("corrAns", row.corrAns)
// Logging if prime is related or not
.log("Prime Type", row.primetype)
// logging prime word
.log("Prime", row.prime)
// logging target word
.log("Target", row.target)
)


newTrial("exit",
    newHtml("exit", "exit.html")
        .print()
        .log()
    ,
    newText("warning_end", "Please fill out all items to finish.")
            .color("red")
            .center()
            .italic()
            //.css('position', 'absolute')
            .bold()
            .hidden()
    ,
    newButton("exit_button", "Finish the experiment.")
            .center()
            .print()
            .wait(
                getHtml("exit").test.complete()
                    .failure( getText("warning_end")
                                .print()
                                .visible()
                            )
                )
).setOption("hideProgressBar", true)

SendResults("send")

//DebugOff() // turn the debugger tool off
