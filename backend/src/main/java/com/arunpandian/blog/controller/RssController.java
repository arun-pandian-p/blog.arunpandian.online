package com.arunpandian.blog.controller;

import com.arunpandian.blog.dto.blog.BlogDto;
import com.arunpandian.blog.service.BlogService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
public class RssController {

    private final BlogService blogService;
    private static final DateTimeFormatter RFC_1123 = DateTimeFormatter.RFC_1123_DATE_TIME.withZone(ZoneId.of("UTC"));

    public RssController(BlogService blogService) {
        this.blogService = blogService;
    }

    @GetMapping(value = {"/feed.xml", "/rss.xml", "/feed"}, produces = "application/rss+xml;charset=UTF-8")
    public ResponseEntity<String> getRssFeed() {
        List<BlogDto> blogs = blogService.getRecentBlogsForRss();

        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<rss version=\"2.0\" xmlns:atom=\"http://www.w3.org/2005/Atom\">\n");
        xml.append("  <channel>\n");
        xml.append("    <title>blog.arunpandian.online</title>\n");
        xml.append("    <link>https://blog.arunpandian.online</link>\n");
        xml.append("    <description>Engineering, systems, cloud, and modern software architecture articles.</description>\n");
        xml.append("    <language>en-us</language>\n");
        xml.append("    <atom:link href=\"https://blog.arunpandian.online/feed.xml\" rel=\"self\" type=\"application/rss+xml\" />\n");

        for (BlogDto post : blogs) {
            String postUrl = "https://blog.arunpandian.online/posts/" + escapeXml(post.getSlug());
            xml.append("    <item>\n");
            xml.append("      <title>").append(escapeXml(post.getTitle())).append("</title>\n");
            xml.append("      <link>").append(postUrl).append("</link>\n");
            xml.append("      <guid isPermaLink=\"true\">").append(postUrl).append("</guid>\n");
            if (post.getExcerpt() != null) {
                xml.append("      <description>").append(escapeXml(post.getExcerpt())).append("</description>\n");
            }
            if (post.getAuthorName() != null) {
                xml.append("      <author>").append(escapeXml(post.getAuthorName())).append("</author>\n");
            }
            if (post.getCategory() != null) {
                xml.append("      <category>").append(escapeXml(post.getCategory())).append("</category>\n");
            }
            if (post.getPublishedAt() != null) {
                xml.append("      <pubDate>").append(RFC_1123.format(post.getPublishedAt())).append("</pubDate>\n");
            }
            xml.append("    </item>\n");
        }

        xml.append("  </channel>\n");
        xml.append("</rss>");

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/rss+xml;charset=UTF-8"))
                .body(xml.toString());
    }

    private String escapeXml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }
}
