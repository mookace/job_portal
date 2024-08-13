FROM node:16.14.2
ENV NODE_ENV=production

#working Dir
WORKDIR /app

#copy Package Json File
COPY package*.json ./

#install Files
RUN npm install --production

# copy Source Files
COPY . .


# EXPOSE 8000

CMD ["node","server.js"]