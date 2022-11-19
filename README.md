# Downpour Chat (WIP)  

## Note  
Switch to main-db branch for the finalized version.  

## About  
NOT COMPLETED YET. End to end encrypted chatting application, privacy-focused. No data ultimately resides on our backend database, temporary data is stored so that users can grab a JSON transcript of their chats at any given time, but all data is flushed/deleted upon session termination. Multiple people can join multiple rooms at any given time. Made with ReactJS, NodeJS, ExpressJS, Socket.IO.  

## Project  
This project was bootstrapped with create-react-app, and uses react-router-dom for routing, react-icons for some pretty icons, react-toastify for error/success prompts, react-scroll-to-bottom for the chat's auto scroll to bottom feature, randomatic for random alphanumeric strings, cors (express middleware) and aes256 for symmetric cryptography (for messages).  

## Run this app  
Fork this repo and clone it into your local machine. Make sure you have npm installed prior to executing these commands.  

cd ./client to go into the client section, which contains the frontend.  
> `npm install` to install the dependancies required  
> `npm start` to start the app  

cd ./server to go into the server section, which contains the backend.  
> `npm install` to install the dependancies required  
> `npm start` to start the server. Would run on localhost:5000.  
