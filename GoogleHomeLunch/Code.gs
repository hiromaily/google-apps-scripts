//recommendation of lunch
function doGet(e) {
    console.log("doGet");

    // call Google Maps API
    var json = callGoogleMapsAPI(1, "");

    if(json.status != 'OK'){
        return requestGoogleHome('failed in calling Google Map API');
    }

    // retrieve one lunch spot randomly
    console.log(json.results.length + ' restauraunts found!'); //20
    var min = 0;
    var max = json.results.length-1;
    var index = Math.floor( Math.random() * (max + 1 - min) ) + min ;
    console.log(json.results[index].name);
    console.log(json.results[index].vicinity);

    //create message
    var text = 'I recommend ';
    text += json.results[index].name;
    text += '. Address is ';
    text += json.results[index].vicinity;
    console.log(text);

    //send place to slack
    sendMessageToSlack(json.results[index]);

    //notify by Google Home
    //return requestGoogleHome(text);
}

function callGoogleMapsAPI(mode, place_id) {
    console.log("callGoogleMapsAPI()");

    var KEY = "your key";
    var MAP_API = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=52.38678969999999,4.638018199999999&radius=1000&types=food&language=en&key=";
    var MAP_API_DETAIL = "https://maps.googleapis.com/maps/api/place/details/json?placeid=";
    var url = "";
    if (mode == 1){
        url = MAP_API + KEY;
    }else{
        url = MAP_API_DETAIL + place_id + "&key=" + KEY;
    }

    var json = UrlFetchApp.fetch(url).getContentText();
    return JSON.parse(json);
}

function sendMessageToSlack(data) {
    console.log("sendMessageToSlack()");

    // get more detail
    var json = callGoogleMapsAPI(2, data.place_id);
    //console.log('debug json:', json);

    //add map link to text
    var text = 'How about this restraunt? \n';
    text += data.name + '\n';
    text += 'Address: ' + data.vicinity + '\n';
    if(json.status == 'OK'){
        text += 'Map: ' + json.result.url;
    }
    // payload
    var payload = {
        'channel' : '#lunch',
        'username' : 'webhookbot',
        'text' : text,
        'icon_emoji' : ':ghost:',
    };
    payload = JSON.stringify(payload);

    // send message to slack
    var url = 'https://hooks.slack.com/services/your_slack_url';
    var urlFetchOption = {
        'method' : 'post',
        'contentType' : 'application/x-www-form-urlencoded',
        'payload' : payload
    };

    return UrlFetchApp.fetch(url, urlFetchOption);
}

function requestGoogleHome(text) {
    console.log("requestGoogleHome()");

    var url = 'https://xxxxx.ngrok.io/google-home-notifier';
    var urlFetchOption = {
        'method' : 'post',
        'contentType' : 'application/x-www-form-urlencoded',
        'payload' : { 'text' : text}
    };

    return UrlFetchApp.fetch(url, urlFetchOption);
}
