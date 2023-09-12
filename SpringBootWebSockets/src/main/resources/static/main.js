'use strict';
const url = "ws://localhost:8080/spring-boot-tutorial";
const userUrl = "/topic/users";
const topicUrl = "/topic/messages";
const privateTopicUrl = "/topic/privatemessages";
const privatePreUrl = "/user/";
const appUsers = "/app/user";
const appMessages = "/app/message"
const appPrivateMessages = "/app/privatemessage"
const client = new StompJs.Client({
    brokerURL: url
});

class User {
	id;
	serialId;
	username;
	
	constructor(id, serialId, username) {
		this.id = id;
		this.serialId = serialId;
		this.username = username;
	}
};

class Message {
	user;
	receiverId;
	comment;
	action;
	timestamp;
	
	constructor(user, receiverId, comment, action, timestamp) {
		this.user = user;
		this.receiverId = receiverId
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
var membersList;
var membersListSelected;
var messageLabel;
var selectedMember = 0;

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
	messageLabel = document.getElementById("messagelabel");
	buttonConnect.disabled = false;
	userName.textContent = loginUserName;
	
	buttonConnect.addEventListener("click", (e) => {
		connect();
		e.preventDefault();
	});
	
	buttonDisConnect.addEventListener("click", (e) => {
		disconnect();
		e.preventDefault();
	});
	
	send.addEventListener("click", (e) => {
		if(selectedMember == 0) {
			sendMessages();
		} else {
			sendPrivateMessages(selectedMember);
		}
		e.preventDefault();
	});
		
	formInput.addEventListener("submit", (e) => {
		setConnected(false);
		e.preventDefault()
	});
	
	formSendMessage.addEventListener("submit", (e) => {
		e.preventDefault()
	});
});

window.addEventListener("beforeunload" , () => {
	disconnect();
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
	console.log('Send public messages');
	message = new Message(user, null, inputSendMessage.value, 'NEW_MESSAGE', null)
	client.publish({
        destination: appMessages,
        body: JSON.stringify(message)
    });
}

function sendPrivateMessages(receiverId) {
	console.log('Send private message');
	message = new Message(user, receiverId, inputSendMessage.value, 'NEW_PRIVATE_MESSAGE', null)
    client.publish({
        destination: appPrivateMessages,
        body: JSON.stringify(message)
    });
}

client.onConnect = (frame) => {
    setConnected(true);
    console.log('Connected: ' + frame);
    user = new User(uuidv4(), null, loginUserName);
    online.innerHTML = "<p>" + user.username + " you are online!</p>";
    
    client.subscribe(privatePreUrl + user.id + userUrl, (usersList) => {
        showUsers(JSON.parse(usersList.body));
    });
    
    client.subscribe(topicUrl, (message) => {
        showMessagesList(JSON.parse(message.body));
    });
    
    client.subscribe(privatePreUrl + user.id + privateTopicUrl, (message) => {
        showPrivateMessagesList(JSON.parse(message.body));
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
	if(message.action == 'NEW_MESSAGE' || message.action == 'COMMENTED') {
		messagesList.innerHTML += "<tr><td><div><h3>" + message.user.username + "</h3> " + message.action + " " +  date.toLocaleString("nl-BE") +  " - " + message.comment + "</div></td></tr>"; 
	};
	if(message.action == 'JOINED' || message.action == 'LEFT') {
		messagesList.innerHTML += "<tr><td><div>" + message.user.username + " " + message.action + " " +  date.toLocaleString("nl-BE") + "</div></td></tr>"; 
	}
	updateScroll(messageList);
}

function showPrivateMessagesList(message) {
	const date = new Date(message.timestamp);
	messagesList.innerHTML += "<tr><td><div class='private'><h3>" + message.user.username + "</h3> " + message.action + " " +  date.toLocaleString("nl-BE") + " - " + message.comment + "</div></td></tr>"; 
	updateScroll(messageList);
}

function showUsers(users) {
	usersList.innerHTML = "<li class='red' id='memberslistitem0'>All members</li>";
	messageLabel.innerHtml = "Send a public message:";
	users.forEach( connectedUser => {
		usersList.innerHTML += "<li class='black' id='memberslistitem" + connectedUser.serialId + "' >" + connectedUser.username + "</li>"; 
	});
	updateScroll(membersList);
	membersListSelected = document.getElementById('memberslistitem0');
	usersList.addEventListener("click", (e) => {
		membersListSelected.className = 'black';
		membersListSelected  = document.getElementById(e.target.id);
		if(membersListSelected.id == 'memberslistitem0') {
			messageLabel.innerHTML = "Send a public message:";
		} else {
			messageLabel.innerHTML = "Send a private message to: " + membersListSelected.textContent;
		}
		
		membersListSelected.className = 'red';
		selectedMember = membersListSelected.id.charAt(membersListSelected.id.length - 1);
	});
	
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