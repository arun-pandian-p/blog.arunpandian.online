package com.arunpandian.blog.dto.newsletter;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class SubscribeRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    private String email;

    private String source = "home_footer";

    public SubscribeRequest() {}

    public SubscribeRequest(String email, String source) {
        this.email = email;
        this.source = source;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
}
