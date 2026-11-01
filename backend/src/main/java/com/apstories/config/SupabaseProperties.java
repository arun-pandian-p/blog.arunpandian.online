package com.apstories.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class SupabaseProperties {

    @Value("${supabase.url}")
    private String url;

    @Value("${supabase.service-key}")
    private String serviceKey;

    @Value("${supabase.anon-key}")
    private String anonKey;

    public String getUrl() {
        return url;
    }

    public String getServiceKey() {
        return serviceKey;
    }

    public String getAnonKey() {
        return anonKey;
    }
}

