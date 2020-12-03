FROM node:14.4.0
COPY package.json package-lock.json /src/
WORKDIR /src
RUN npm ci --also=dev

COPY . /src
RUN npm run nx -- build api --prod
RUN npm run nx -- build client --prod
RUN mv dist/apps /
RUN cp package.json /apps/package.json
RUN cp package-lock.json /apps/package-lock.json
WORKDIR /apps
RUN npm ci --production
RUN rm -R /src

ENV NODE_ENV=production
WORKDIR /apps
RUN ls
CMD [ "node", "api/main.js" ]
EXPOSE 3333
