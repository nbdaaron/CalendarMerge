var express = require('express');
var cookieParser = require('cookie-parser');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var app = express();
var meetings = [];
var counter=0;
var cronofy = require('cronofy');

var options = {
  client_id: 'MzA5TxBOuqvvDBCRJgM5N6OML-YGF46N',
  client_secret: 'JZbEGG9V9Lv5_fyTUSkU8thP-NhyS4L-CYFb4nE0sU-Y5144p2rl2TsBVi50B8e_N9KhH5g3k4Hhttn5L-DwlQ',
  grant_type: 'authorization_code',
  redirect_uri: 'http://damp-eyrie-89155.herokuapp.com/link'
};

var oauth2Client = new OAuth2(
  '769575086385-820j29odvj9bqvc6okejaqk0v8l4s9tm.apps.googleusercontent.com',
  'fEKLckkgGp46eJ1_7IoTzSYU',
  'http://damp-eyrie-89155.herokuapp.com/dashboard'
);

/*var url = oauth2Client.generateAuthUrl({
  // 'online' (default) or 'offline' (gets refresh_token)
  access_type: 'offline',

  // If you only need one scope you can pass it as string
  scope: 'https://www.googleapis.com/auth/calendar'
});*/

var url= "https://app.cronofy.com/oauth/authorize?response_type=code&client_id="+options.client_id+"&redirect_uri="+options.redirect_uri+"&scope=read_events";

app.use(cookieParser());
app.use(express.static(__dirname + '/images'));
app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/js'));
app.use(express.static(__dirname + '/fonts'));


var options = {
access_token: 'oSLuzQlFyY8JVAQNMoOE7CWdmcIWG45l',
tzid: "America/New_York",
from: '2016-10-23',
to: '2016-10-31'
};

cronofy.readEvents(options)
.then(function (response) {
    console.log(response);
});



app.get("/", function(request, response){
  response.sendFile(__dirname+'/calverge.html');
});

app.get("/create", function(request, response){

  response.sendFile(__dirname+'/calvergecreategroup.html');

});

app.get("/join", function(request, response){

  response.sendFile(__dirname+'/calvergejoingroup.html');

});

app.get("/return", function(request, response){

  response.sendFile(__dirname+'/calvergeReturningUser.html');

});

app.get("/dojoin", function(request, response){
  var meeting = null;
  var position = -1;
  var personnumber = -1;
  for (var i=0;i<counter;i++) {
    if (meetings[i].pw == request.query.pw) {
      for (var j=0;j<meetings[i].curper;j++) {
        if (meetings[i].people[j].pc == request.query.pc) {
          position = i;
          meeting = meetings[i];
          personnumber = j;
          break;
        }
      }

    }
  }

  if (meeting == null) {
    response.send("Invalid Group/Personal Code. Click <a href='/'>here</a> to return.");
    response.end();
  }
  else {
    response.cookie('pos', position, { maxAge: 900000, httpOnly: true });
    response.cookie('id', request.query.pw , { maxAge: 900000, httpOnly: true });
    response.cookie('person',  personnumber, { maxAge: 900000, httpOnly: true });
    response.writeHead(302, {
    'Location': '/namecal'
    //add other headers here...
  });
  response.end();
  }
});

app.get("/docreate", function(request, response){
  //console.log(request.query.a);
  meetings[counter] = {       //STRUCTURE OF MEETING OBJECTS
    name: request.query.name,    //NAME OF MEETING
    pw: makeid(),             //MAKE RANDOM PASS ID
    curper: 1,
    people: []
  };
  response.cookie('pos', counter, { maxAge: 900000, httpOnly: true });
  response.cookie('id', meetings[counter].pw , { maxAge: 900000, httpOnly: true });
  response.cookie('person', '0', { maxAge: 900000, httpOnly: true });
  counter++;
  response.writeHead(302, {
  'Location': '/namecal'
  //add other headers here...
  });


  response.end();

});

app.get("/namecal", function(request, response){



  response.sendFile(__dirname+'/calvergecreateuser.html');

});

app.get("/link", function(request, response){
  if (request.query.code == "" || request.query.code==null ) {
    meetings[request.cookies.pos].people[request.cookies.person] = {
      name: request.query.name,
      pc: makeid(),
      accessToken: null
    };
    //console.log(request.query.name);
    //console.log(url)
    response.send("<meta http-equiv='refresh' content='3;url="+url+"' />You've successfully joined! You will be asked to link your calendar in a few seconds. ");
    response.end();
}
  else {
    var options = {
      client_id: 'MzA5TxBOuqvvDBCRJgM5N6OML-YGF46N',
      client_secret: 'JZbEGG9V9Lv5_fyTUSkU8thP-NhyS4L-CYFb4nE0sU-Y5144p2rl2TsBVi50B8e_N9KhH5g3k4Hhttn5L-DwlQ',
      grant_type: 'authorization_code',
      code: request.query.code,
      redirect_uri: 'http://damp-eyrie-89155.herokuapp.com/link'
    };


    cronofy.requestAccessToken(options)
      .then(function(response){
        meetings[request.cookies.pos].people[request.cookies.person].accessToken = response;
      });
    response.send("<meta http-equiv='refresh' content='3;url=dashboard' />You've successfully linked your calendar! You will be redirected to your dashboard in a few seconds. ");

  }


});

app.get("/debug", function(request, response){
  //response.writeHead(200, {'Content-Type': 'text/plain'});
  response.send(meetings);

});

app.get("/dashboard", function(request, response){

  var res = "";
  res += "<html><head><title>My Dashboard</title></head><body>"
  res += "<h1>My Dashboard</h1><h3>My group code: " + meetings[request.cookies.pos].pw;
  res += "</h3><h3>My personal code: " + meetings[request.cookies.pos].people[request.cookies.person].pc;
  res+= "</h3><h3>My group members: </h3><ol>";

  for (var i=0;i<meetings[request.cookies.pos].curper;i++) {
    res+=("<li>"+meetings[request.cookies.pos].people[i].name+"</li>");
    var options = {
    access_token: meetings[request.cookies.pos].people[i].accessToken.access_token,
    tzid: "America/New_York",
    from: '2016-10-23',
    to: '2016-10-31'
  };

  cronofy.readEvents(options)
    .then(function (response) {
        for (var counter=0;counter<response.events.length;counter++) {
          console.log(response.events[counter]);
        }
    });
  }
  res+=("</ol><a href='showtimes'>Show Times</a></body></html>");

  response.send(res);
  //response.sendFile(__dirname+'/dashboard.html');

});

app.get("/showtimes", function(request, response){
  var allEvents = [];
  for (var i=0;i<meetings[request.cookies.pos].curper;i++) {
    var options = {
    access_token: meetings[request.cookies.pos].people[i].accessToken.access_token,
    tzid: "America/New_York",
    from: '2016-10-23',
    to: '2016-10-31'
  };

  cronofy.readEvents(options)
    .then(function (response) {
        for (var j=0;j<response.events.length;j++) {
          allEvents[allEvents.length] = response.events[j];
        }
    });
  }
  response.send(allEvents);
  response.end();

});

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
