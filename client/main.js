$(function() {
  $("#create-user").click(function(e) {
    e.preventDefault();
    $("#create-form").toggle();
    $("#login").hide();
  });
  if (!localStorage.getItem("access_token")) {
    console.log("login form");
    $("#login-form").toggle();
  } else {
    console.log("login journal");
    $("#journal").toggle();
  }
  $("#login").on("submit", function(e) {
    e.preventDefault();
    var email = $(this).find("input[name='email']").val();
    var pw = $(this).find("input[name='password']").val();
    login(email, pw);
  });
  $("#create").on("submit", function(e) {
    e.preventDefault();
    var email = $(this).find("input[name='email']").val();
    var pw = $(this).find("input[name='password']").val();
    create(email, pw);
  });

  function create(email, password) {
    var url = "/api/Users";
    $.ajax({
      type: "POST",
      url: url,
      data: JSON.stringify({ email: email, password: password }),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function(data) {
        login(email, password);
      },
      error: function(data) {
        alert("couldn't create");
      }
    });
  }
  function login(email, password) {
    var url = "/api/Users/login";
    $.ajax({
      type: "POST",
      url: url,
      data: JSON.stringify({ email: email, password: password }),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function(data) {
        var user_id = data.userId;
        var access_token = data.id;
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("user_id", user_id);
        location.reload();
      }
    });
  }
  // fill in the values with today
  var access_token = localStorage.getItem("access_token");
  var user_id = localStorage.getItem("user_id");
  getToday(user_id, access_token);
  function getToday(user_id, access_token) {
    var date = new Date();
    var day = date.getDate();
    var month = 1 + date.getMonth();
    if (month < 10) {
      month = `0${month}`;
    }
    var year = 1900 + date.getYear();
    var dayString = `${year}-${month}-${day}`;
    var payload = {
      userId: user_id,
      date: dayString
    };
    var url =
      "/api/JournalEntries?filter=" +
      JSON.stringify(payload) +
      "&access_token=" +
      access_token;
    $.ajax({
      type: "GET",
      url: url,
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function(data) {
        if (data.length != 1) {
          return newEntry(dayString, user_id, access_token);
        }
        var entry = data[0];
        refreshInputs(entry);
      },
      error: function(data) {}
    });
  }
  function refreshInputs(object) {
    $("#data-id").val(object.id);
    $("#workout").val(object.workout);
    $("#meditation").val(object.meditation);
    $("input[type='date']").val(object.date);
    object.meals.forEach(function(meal, i) {
      refreshMeal(i, meal);
    });
  }
  function refreshMeal(index, meal) {
    var node = $("#meals").children()[index];
    var mealType = $(node).find(`input[name='food${index}']`);
    if (mealType.is(":checked") === false) {
      mealType.filter(`[value=${meal.type}]`).prop("checked", true);
    }
    var timeNode = $(node).find(`input[name='timemaster${index}']`);
    if (timeNode.is(":checked") === false) {
      timeNode.filter(`[value=${meal.time.master}]`).prop("checked", true);
    }
    var timeValueNode = $(node).find(`input[name='time${index}']`);
    timeValueNode.val(meal.time.value);
    var mealTypeNode = $(node).find(`input[name='typemaster${index}']`);
    if (mealTypeNode.is(":checked") === false) {
      mealTypeNode
        .filter(`[value=${meal.mastertype.master}]`)
        .prop("checked", true);
    }
    var timeValueNode = $(node).find(`input[name='type${index}']`);
    timeValueNode.val(meal.mastertype.value);
    var calorieTypeNode = $(node).find(`input[name='caloriesmaster${index}']`);
    if (calorieTypeNode.is(":checked") === false) {
      calorieTypeNode
        .filter(`[value=${meal.calories.master}]`)
        .prop("checked", true);
    }
    var calorieValueNode = $(node).find(`input[name='calories${index}']`);
    calorieValueNode.val(meal.calories.value);
  }
  $("#refresh").click(
    $.debounce(250, function(e) {
      var payload = {
        id: $("#data-id").val(),
        meditation: $("#meditation").val(),
        workout: $("#workout").val()
      };
    })
  );

  function newEntry(date, user_id, access_token) {
    var meals = [];
    var meal = {
      type: "snack",
      time: {
        value: 9,
        master: false
      },
      calories: {
        value: 0,
        master: false
      },
      mastertype: {
        value: "",
        master: false
      }
    };
    for (var i = 0; i < 6; i++) {
      meals.push(JSON.parse(JSON.stringify(meal)));
      meal.time.value = meal.time.value + 2;
    }

    var payload = {
      date,
      user: user_id,
      meals: meals
    };
    var url = "/api/JournalEntries?access_token=" + access_token;
    $.ajax({
      type: "POST",
      url: url,
      data: JSON.stringify(payload),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function(data) {
        refreshInputs(data);
      },
      error: function(data) {}
    });
  }
});
