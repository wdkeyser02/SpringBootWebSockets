const url = "ws://localhost:8080/spring-boot-tutorial";
const topic = "/topic/greetings";
const app = "/app/hello";
const client = new StompJs.Client({
    brokerURL: url
});

var buttonConnect;
var buttonDisConnect;
var buttonSend;
var conversation;
var greetings;
var formInput;
var nameInput;

client.onConnect = (frame) => {
    setConnected(true);
    console.log('Connected: ' + frame);
    client.subscribe(topic, (greeting) => {
        showGreeting(JSON.parse(greeting.body).content);
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
	buttonConnect.disabled = connected;
	buttonDisConnect.disabled = !connected;
    if (connected) {
		conversationDisplay.style.display = "block";
    }
    else {
		conversationDisplay.style.display = "none";
    }
    greetings.innerHTML = "";
}

function connect() {
	client.activate();
	console.log('Connected');
}

function disconnect() {
    client.deactivate();
    setConnected(false);
    console.log("Disconnected");
}

function sendName() {
    client.publish({
        destination: app,
        body: JSON.stringify({'name': nameInput.value})
    });
}

function showGreeting(message) {
	greetings.innerHTML += "<tr><td>" + message + "</td></tr>"; 
}

document.addEventListener("DOMContentLoaded", function() {
	buttonConnect = document.getElementById("connect");
	buttonDisConnect = document.getElementById("disconnect");
	buttonSend = document.getElementById("send");
	conversationDisplay = document.getElementById("conversation");
	greetings = document.getElementById("greetings");
	formInput = document.getElementById("form");
	nameInput = document.getElementById("name");
	buttonConnect.addEventListener("click", (e) => {
		connect();
		e.preventDefault();});
	buttonDisConnect.addEventListener("click", (e) => {
		disconnect();
		e.preventDefault();});
	buttonSend.addEventListener("click", (e) => {
		sendName();
		e.preventDefault();});
	formInput.addEventListener("submit", (e) => e.preventDefault());
	setConnected(false);
});
