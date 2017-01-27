#!/usr/bin/perl

# You need to configure your IP address(es) in the two commented spots below

# You also need to add these directives to yoru squid conf file:

#url_rewrite_program /path/to/this/script.pl
## Make sure there's lots of children programs in case your cache gets _really_ busy
#url_rewrite_children 10
## passthrough requests as normal if all redirectors are busy
#url_rewrite_bypass on

# Used with Squid3

$|=1;
$count = 0;
$pid = $$;
while (<>) {

        chomp $_;
        @split = split(' ', $_);
        $url = $split[0];
        @blah = split('/', $split[1]);
        $srcIp = $blah[0];

# This should be the IP address of your cache(s), so that they bypass the redirection
        if ( $srcIp eq "10.0.0.194" )
        {
            print "$_\n";
        }
      else
      {

          if ( $url =~ /\/serverlist\/(\d+)\/(\d+)/ )
          {
# Uncomment these two lines and reload squid to disable redirection
#print "$_\n";
#continue;

# Update this URL to point to where you are running the steam hijack node app
               print "http://10.0.0.194/serverlist/$1/$2\n";
          }
          else
          {
              print "$_\n";
          }

      }
}
