FROM ubuntu:latest

# invalidate the docker cache to restart deployment from here every time
ADD https://www.google.com /time.now

RUN apt-get update
RUN apt-get -y dist-upgrade
RUN apt-get update
RUN apt-get -y upgrade
RUN apt-get -y install unattended-upgrades

RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install -y nodejs

RUN useradd -ms /bin/bash woizipass

# move dist to /apps
COPY --chown=woizipass:woizipass ./dist/apps/ /apps/
COPY --chown=woizipass:woizipass ./package.json /apps/
COPY --chown=woizipass:woizipass ./package-lock.json /apps/
COPY --chown=woizipass:woizipass ./skip-postinstall.js /apps/

# create /apps/node_modules
USER woizipass
WORKDIR /apps
ENV NODE_ENV=production
RUN npm ci --production

# cleanup
USER root
RUN mkdir -p /apps/data
RUN chown -R woizipass /apps/data

# run
USER woizipass
WORKDIR /apps
RUN ls
CMD [ "node", "api/main.js" ]
EXPOSE 3333
