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
from: '2016-10-31',
to: '2016-11-07'
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
          position = i;
          meeting = meetings[i];
          personnumber = meetings[i].curper++;
          break;

    }
  }

  if (meeting == null) {
    response.send("Invalid Group Code. Click <a href='/'>here</a> to return.");
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

app.get("/dorejoin", function(request, response){
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
    'Location': '/dashboard'
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
res += '<html xmlns="http://www.w3.org/1999/xhtml"><head><style>div#push{padding-top:40px;}</style><link href="bootstrap.css" rel="stylesheet" >';
res += '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><meta http-equiv="Content-Type" content="text/html; charset=utf-8" />';
res += '<title>Dashboard</title></head><body><div id="push"></div><div align="center"> <a href="" > <img src= "calvergelogo.png" > </img> </a> </div>';
res += '<div class= "container"><h1 align="center">Dashboard</h1>'
  res += "<h3>My group code: " + meetings[request.cookies.pos].pw;
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
  res+=("</ol><a class='button' href='showtimes'>Show Times when we can meet</a></body></html>");

  response.send(res);
  //response.sendFile(__dirname+'/dashboard.html');

});

app.get("/showtimes", function(request, response){
  var allEvents = [];
  allEvents[0] = 1;
  allEvents[1] = 3;
  var oc=0;
  for (var i=0;i<meetings[request.cookies.pos].curper;i++) {
    var options = {
    access_token: meetings[request.cookies.pos].people[i].accessToken.access_token,
    tzid: "America/New_York",
    from: '2016-10-31',
    to: '2016-11-07'
  };

  cronofy.readEvents(options)
    .then(function (response2) {
        for (var counter=0;counter<response2.events.length;counter++) {
          allEvents[2] = 5;
          allEvents[oc]= {
            start:new Date(response2.events[counter].start),
            end: new Date(response2.events[counter].end)
          };
          oc++;
          console.log(response2.events[counter].start);
          console.log(response2.events[counter].end);
        }

    }).then(function() {
      if (i == meetings[request.cookies.pos].curper) {

        allEvents.sort(function(a, b){ //sort dates
    var keyA = new Date(a.start),
        keyB = new Date(b.start);
    // Compare the 2 dates
    if(keyA < keyB) return -1;
    if(keyA > keyB) return 1;
    return 0;
});

  console.log("Dates sorted");

    var meetingTimes = [];
    var curmin = new Date('2016-10-23');
    var datecounter= 0;
    var eventscounter = 0;
    while (curmin < new Date('2016-10-31')) {
        var max = curmin.valueOf();
        while (max < allEvents[eventscounter].start && max < new Date('2016-11-07') && (max.valueOf()-curmin.valueOf() <= 1000*60*90)) {
          max = new Date(max.valueOf() + 300000);
        }
        if (max.valueOf() - curmin.valueOf() >= 1000*60*60) {
                  console.log("Match " + (datecounter+1));
          meetingTimes[datecounter++] = {
            from: curmin,
            to: max,
            time: max.valueOf() - curmin.valueOf() //Time in millis
          };
        }
        if (eventscounter+1 != allEvents.length)
          curmin = allEvents[eventscounter++].end;
    }
    console.log("Exiting loop");

      var res = '<html xmlns="http://www.w3.org/1999/xhtml"> <head> <script type="text/javascript" src="https://addevent.com/libs/atc/1.6.1/atc.min.js" async defer></script>     <style>      div#push{padding-top:40px; } select#size{      	width:10%;      	display:inline-block;      	}      div#pad{      	padding:3px 3px      	}            </style>      <link href="bootstrap.css" rel="stylesheet" >      <link href="http://addtocalendar.com/atc/1.5/atc-style-blue.css" rel="stylesheet" type="text/css">      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />      <title>findings</title>      </head>      <body>            <script type="text/javascript">(function () { if (window.addtocalendar)if(typeof window.addtocalendar.start == "function")return;      if (window.ifaddtocalendar == undefined) { window.ifaddtocalendar = 1;';
      res += "var d = document, s = d.createElement('script'), g = 'getElementsByTagName';      s.type = 'text/javascript';s.charset = 'UTF-8';s.async = true;      s.src = ('https:' == window.location.protocol ? 'https' : 'http')+'://addtocalendar.com/atc/1.5/atc.min.js';      var h = d[g]('body')[0];h.appendChild(s); }})();</script>";
      res += '<div id="push"></div>      <div align="center"> <a href="/" > <img src= "calvergelogo.png" > </img> </a> </div>      <div class= "container">         <p>Here are the most possible times that you can meet based off our findings. To confirm one, please click the link that works best for you</p>         <ul id="possible times">';
      for (var counter=0;counter<meetingTimes.length;counter++) {
        //res += '<li>'+meetingTimes[counter].from.toLocaleString()+' to ' + meetingTimes[counter].to.toLocaleString() + '</li>';
        res += '<li> <div id= "pad">'+ meetingTimes[counter].from.toLocaleString()+' to ' + meetingTimes[counter].to.toLocaleString() +'<!--<span class="addtocalendar atc-style-blue">          <var class="atc_event">              <var class="atc_date_start">'+format(meetingTimes[counter].from.toLocaleString()).trim()+'</var>              <var class="atc_date_end"> '+format(meetingTimes[counter].to.toLocaleString()).trim()+' </var>              <var class="atc_timezone">'+"America/New_York"+'</var> <var class="atc_title">' + meetings[request.cookies.pos].name.trim() + 'k</var>  <var class="atc_description"></var><var class="atc_location"> </var>       </var>             </span>     -->        ';
        res += '<div title="Add to Calendar" class="addeventatc">    Add to Calendar    <span class="start">'+meetingTimes[counter].from.toLocaleString()+'</span>   <span class="end">'+meetingTimes[counter].to.toLocaleString()+'</span>    <span class="timezone">America/New_York</span>    <span class="title">'+meetings[request.cookies.pos].name+'</span>    <span class="description"></span>    <span class="location"></span>    <span class="date_format">MM/DD/YYYY</span>    <span class="client">arkfGXjTIzcwufAKGmIs22567</span></div> </div>              </li>';
            }
            res += '</ul>         </div>         </body>         </html>';
      //res += '</ul></div></body></html>';
      console.log("Sending page");
      response.send(res);
      response.end();
    }
    else {
      console.log(i);
      console.log(meetings[request.cookies.pos].curper);
    }
    });

  }


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

function format(d) {
  return d.substring(6, 10)+"-"+d.substring(0,2)+"-"+d.substring(3, 5)+" "+d.substring(11, d.length-2);
}
