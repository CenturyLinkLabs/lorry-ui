#!/bin/bash
ssh root@8.22.8.236 "docker rm -f lorry_ui; docker rmi -f centurylink/lorry-ui:qa; docker pull centurylink/lorry-ui:qa; docker run -d --name lorry_ui -p 8080:80 centurylink/lorry-ui:qa"
