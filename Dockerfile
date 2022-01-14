FROM ubuntu:20.04


LABEL maintainer="milton@lajollalabs.com"

RUN apt-get update

RUN apt-get install -y vim

RUN apt-get install -y nginx

RUN apt install -y nodejs && apt install -y npm

RUN apt install -y screen 

RUN apt install -y git

RUN mkdir /root/.ssh

ADD config/install-nvm.sh /root/install-nvm.sh

RUN chmod +x /root/install-nvm.sh

RUN ls /root/.ssh/

RUN eval `ssh-agent -s` && ssh-add /root/.ssh/id_ed25519

RUN ssh-keyscan github.com >> $HOME/.ssh/known_hosts

RUN  npm install -g npm@latest

RUN apt install -y curl

RUN echo "----------------------------------------------------------- "

SHELL ["/bin/bash", "--login", "-i", "-c"]

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

RUN apt update

RUN source ~/.bashrc

ENV NVM_DIR /usr/local/nvm

RUN nvm install node 

RUN npm install forever -g

EXPOSE 80/tcp 443/tcp 1935/tcp 8080 5000/tcp 5000
