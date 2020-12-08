FROM node:14.4.0

RUN useradd -ms /bin/bash woizipass

# build
USER woizipass
COPY --chown=woizipass:woizipass package.json package-lock.json decorate-angular-cli.js skip-postinstall.js /src/
WORKDIR /src
RUN npm ci --also=dev
COPY --chown=woizipass:woizipass . /src
RUN npm run nx -- build api --prod
RUN npm run nx -- build client --prod

# move dist to /apps
USER root
RUN mv dist/apps /
RUN mv package.json /apps/
RUN mv package-lock.json /apps/
RUN mv skip-postinstall.js /apps/
RUN chown -R woizipass /apps
RUN chgrp -R woizipass /apps

# create /apps/node_modules
USER woizipass
WORKDIR /apps
ENV NODE_ENV=production
RUN npm ci --production

# cleanup
USER root
RUN rm -R /src
RUN mkdir -p /apps/data
RUN chown -R woizipass /apps/data

# run
USER woizipass
WORKDIR /apps
RUN ls
CMD [ "node", "api/main.js" ]
EXPOSE 3333
