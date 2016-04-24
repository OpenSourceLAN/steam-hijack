

var http = require('http'),
    url = require('url'),
    vdf = require('node-vdf');

var upstreamAddress = 'http://103.10.125.136/';
var ourCacheAddresses = [ '10.0.0.19' ];

var serverlistRegex = /\/(\d+)\/(\d+)/;

var server = http.createServer(function(req, res) {
  var requestUrl = url.parse(req.url);
  var path = requestUrl.path;

  var regexResult = serverlistRegex.exec(path);

  if (regexResult) {
    getSteamThing(req,res, regexResult[1], regexResult[2]);

  } else {
    res.writeHead(421); // 'misdirected request' 
    res.end();
  }


});

function getSteamThing(downStreamReq, downStreamRes, region, number) {
  var request =  http.request( `${upstreamAddress}serverlist/${region}/${number}`, function(response) {
    var data = "";
    response.on('data', function(d) { data += d; });
    response.on('end', function() {
      var serverList = vdf.parse(data);
      fixServerList(serverList);
      downStreamRes.writeHead(200);
      downStreamRes.write( vdf.dump(serverList) );
      downStreamRes.end();
    }); 
    response.on('error', function() {
      downStreamRes.writeHead(500);
      downStreamRes.end();
    });
  });

  request.end();
  
}

function fixServerList(serverList) {

   var list = serverList.serverlist;
   var i = 0;
   while (list[i.toString()]) {
     var entry = list[i.toString()];
     entry.host = getServer();
     i++;
   }

}

function getServer() {
  return ourCacheAddresses[ Math.floor(Math.random() * ourCacheAddresses.length) ];
}
server.listen(8000);
