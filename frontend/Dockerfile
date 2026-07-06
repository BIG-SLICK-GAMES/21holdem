FROM node:18-alpine AS build

WORKDIR /app

ENV CI=false
ENV GENERATE_SOURCEMAP=false
ENV DISABLE_ESLINT_PLUGIN=true
ENV REACT_APP_API_ENDPOINT=
ENV REACT_APP_SOCKET_URL=

COPY package.json package-lock.json ./
RUN npm ci

COPY public ./public
COPY src ./src
COPY jsconfig.json ./
RUN npm run build

FROM nginx:1.27-alpine

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
