const websocketUrl = "/spring-boot-tutorial"
const topic = "/topic/greetings";
const app = "/app/hello";
var client = null;

function connect() {
	const sock = new SockJS(websocketUrl);
	client = Stomp.over(sock);
	client.connect({}, ()  => {
		setConnected(true);
		client.subscribe(topic, payload => {
			showMessage(JSON.parse(payload.body).content);
  		});
	});
	console.log("Connected");
};

function disconnect() {
	if (client !== null ) {
		client.disconnect();
		setConnected(false);
    	console.log("Disconnected");
	};
}

function showMessage(message) {
    greetings.innerHTML += "<tr><td>" + message + "</td></tr>"; 
}

function sendMessage(){
	let message = nameInput.value;
	client.send(app, {}, JSON.stringify({'name': message}));
};

function setConnected(connected) {
	buttonConnect.disabled = connected;
	buttonDisConnect.disabled = !connected;
	buttonSend.disabled = !connected;
    if (connected) {
		conversationDisplay.style.display = "block";
    }
    else {
		conversationDisplay.style.display = "none";
    }
    greetings.innerHTML = "";
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
		sendMessage();
		e.preventDefault();});
	formInput.addEventListener("submit", (e) => e.preventDefault());
	setConnected(false);
});