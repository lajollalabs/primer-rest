#!/bin/bash


docker run -it -p 8088:80 --name=ppsets --rm -v /docker-dev/primer3-docker/resource/:/resource primerp bash
#docker run -it --name=clin -v /home/azureuser/dockerdev/ion/config:/config -p 8787:8888 -p 8989:8080 -p 411:443 ion bash
