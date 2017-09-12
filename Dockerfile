FROM beevelop/nodejs-python:latest

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package.json .

# Install packages
RUN npm install
RUN npm install 'request'
RUN pip install pyyaml
RUN pip install plasTeX
#RUN sudo apt-get install python3-dev

# Move app indexV2 to folder app in container
COPY . /app

# Expose
EXPOSE 3389

# Print ip
RUN ip route

# Run node
# CMD npm start
