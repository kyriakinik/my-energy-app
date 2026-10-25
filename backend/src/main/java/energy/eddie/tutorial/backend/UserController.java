package energy.eddie.tutorial.backend;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:4200") // Επιτρέπει κλήσεις από το Angular frontend
class UserController {

    // Έγχυση του UserConnectionService για ανάκτηση συνδέσεων από τη βάση
    private final UserConnectionService userConnectionService;

    UserController(UserConnectionService userConnectionService) {
        this.userConnectionService = userConnectionService;
    }

    // Endpoint από το Day 5: Επιστρέφει τα βασικά στοιχεία του συνδεδεμένου χρήστη (ID και Όνομα)
    @GetMapping("/api/me")
    Map<String, String> me(@AuthenticationPrincipal Jwt jwt) {
        return Map.of("id", jwt.getSubject(), "name", jwt.getClaimAsString("name"));
    }

    // Νέο Endpoint Day 6: Επιστρέφει τη λίστα με τις συνδέσεις του συγκεκριμένου χρήστη
    @GetMapping("/api/connections")
    List<UserConnection> connections(@AuthenticationPrincipal Jwt jwt) {
        return userConnectionService.findAllByUserId(jwt.getSubject());
    }
}