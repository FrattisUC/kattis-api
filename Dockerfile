FROM beevelop/nodejs-python:latest

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package.json .

# Install packages
RUN npm install

# Move app indexV2 to folder app in container
COPY indexV2.js /app/indexV2.js

# Expose
EXPOSE 3389

# Print ip
RUN ip route

# Run node
# CMD npm start
