# steam-hijack
Hijack and rewrite Steam's CDN server lists

This script can be used to make Steam use your own HTTP server to
download content. See details further down for more information.

# Config

```
{
	"UpstreamServers": ["103.10.125.136"],
	"LocalCacheServers": ["10.0.0.194:80"]
}
```

`UpstreamServers` is a list of Steam content servers to use as an
upstream serverlist provider. To get a list of current ones, on a
PC with steam installed open `%SteamInstallDirectory%\logs\config.vdf`
and find the `CS` list. Take the IP addresses and visit in web browser:
`http://<ip-address>/serverlist/51/20/` and ensure that it returns content.

`LocalCacheServers` is a list of hostnames of your local Steam caches.

# Squid Configuration

Squid Proxy server can do URL rewrites. We use Squid proxy in transparent mode to intercept any
serverlist requests and redirect them to this application for modification.

Place the `squid_url_rewrite.pl` script somewhere on your squid transparent proxy
(eg, `/usr/local/bin/`).
Edit `/etc/squid3/squid.conf` and add the following lines:

```
url_rewrite_program /usr/local/bin/squid_url_rewrite.pl
url_rewrite_children 10
url_rewrite_bypass on
```

Edit the `squid_url_rewrite.pl` file - you need to adjust the `$serverlist_ip_address`
value at the top of the file to match the IP address of the server where this
nodeJs script is running.

Restart the squid3 service and visit `http://103.10.125.136/serverlist/20/20/` and you
should see a server list with your own cache server listed in every entry.

# Notes

The two numbers in a content server list URL are the region ID and max number of
servers to return. eg, `http://103.10.125.136/serverlist/51/20/`, it is region ID
51 and the client is asking for at most 20 servers.

We retain the original Host field so that we can forward any cache
misses on to the original destination - steam will make a HTTP request
to the server listed in the Host field, and that request will have a
`Host:` header with the value listed in the `vhost` field of the serverlist.


Possible ideas for further development of this project:
* Sharding the steam content to help distribute size
* Health checking on our steam content servers and auto-OOR
* Caching the cache server lists
* Override regions to force users to use a local region
* Blacklisting content servers we know to be bad (eg, ix.asn.au )
