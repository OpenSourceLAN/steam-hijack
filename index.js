

var http = require('http'),
    url = require('url'),
    vdf = require('vdf'), // this package is instaleld with `npm install node-vdf', but gets installed in node-modules as 'vdf'. Go figure.
    config = require('./config.json');

if (!config) throw "config.json not found or empty";

var upstreamAddresses = config.UpstreamServers || [];
var ourCacheAddresses = config.LocalCacheServers || [];

if (upstreamAddresses.length == 0) throw "No upstream servers configured";
if (ourCacheAddresses.length == 0) throw "No cache servers configured";

// matches something like `/20/30` - as seen in the request for the serverlist:
// /serverlist/51/20
var serverlistRegex = /\/(\d+)\/(\d+)/;

// This server will take any incoming HTTP request, match the request
// again a regex and reply with
var server = http.createServer(function(req, res) {
  var requestUrl = url.parse(req.url);
  var path = requestUrl.path;

  var regexResult = serverlistRegex.exec(path);

  if (regexResult) {
    var region = parseInt(regexResult[1],10);
    var number = parseInt(regexResult[2],10);
    if (!region || !number || region <= 0 || number <= 0) throw `bad region or number - ${region} ${number}`
    getSteamThing(req,res, region, number);
  } else {
    res.writeHead(421); // 'misdirected request'
    res.end();
  }
});


/*
 * Fetches upstream steam content server list
 */
function getSteamContentList(region, number) {
  return new Promise(function(resolve,reject) {
    var url = getServerListUrl(region,number);
    console.log(`Requesting upstream: ${url}`);
  var request =  http.request(url, function(response) {
    var data = "";
    response.on('data', function(d) { data += d; });
    response.on('end', function() {
      resolve(data);
    });
    response.on('error', function(e) {
      reject(e);
    });
  });
  request.end(); 
  })
}

/*
 * Makes a request to the steam content servers for the server list,
 *
 *
 */
function getSteamThing(downStreamReq, downStreamRes, region, number) {
 
  getSteamContentList(region, number)
  .then(function(originalServerList) {
      var serverList = vdf.parse(originalServerList);
      fixServerList(serverList);
      downStreamRes.writeHead(200);
      downStreamRes.write( vdf.dump(serverList) );
      downStreamRes.end();
  })
  .catch(function(e) {
      console.log(e);
      downStreamRes.writeHead(500);
      downStreamRes.end();
  });

 
}

function fixServerList(serverList) {
   var list = serverList.serverlist;
   var i = 0;
   while (list[i.toString()]) {
     var entry = list[i.toString()];
     entry.Host = getRandomCacheServer();
     i++;
   }

}

function getRandomCacheServer() {
  return ourCacheAddresses[ Math.floor(Math.random() * ourCacheAddresses.length) ];
}

function getRandomContentServer() {
  return upstreamAddresses[Math.floor(Math.random() * upstreamAddresses.length)];
}

function getServerListUrl(region,number) {
  return `http://${getRandomContentServer()}/serverlist/${region}/${number}/`;
}

server.listen(8000);
