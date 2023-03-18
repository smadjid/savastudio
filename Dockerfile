# Stage1: UI Build
FROM node:14-slim AS studio-build
WORKDIR /usr/src
COPY ui/ ./ui/
RUN cd ui && npm install && npm build

# Stage2: API Build
FROM node:14-slim AS server-build
WORKDIR /usr/src
COPY api/ ./api/
RUN cd api && npm install && ENVIRONMENT=development npm build
RUN ls

# Stage3: Packagign the app
FROM node:14-slim
WORKDIR /root/
COPY --from=studio-build /usr/src/ui/build ./ui/build
COPY --from=server-build /usr/src/api/dist .
RUN ls

EXPOSE 80

CMD ["node", "api.bundle.js"]