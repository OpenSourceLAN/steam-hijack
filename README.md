# steam-hijack
Hijack and rewrite Steam's CDN server lists

If you use a URL Rewrite Script in Squid, you can intercept certain
URLs and pass them elsewhere. We use this to intercept the Steam 
server list request (eg http://some-server/serverlist/20/20 ) and
put our own content server information in it. 

We retain the original Host field so that we can forward any cache
misses on to the original destination. 

I will add an example URL Rewrite Script to this repository "soon". 

Possible goals of this project:
* Sharding the steam content to help distribute size
* Health checking on our steam content servers and auto-OOR
* Cache server lists 
* Override regions to force users to use a local region
* Blacklisting content servers we know to be bad (eg, ix.asn.au )

In the example request URL, `http://103.10.125.136/serverlist/24/10/` , 
the client has requested region 24, and a max of 10 results. So the 
region/caching should be pretty easy. 
