const tweakHtml = `
    <h2 style="margin-top: 10px;">Due Date Defaults</h2> 
    <br> 
    <h3>Assignment Defaults</h3> 
    <form> 
    <h4>Due Date Defaults</h4> 
    <label class="ic-Label">Hour</label> 
    <input id="due_hour" name="hour" style="width:50px" type="text" aria-required="true"> 
    :<input id="due_minute" name="minute" style="width:50px" type="text" aria-required="true"> 
    <select id="due_am_pm" style="width:75px"> 
    <option>am</option><option>pm</option></select> 
    </form> 
    <button id="tweaks_due_button" class="btn btn-primary">Update Default Due Date</button> 
    <span id="due_tweak_error" style="padding-left:10px; color:red; display:none">Please enter a time.</span> 
    <br>
    <form> `;


/*
 Creates Due Date Default Tab under course settings which adds a settings panel to control the following features:
 - Due date defaults
 */
onPage(/\/courses\/\d+\/settings$/, function () {
    const courseId = location.pathname.match(/\d+/)[0];
    const userId = ENV.current_user_id;
    let userData;
    let courseData;
    $.getJSON('/api/v1/users/' + userId + '/custom_data?ns=due.date.defaults', function (data) {
        userData = data;
    })
        .complete(function () {
            console.log(userData);
            const tabs = $('#course_details_tabs');
            tabs.tabs('add', '#tab-tweaks', 'Due Date Defaults');
            $('#tab-tweaks')
                .html(tweakHtml);
            $('#tweaks_due_button')
                .click(function () {
                    if (userData.data[courseId] === undefined) {
                        userData.data[courseId] = {};
                    }
                    hour = hourLoc.val();
                    min = minLoc.val();
                    am_pm = am_pmLoc.val();
                    if (hour && min && am_pm) {
                        userData.data[courseId]['due_hour'] = hour;
                        userData.data[courseId]['due_min'] = min;
                        userData.data[courseId]['am_pm'] = am_pm;
                        $.put('/api/v1/users/' + userId + '/custom_data', userData.data);
                        $('#due_tweak_error')
                            .css('color', 'green')
                            .html('Success!')
                            .show();
                    } else {
                        $('#due_tweak_error')
                            .css('color', 'red')
                            .html('Please enter a time.')
                            .show();
                    }
                });
            if (userData !== undefined) {
                courseData = userData.data[courseId];
            } else {
                userData = {
                    data: {}
                }
            }
            const hourLoc = $('#due_hour');
            const minLoc = $('#due_minute');
            const am_pmLoc = $('#due_am_pm');
            let hour;
            let min;
            let am_pm;
            if (courseData !== undefined) {
                hour = courseData.due_hour;
                min = courseData.due_min;
                am_pm = courseData.am_pm;
                hourLoc.val(hour);
                minLoc.val(min);
                am_pmLoc.val(am_pm);
            }
        });
});

/*
 Due date default implementation, pre fills due date time field with user's custom values
 */
onElementRendered('#bordered-wrapper > div > div > div > div > div > div > div.input-append > button.ui-datepicker-trigger', datePopout);


function datePopout(el) {
  var courseId = location.pathname.match(/\d+/)[0];
  var userId = ENV.current_user_id;
  var userData;
  $.getJSON('/api/v1/users/' + userId + '/custom_data?ns=due.date.defaults', function(data) {
    userData = data;
    var courseData = userData.data[courseId];
    el.click(function() {
      $('#ui-datepicker-time-hour')
        .val(courseData.due_hour);
      $('#ui-datepicker-div > div.ui-datepicker-time.ui-corner-bottom > input.ui-datepicker-time-minute')
        .val(courseData.due_min);
      $('#ui-datepicker-div > div.ui-datepicker-time.ui-corner-bottom > select')
        .val(courseData.am_pm);
    });
    $('#add_due_date')
      .click(function() {
        setTimeout(function() {
          onElementRendered('#bordered-wrapper > div > div:nth-child(2) > div:nth-child(1) > div > div > div > div.input-append > button', datePopout);
        }, 250);
      });
  });
}

/* HELPER FUNCTIONS */

/*
 Waits for 30 seconds to see if an element is rendered
 */
function onElementRendered(selector, cb, _attempts) {
    const el = $(selector);
    _attempts = ++_attempts || 1;
    if (el.length) return cb(el);
    if (_attempts === 120) return;
    setTimeout(function () {
        onElementRendered(selector, cb, _attempts);
    }, 250);
}

/*
 Limits functions to only run on pages that match the provided regex
 */
function onPage(regex, fn) {
    if (location.pathname.match(regex)) fn();
}

$.put = function (url, data) {
    return $.ajax({
        url: url,
        type: "PUT",
        dataType: 'json',
        data: {
            ns: 'due.date.defaults',
            data: data
        }
    });
};

