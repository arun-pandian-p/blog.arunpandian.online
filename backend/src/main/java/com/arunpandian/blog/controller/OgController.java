package com.arunpandian.blog.controller;

import com.arunpandian.blog.dto.blog.BlogDto;
import com.arunpandian.blog.exception.ResourceNotFoundException;
import com.arunpandian.blog.service.BlogService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.format.DateTimeFormatter;

@RestController
public class OgController {

    private final BlogService blogService;
    private static final String DEFAULT_IMAGE = "https://blog.arunpandian.online/assets/arun-profile.jpg";
    private static final String SITE_NAME = "blog.arunpandian.online";
    private static final String BASE_URL = "https://blog.arunpandian.online";

    public OgController(BlogService blogService) {
        this.blogService = blogService;
    }

    @GetMapping(value = "/api/og", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> getOpenGraphMetadata(
            @RequestParam(required = false) String slug,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String id) {

        String targetSlug = StringUtils.hasText(slug) ? slug.trim() : (StringUtils.hasText(id) ? id.trim() : null);

        if (!StringUtils.hasText(targetSlug)) {
            return ResponseEntity.ok(renderDefaultSiteHtml());
        }

        try {
            BlogDto blog = blogService.getBlogBySlug(targetSlug);
            return ResponseEntity.ok(renderArticleHtml(blog));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(renderNotFoundHtml(targetSlug));
        }
    }

    @GetMapping(value = {"/api/og/posts/{slug}", "/posts/{slug}/og"}, produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> getPostOpenGraphMetadata(@PathVariable String slug) {
        return getOpenGraphMetadata(slug, "blog", null);
    }

    private String renderArticleHtml(BlogDto blog) {
        String title = StringUtils.hasText(blog.getTitle()) ? escapeHtml(blog.getTitle()) : "Article";
        String rawExcerpt = StringUtils.hasText(blog.getExcerpt()) ? blog.getExcerpt() : "Read this article on blog.arunpandian.online.";
        String excerpt = escapeHtml(rawExcerpt.replaceAll("<[^>]*>", ""));
        if (excerpt.length() > 200) {
            excerpt = excerpt.substring(0, 197) + "...";
        }

        String postSlug = blog.getSlug() != null ? blog.getSlug() : (blog.getId() != null ? blog.getId().toString() : "");
        String canonicalUrl = BASE_URL + "/posts/" + postSlug;

        String coverImage = DEFAULT_IMAGE;
        if (StringUtils.hasText(blog.getCoverImage())) {
            String img = blog.getCoverImage().trim();
            if (img.startsWith("http://") || img.startsWith("https://")) {
                coverImage = escapeHtml(img);
            } else {
                coverImage = BASE_URL + (img.startsWith("/") ? "" : "/") + escapeHtml(img);
            }
        }

        String author = StringUtils.hasText(blog.getAuthorName()) ? escapeHtml(blog.getAuthorName()) : "Arun Pandian";
        String publishedTime = blog.getPublishedAt() != null ? DateTimeFormatter.ISO_INSTANT.format(blog.getPublishedAt()) : "";

        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html>\n");
        sb.append("<html lang=\"en\">\n");
        sb.append("<head>\n");
        sb.append("  <meta charset=\"UTF-8\">\n");
        sb.append("  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n");
        sb.append("  <title>").append(title).append(" — ").append(SITE_NAME).append("</title>\n");
        sb.append("  <meta name=\"description\" content=\"").append(excerpt).append("\">\n");
        sb.append("  <link rel=\"canonical\" href=\"").append(canonicalUrl).append("\">\n");
        sb.append("  <meta name=\"author\" content=\"").append(author).append("\">\n");
        sb.append("  <meta property=\"og:site_name\" content=\"").append(SITE_NAME).append("\">\n");
        sb.append("  <meta property=\"og:title\" content=\"").append(title).append("\">\n");
        sb.append("  <meta property=\"og:description\" content=\"").append(excerpt).append("\">\n");
        sb.append("  <meta property=\"og:url\" content=\"").append(canonicalUrl).append("\">\n");
        sb.append("  <meta property=\"og:type\" content=\"article\">\n");
        sb.append("  <meta property=\"og:image\" content=\"").append(coverImage).append("\">\n");
        sb.append("  <meta property=\"og:image:secure_url\" content=\"").append(coverImage).append("\">\n");
        sb.append("  <meta property=\"og:image:width\" content=\"1200\">\n");
        sb.append("  <meta property=\"og:image:height\" content=\"630\">\n");
        if (StringUtils.hasText(publishedTime)) {
            sb.append("  <meta property=\"article:published_time\" content=\"").append(publishedTime).append("\">\n");
        }
        sb.append("  <meta property=\"article:author\" content=\"").append(author).append("\">\n");
        sb.append("  <meta name=\"twitter:card\" content=\"summary_large_image\">\n");
        sb.append("  <meta name=\"twitter:title\" content=\"").append(title).append("\">\n");
        sb.append("  <meta name=\"twitter:description\" content=\"").append(excerpt).append("\">\n");
        sb.append("  <meta name=\"twitter:image\" content=\"").append(coverImage).append("\">\n");
        sb.append("  <meta http-equiv=\"refresh\" content=\"0;url=").append(canonicalUrl).append("\">\n");
        sb.append("  <script>window.location.replace(\"").append(canonicalUrl).append("\");</script>\n");
        sb.append("</head>\n");
        sb.append("<body style=\"font-family: sans-serif; max-width: 680px; margin: 40px auto; padding: 0 16px; color: #1C1A17;\">\n");
        sb.append("  <h1>").append(title).append("</h1>\n");
        sb.append("  <p style=\"color: #6E665C; font-size: 1.1em;\">").append(excerpt).append("</p>\n");
        sb.append("  <p><strong>Author:</strong> ").append(author).append("</p>\n");
        sb.append("  <p><a href=\"").append(canonicalUrl).append("\" style=\"color: #B83A26;\">Read the full article on ").append(SITE_NAME).append(" &rarr;</a></p>\n");
        sb.append("</body>\n");
        sb.append("</html>");

        return sb.toString();
    }

    private String renderDefaultSiteHtml() {
        return "<!DOCTYPE html>\n" +
                "<html lang=\"en\">\n" +
                "<head>\n" +
                "  <meta charset=\"UTF-8\">\n" +
                "  <title>" + SITE_NAME + " — Tech & Engineering Publication</title>\n" +
                "  <meta name=\"description\" content=\"Independent publication covering software engineering, systems, cloud architecture, and modern full-stack development.\">\n" +
                "  <link rel=\"canonical\" href=\"" + BASE_URL + "\">\n" +
                "  <meta property=\"og:site_name\" content=\"" + SITE_NAME + "\">\n" +
                "  <meta property=\"og:title\" content=\"" + SITE_NAME + " — Tech & Engineering Publication\">\n" +
                "  <meta property=\"og:description\" content=\"Independent publication covering software engineering, systems, cloud architecture, and modern full-stack development.\">\n" +
                "  <meta property=\"og:url\" content=\"" + BASE_URL + "\">\n" +
                "  <meta property=\"og:type\" content=\"website\">\n" +
                "  <meta property=\"og:image\" content=\"" + DEFAULT_IMAGE + "\">\n" +
                "  <meta name=\"twitter:card\" content=\"summary_large_image\">\n" +
                "  <meta http-equiv=\"refresh\" content=\"0;url=" + BASE_URL + "\">\n" +
                "</head>\n" +
                "<body>\n" +
                "  <h1>" + SITE_NAME + "</h1>\n" +
                "  <p><a href=\"" + BASE_URL + "\">Go to homepage</a></p>\n" +
                "</body>\n" +
                "</html>";
    }

    private String renderNotFoundHtml(String slug) {
        return "<!DOCTYPE html>\n" +
                "<html lang=\"en\">\n" +
                "<head>\n" +
                "  <meta charset=\"UTF-8\">\n" +
                "  <title>Article Not Found — " + SITE_NAME + "</title>\n" +
                "  <meta name=\"robots\" content=\"noindex, nofollow\">\n" +
                "  <meta http-equiv=\"refresh\" content=\"0;url=" + BASE_URL + "/blog\">\n" +
                "</head>\n" +
                "<body>\n" +
                "  <h1>Article Not Found</h1>\n" +
                "  <p>The requested publication was not found or is private.</p>\n" +
                "  <p><a href=\"" + BASE_URL + "/blog\">Browse published stories</a></p>\n" +
                "</body>\n" +
                "</html>";
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
