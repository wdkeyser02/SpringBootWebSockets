'use strict';
const url = "ws://localhost:8080/spring-boot-tutorial";
const topicUrl = "/topic/messages";
const userUrl = "/topic/users";
const appUsers = "/app/user";
const appMessages = "/app/message"
const client = new StompJs.Client({
    brokerURL: url
});

class User {
	id;
	username;
	
	constructor(id, username) {
		this.id = id;
		this.username = username;
	}
};

class Message {
	user;
	comment;
	action;
	timestamp;
	
	constructor(user, comment, action, timestamp) {
		this.user = user;
		this.comment = comment;
		this.action = action;
		this.timestamp = timestamp;
	}
};

var user;
var message;
var userName;
var buttonConnect;
var buttonDisConnect;
var conversation;
var formInput;
var conversationDisplay;
var usersList;
var messagesList;
var online;
var sendMessage;
var send;
var formSendMessage;
var inputSendMessage;
var messageList;
var membersList

document.addEventListener("DOMContentLoaded", function() {
	userName = document.getElementById("username");
	usersList = document.getElementById("userslist");
	buttonConnect = document.getElementById("connect");
	buttonDisConnect = document.getElementById("disconnect");
	conversationDisplay = document.getElementById("conversation");
	online = document.getElementById("online");
	messagesList = document.getElementById("messagesList");
	formInput = document.getElementById("form");
	sendMessage = document.getElementById("sendmessage");
	send = document.getElementById("send");
	formSendMessage = document.getElementById("formsendmessage");
	inputSendMessage = document.getElementById("inputsendmessage");
	messageList = document.getElementById("messagelist");
	membersList = document.getElementById("memberslist");
	
	buttonConnect.addEventListener("click", (e) => {
		connect();
		e.preventDefault();
	});
	
	buttonDisConnect.addEventListener("click", (e) => {
		disconnect();
		e.preventDefault();
	});
	
	send.addEventListener("click", (e) => {
		sendMessages();
		e.preventDefault();
	});
	
	userName.addEventListener("keyup", () => {
		const userNameValue = userName.value;
		if(!userNameValue.length == 0 && hasOnlyLettersAndNumbers(userNameValue)) {
			buttonConnect.disabled = false;
		} else {
			buttonConnect.disabled = true;
		}
	});
	
	formInput.addEventListener("submit", (e) => {
		setConnected(false);
		e.preventDefault()
	});
	
	formSendMessage .addEventListener("submit", (e) => {
		e.preventDefault()
	});
});

window.addEventListener("beforeunload" , (e) => {
	disconnect();
	console.log("Browser closed " + e);
});

function connect() {
	client.activate();
	buttonConnect.disabled = true;
	userName.disabled = true;
	console.log('Connected');
}

function disconnect() {
    client.deactivate();
    buttonConnect.disabled = false;
    userName.disabled = false;
    setConnected(false);
    online.innerHTML = "";
    console.log('Disconnected');
}

function sendMessages() {
	console.log('Send message');
	message = new Message(user, inputSendMessage.value, 'NEW_MESSAGE', null)
	client.publish({
        destination: appMessages,
        body: JSON.stringify(message)
    });
}

client.onConnect = (frame) => {
    setConnected(true);
    console.log('Connected: ' + frame);
    user = new User(uuidv4(), userName.value);
    online.innerHTML = "<p>" + user.username + " you are online!</p>";
    
    client.subscribe(topicUrl, (message) => {
        showMessagesList(JSON.parse(message.body));
    });
    
    client.subscribe(userUrl, (usersList) => {
        showUsers(JSON.parse(usersList.body));
    });
        
    client.publish({
        destination: appUsers,
        body: JSON.stringify(user)
    });
};

client.onWebSocketError = (error) => {
    console.error('Error with websocket', error);
};

client.onStompError = (frame) => {
    console.error('Broker reported error: ' + frame.headers['message']);
    console.error('Additional details: ' + frame.body);
};

function setConnected(connected) {
	buttonDisConnect.disabled = !connected;
    if (connected) {
		conversationDisplay.style.display = "block";
		sendMessage.style.display = "block";
		sendMessage.style.visibility = "visible"; 
    }
    else {
		conversationDisplay.style.display = "none";
		sendMessage.style.display = "none";
		sendMessage.style.visibility = "hidden"; 
    }
    messagesList.innerHTML = "";
    usersList.innerHTML = ""; 
}

function showMessagesList(message) {
	const date = new Date(message.timestamp);
	console.log(message.action)
	if(message.action == 'NEW_MESSAGE' || message.action == 'COMMENTED') {
		messagesList.innerHTML += "<tr><td><h3>" + message.user.username + "</h3> " + message.action + " " +  date.toLocaleString("nl-BE") +  " - " + message.comment + "</td></tr>"; 
	};
	if(message.action == 'JOINED' || message.action == 'LEFT') {
		messagesList.innerHTML += "<tr><td><h3>" + message.user.username + "</h3> " + message.action + " " +  date.toLocaleString("nl-BE") + "</td></tr>"; 
	}
	updateScroll(messageList);
}

function showUsers(users) {
	usersList.innerHTML = ""; 
	users.forEach( connectedUser => {
		if(connectedUser.id == user.id) {
			return;
		}
		usersList.innerHTML += "<p>" + connectedUser.username + "</p>"; 
	});
	updateScroll(membersList);
}

function hasOnlyLettersAndNumbers(string) {
	const regex = /^[a-zA-Z0-9 ]+$/
	return regex.test(string)
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    .replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, 
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function updateScroll(element) {
	element.scrollTop = element.scrollHeight;
}