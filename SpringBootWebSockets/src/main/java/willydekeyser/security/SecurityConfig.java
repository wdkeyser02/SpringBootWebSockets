package willydekeyser.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

	@Bean
	SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		
		http
		.authorizeHttpRequests(authConfig -> {
			authConfig.requestMatchers("/", "/login", "/login-error", "/main.js","/main.css", "/loginstyle.css").permitAll();
			authConfig.anyRequest().authenticated();
		})
		.sessionManagement(session -> session
				.maximumSessions(1)
				.maxSessionsPreventsLogin(true)
				.expiredUrl("/login?expired"))
		.formLogin(login -> login
				.loginPage("/login")
				.failureUrl("/login-error"))
		.logout(logout -> logout
				.logoutSuccessUrl("/")
				.clearAuthentication(true)
				.deleteCookies("JSESSIONID"));
	return http.build();
	}
		
	@Bean
	UserDetailsService userDetailsService() {
		var user1 = User.builder()
				.username("Willy De Keyser")
				.password("{noop}password")
				.roles("USER")
				.build();
		var user2 = User.builder()
				.username("Bill")
				.password("{noop}password")
				.roles("USER")
				.build();
		var user3 = User.builder()
				.username("Steve")
				.password("{noop}password")
				.roles("USER")
				.build();
		return new InMemoryUserDetailsManager(user1, user2, user3);
	}
}
