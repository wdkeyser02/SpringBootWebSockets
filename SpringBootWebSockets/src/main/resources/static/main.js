'use strict';
const url = "ws://localhost:8080/spring-boot-tutorial";
const topicUrl = "/topic/messages";
const userUrl = "/topic/users";
const appUsers = "/app/user";
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

document.addEventListener("DOMContentLoaded", function() {
	userName = document.getElementById("username");
	usersList = document.getElementById("userslist");
	buttonConnect = document.getElementById("connect");
	buttonDisConnect = document.getElementById("disconnect");
	conversationDisplay = document.getElementById("conversation");
	online = document.getElementById("online");
	messagesList = document.getElementById("messagesList");
	formInput = document.getElementById("form");
	
	buttonConnect.addEventListener("click", (e) => {
		connect();
		e.preventDefault();
	});
	
	buttonDisConnect.addEventListener("click", (e) => {
		disconnect();
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
    }
    else {
		conversationDisplay.style.display = "none";
    }
    messagesList.innerHTML = "";
    usersList.innerHTML = ""; 
}

function showMessagesList(message) {
	const date = new Date(message.timestamp);
	messagesList.innerHTML += "<tr><td>" + message.user.username + " " + message.action + " " +  date.toLocaleString("nl-BE") + "</td></tr>"; 
}

function showUsers(users) {
	usersList.innerHTML = ""; 
	users.forEach( connectedUser => {
		if(connectedUser.id == user.id) {
			return;
		}
		usersList.innerHTML += "<p>" + connectedUser.username + "</p>"; 
	})
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