package willydekeyser.controller;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import willydekeyser.model.Action;
import willydekeyser.model.Message;
import willydekeyser.model.User;
import willydekeyser.service.MemberStore;

@Controller
public class ChatController {

	private final MemberStore memberStore;
	private final SimpMessagingTemplate simpMessagingTemplate;
	
	public ChatController(MemberStore memberStore, SimpMessagingTemplate simpMessagingTemplate) {
		this.memberStore = memberStore;
		this.simpMessagingTemplate = simpMessagingTemplate;
	}
	
	@MessageMapping("/user")
	public void getusers(User user, SimpMessageHeaderAccessor headerAccessor) throws Exception {
		User newUser = new User(user.id(), null, user.username());
		headerAccessor.getSessionAttributes().put("user", newUser);
		memberStore.addMember(newUser);
		sendMembersList();
		Message newMessage = new Message(new User(null, null, user.username()), null, null, Action.JOINED, Instant.now());
        simpMessagingTemplate.convertAndSend("/topic/messages", newMessage);

	}
		
	@EventListener
	public void handleSessionConnectEvent(SessionConnectEvent event) {
		System.out.println("Session Connect Event");
	}
	
	@EventListener
	public void handleSessionDisconnectEvent(SessionDisconnectEvent event) {
		System.out.println("Session Disconnect Event");
		StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();
        if (sessionAttributes == null) {
            return;
        }
        User user = (User) sessionAttributes.get("user");
        if (user == null) {
            return;
        }	
        memberStore.removeMember(user);
        sendMembersList();
        
        Message message = new Message(new User(null, null, user.username()), null, "", Action.LEFT, Instant.now());
        simpMessagingTemplate.convertAndSend("/topic/messages", message);
 
	}
	
	@MessageMapping("/message")
	public void getMessage(Message message) throws Exception {
		Message newMessage = new Message(new User(null, message.user().serialId(), message.user().username()), message.receiverId(), message.comment(), message.action(), Instant.now());
        simpMessagingTemplate.convertAndSend("/topic/messages", newMessage);
	}
	
	@MessageMapping("/privatemessage")
	public void getPrivateMessage(Message message) throws Exception {
		Message newMessage = new Message(new User(null, message.user().serialId(), message.user().username()), message.receiverId(), message.comment(), message.action(), Instant.now());
        simpMessagingTemplate.convertAndSendToUser(memberStore.getMember(message.receiverId()).id(), "/topic/privatemessages", newMessage);

	}

	private void sendMembersList() {
		List<User> memberList = memberStore.getMembersList();
		memberList.forEach(
				sendUser -> simpMessagingTemplate.convertAndSendToUser(sendUser.id(), "/topic/users", memberStore.filterMemberListByUser(memberList, sendUser)));
	}
}
