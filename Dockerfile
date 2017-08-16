FROM beevelop/nodejs-python:latest
# Create app directory
WORKDIR /app
# Install app dependencies
COPY package.json .
RUN npm install
# Bundle app source
ADD . /app
EXPOSE 3389
