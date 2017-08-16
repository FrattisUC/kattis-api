FROM beevelop/nodejs-python:latest
# Create app directory
WORKDIR /app
# Install app dependencies
COPY package.json .
RUN npm install
# Bundle app source
ADD indexV2.js /app
RUN node indexV2
EXPOSE 3389
