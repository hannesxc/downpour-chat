# Downpour Chat  

## Note  
Switch to main-db branch for the finalized version.  

## About  
End to end encrypted chatting application, privacy-focused. No data ultimately resides on our backend database, temporary data is stored so that users can grab a JSON transcript of their chats at any given time, but all data is flushed/deleted upon session termination. Multiple people can join multiple rooms at any given time and see past messages sent in that room. Made with ReactJS, NodeJS, ExpressJS, Socket.IO and MongoDB.  

## Project  
This project was bootstrapped with create-react-app, and uses react-router-dom for routing, react-icons for some pretty icons, react-toastify for error/success prompts, react-scroll-to-bottom for the chat's auto scroll to bottom feature, randomatic for random alphanumeric strings, cors (express middleware) and aes256 for symmetric cryptography (for messages).  

## Deployment  
Create .env files in base directories of server/ and client/ and punch your own keys inside (cipher, mongodb URI, endpoint). Change the axios request in client/src/components/Chat/Chat.js to reflect your cloud backend server (or localhost:port) and change the proxy in package.json file. I've hosted this project on Render (https://render.com) with their generous free tier package,  check them out!  
> Server resides on `https://downpourchatserver.onrender.com/`  
> Client resides on `https://downpour-chat.onrender.com/`  

## Run this app  
Fork this repo and clone it into your local machine. Make sure you have npm installed prior to executing these commands.  

cd ./client to go into the client section, which contains the frontend.  
> `npm install` to install the dependancies required  
> `npm start` to start the app  

cd ./server to go into the server section, which contains the backend.  
> `npm install` to install the dependancies required  
> `npm start` to start the server. Would run on localhost:5000.  
