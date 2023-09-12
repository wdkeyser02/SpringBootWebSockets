package willydekeyser.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.WebAttributes;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@Controller
public class WebController {

	@GetMapping("/")
    public String index() {
        return "index";
    }
	
	@GetMapping("/login")
    public String login() {
        return "login";
    }
	
	@GetMapping("/login-error")
    public String loginerror(HttpServletRequest request, Model model) {
		HttpSession session = request.getSession(false);
		String errorMessage = null;
        if (session != null) {
            AuthenticationException ex = (AuthenticationException) session
                    .getAttribute(WebAttributes.AUTHENTICATION_EXCEPTION);
            if (ex != null) {
                errorMessage = ex.getMessage();
            }
        }
        model.addAttribute("errorMessage", errorMessage);
		return "login";
    }
	
	@GetMapping("/webchat")
    public String webchat(Model model, Authentication authentication) {
		model.addAttribute("username", authentication.getName());
        return "webchat";
    }
}
