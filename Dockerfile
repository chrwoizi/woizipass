FROM node:14.4.0

RUN useradd -ms /bin/bash woizpass

# build
USER woizpass
COPY --chown=woizpass:woizpass package.json package-lock.json decorate-angular-cli.js skip-postinstall.js /src/
WORKDIR /src
RUN npm ci --also=dev
COPY --chown=woizpass:woizpass . /src
RUN npm run nx -- build api --prod
RUN npm run nx -- build client --prod

# move dist to /apps
USER root
RUN mv dist/apps /
RUN mv package.json /apps/
RUN mv package-lock.json /apps/
RUN mv skip-postinstall.js /apps/
RUN chown -R woizpass /apps
RUN chgrp -R woizpass /apps

# create /apps/node_modules
USER woizpass
WORKDIR /apps
ENV NODE_ENV=production
RUN npm ci --production

# cleanup
USER root
RUN rm -R /src

# run
USER woizpass
WORKDIR /apps
RUN ls
CMD [ "node", "api/main.js" ]
EXPOSE 3333
