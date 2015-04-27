FROM centurylink/nginx:1.6.2

MAINTAINER CenturyLink Labs <clt-labs-futuretech@centurylink.com>
EXPOSE 80

ADD nginx.conf /etc/nginx/nginx.conf
ADD /dist /data/dist
