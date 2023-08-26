const client = new StompJs.Client({
    brokerURL: 'ws://localhost:8080/spring-boot-tutorial'
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
    client.subscribe('/topic/greetings', (greeting) => {
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
	buttonDisConnect.disabled = connected; 
    if (connected) {
		conversationDisplay = "block";
    }
    else {
		conversationDisplay = "none";
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
        destination: "/app/hello",
        body: JSON.stringify({'name': nameInput.value})
    });
}

function showGreeting(message) {
	greetings.innerHTML += "<tr><td>" + message + "</td></tr>"; 
}

document.addEventListener("DOMContentLoaded", function() {
	console.log('DOMContentLoaded');
	buttonConnect = document.getElementById("connect");
	buttonDisConnect = document.getElementById("disconnect");
	buttonSend = document.getElementById("send");
	conversationDisplay = document.getElementById("conversation").style.display;
	conversationDisplay = "none";
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
});
