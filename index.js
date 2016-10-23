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
  redirect_uri: 'http://damp-eyrie-89155.herokuapp.com/dashboard'
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
  var position = 0;
  for (var i=0;i<counter;i++) {
    if (meetings[i].pw == "request.query.pw") {
      position = i;
      meeting = meetings[i];
      break;
    }
  }

  if (meeting == null) {
    response.send("Invalid Meeting. Click <a href='/'>here</a> to return.");
    response.end();
  }
  response.cookie('pos', position, { maxAge: 900000, httpOnly: true });
  response.cookie('id', request.query.pw , { maxAge: 900000, httpOnly: true });
  response.cookie('person', meeting.curper++ , { maxAge: 900000, httpOnly: true });
  response.writeHead(302, {
  'Location': '/namecal'
  //add other headers here...
  });

});

app.get("/docreate", function(request, response){
  //console.log(request.query.a);
  meetings[counter] = {       //STRUCTURE OF MEETING OBJECTS
    name: request.query.a,    //NAME OF MEETING
    starttime: 0,             //MEETING START TIME
    endtime: 10,              //MEETING ENDING TIME
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
      accessToken: null
    };
    console.log(url)
    response.writeHead(302, {
    'Location': url
    //add other headers here...
    });
    response.end();
}
  else {
    var options = {
      client_id: 'MzA5TxBOuqvvDBCRJgM5N6OML-YGF46N',
      client_secret: 'JZbEGG9V9Lv5_fyTUSkU8thP-NhyS4L-CYFb4nE0sU-Y5144p2rl2TsBVi50B8e_N9KhH5g3k4Hhttn5L-DwlQ',
      grant_type: 'authorization_code',
      code: request.query.code,
      redirect_uri: 'http://damp-eyrie-89155.herokuapp.com/dashboard'
    };
    meetings[request.cookies.pos].

    cronofy.requestAccessToken(options)
      .then(function(response){
        console.log(response);
      });
    response.send("You did it!");

  }


});

app.get("/debug", function(request, response){
  //response.writeHead(200, {'Content-Type': 'text/plain'});
  response.send(request.cookies);

});

app.get("/dashboard", function(request, response){

  response.send(meetings);

  //response.sendFile(__dirname+'/dashboard.html');

});

app.get("/showtimes", function(request, response){

  response.sendFile(__dirname+'/findings.html');

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
