package com.apstories.client;

import com.apstories.config.SupabaseProperties;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Component
public class SupabaseClient {

    private final SupabaseProperties properties;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public SupabaseClient(SupabaseProperties properties) {
        this.properties = properties;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper()
                .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    public ObjectMapper getObjectMapper() {
        return objectMapper;
    }

    public SupabaseProperties getProperties() {
        return properties;
    }

    private HttpRequest.Builder baseRequest(String endpointWithQuery) {
        String baseUrl = properties.getUrl().replaceAll("/+$", "") + "/rest/v1/";
        String cleanPath = endpointWithQuery.startsWith("/") ? endpointWithQuery.substring(1) : endpointWithQuery;
        String sanitized = cleanPath
                .replace(" ", "%20")
                .replace("{", "%7B")
                .replace("}", "%7D")
                .replace("\"", "%22")
                .replace("[", "%5B")
                .replace("]", "%5D");
        URI uri = URI.create(baseUrl + sanitized);

        return HttpRequest.newBuilder()
                .uri(uri)
                .timeout(Duration.ofSeconds(15))
                .header("apikey", properties.getServiceKey())
                .header("Authorization", "Bearer " + properties.getServiceKey())
                .header("Content-Type", "application/json");
    }

    public String uploadStorage(String bucket, String filename, byte[] data, String contentType) {
        try {
            String storageUrl = properties.getUrl().replaceAll("/+$", "") + "/storage/v1/object/" + bucket + "/" + filename;
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(storageUrl))
                    .timeout(Duration.ofSeconds(30))
                    .header("apikey", properties.getServiceKey())
                    .header("Authorization", "Bearer " + properties.getServiceKey())
                    .header("Content-Type", contentType != null ? contentType : "application/octet-stream")
                    .POST(HttpRequest.BodyPublishers.ofByteArray(data))
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return properties.getUrl().replaceAll("/+$", "") + "/storage/v1/object/public/" + bucket + "/" + filename;
            } else {
                System.err.println("Storage upload returned status: " + response.statusCode() + " " + response.body());
                return null;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public <T> List<T> getList(String endpoint, TypeReference<List<T>> typeRef) {
        try {
            HttpRequest request = baseRequest(endpoint)
                    .GET()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return objectMapper.readValue(response.body(), typeRef);
            }
            System.err.println("Supabase GET error: " + response.statusCode() + " " + response.body());
            return Collections.emptyList();
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    public <T> T getSingle(String endpoint, Class<T> clazz) {
        try {
            HttpRequest request = baseRequest(endpoint)
                    .GET()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                List<T> list = objectMapper.readValue(response.body(), objectMapper.getTypeFactory().constructCollectionType(List.class, clazz));
                return (list != null && !list.isEmpty()) ? list.get(0) : null;
            }
            return null;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public <T> List<T> post(String endpoint, Object body, TypeReference<List<T>> typeRef) {
        try {
            String json = objectMapper.writeValueAsString(body);
            HttpRequest request = baseRequest(endpoint)
                    .header("Prefer", "return=representation")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return objectMapper.readValue(response.body(), typeRef);
            }
            System.err.println("Supabase POST error: " + response.statusCode() + " " + response.body());
            return Collections.emptyList();
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    public <T> List<T> patch(String endpoint, Object body, TypeReference<List<T>> typeRef) {
        try {
            String json = objectMapper.writeValueAsString(body);
            HttpRequest request = baseRequest(endpoint)
                    .header("Prefer", "return=representation")
                    .method("PATCH", HttpRequest.BodyPublishers.ofString(json))
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return objectMapper.readValue(response.body(), typeRef);
            }
            System.err.println("Supabase PATCH error: " + response.statusCode() + " " + response.body());
            return Collections.emptyList();
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    public boolean delete(String endpoint) {
        try {
            HttpRequest request = baseRequest(endpoint)
                    .DELETE()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            return response.statusCode() >= 200 && response.statusCode() < 300;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public long count(String endpoint) {
        try {
            HttpRequest request = baseRequest(endpoint)
                    .header("Prefer", "count=exact")
                    .header("Range-Unit", "items")
                    .header("Range", "0-0")
                    .GET()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            String contentRange = response.headers().firstValue("content-range").orElse("");
            if (contentRange.contains("/")) {
                String countPart = contentRange.substring(contentRange.indexOf('/') + 1);
                return Long.parseLong(countPart.trim());
            }
            return 0L;
        } catch (Exception e) {
            return 0L;
        }
    }
}

