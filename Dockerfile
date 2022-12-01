#Specify the version of nodejs.
FROM node:12.0

#Install required packages in os(It is recommended to write it as a spell)
RUN apt-get update && apt-get install -y \
    #Because non-root users use root privileges
    sudo \
    #Get tools from internet
    wget \
    vim \
    apt-utils \
    p7zip-full

RUN apt-get install -y \
    qpdf

RUN apt-get install -y \
    zip

#Creating an application directory
RUN mkdir /app
#Use app directory as development directory
WORKDIR /app

# package.Install the package described in json.
COPY package.json ./
RUN npm i

#installed node_Copy files such as module to the container side.
#COPY . .

#RUN ls /app/*

CMD ["npm","run", "start"]
