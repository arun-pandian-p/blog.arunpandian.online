package com.arunpandian.blog.service;

import com.arunpandian.blog.dto.blog.BlogCreateRequest;
import com.arunpandian.blog.dto.blog.BlogDto;
import com.arunpandian.blog.dto.blog.BlogUpdateRequest;
import com.arunpandian.blog.dto.common.PageResponse;
import com.arunpandian.blog.entity.Blog;
import com.arunpandian.blog.entity.User;
import com.arunpandian.blog.entity.enums.BlogStatus;
import com.arunpandian.blog.exception.BadRequestException;
import com.arunpandian.blog.exception.ResourceNotFoundException;
import com.arunpandian.blog.repository.BlogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.text.Normalizer;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class BlogService {

    private static final Logger log = LoggerFactory.getLogger(BlogService.class);
    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    private final BlogRepository blogRepository;

    public BlogService(BlogRepository blogRepository) {
        this.blogRepository = blogRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<BlogDto> getPublicBlogs(String query, String category, String tag, String author, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("publishedAt").descending().and(Sort.by("createdAt").descending()));
        Instant now = Instant.now();

        Page<Blog> blogPage;
        if (StringUtils.hasText(query)) {
            blogPage = blogRepository.searchPublicPublished(query.trim(), now, pageable);
        } else if (StringUtils.hasText(category)) {
            blogPage = blogRepository.findPublicPublishedByCategory(category.trim(), now, pageable);
        } else if (StringUtils.hasText(tag)) {
            blogPage = blogRepository.findPublicPublishedByTag(tag.trim(), now, pageable);
        } else if (StringUtils.hasText(author)) {
            blogPage = blogRepository.findPublicPublishedByAuthor(author.trim(), now, pageable);
        } else {
            blogPage = blogRepository.findPublicPublished(now, pageable);
        }

        List<BlogDto> dtos = blogPage.getContent().stream().map(BlogDto::from).toList();
        return new PageResponse<>(dtos, blogPage.getNumber(), blogPage.getSize(), blogPage.getTotalElements(), blogPage.getTotalPages(), blogPage.isLast());
    }

    @Transactional(readOnly = true)
    public List<BlogDto> getRelatedBlogs(String slug) {
        Blog blog = blogRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Blog post", "slug", slug));

        String category = blog.getCategory() != null ? blog.getCategory() : "Engineering";
        String primaryTag = "";
        if (blog.getTags() != null && !blog.getTags().isBlank()) {
            primaryTag = blog.getTags().split(",")[0].trim();
        }

        List<Blog> related = blogRepository.findRelatedBlogs(blog.getId(), category, primaryTag, PageRequest.of(0, 3));
        return related.stream().map(BlogDto::from).toList();
    }

    @Transactional(readOnly = true)
    public List<BlogDto> getRecentBlogsForRss() {
        List<Blog> blogs = blogRepository.findRecentPublicPublished(Instant.now(), PageRequest.of(0, 30));
        return blogs.stream().map(BlogDto::from).toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<BlogDto> getMyArticles(User user, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Blog> blogPage = blogRepository.findByAuthorId(user.getId(), pageable);
        List<BlogDto> dtos = blogPage.getContent().stream().map(BlogDto::from).toList();
        return new PageResponse<>(dtos, blogPage.getNumber(), blogPage.getSize(), blogPage.getTotalElements(), blogPage.getTotalPages(), blogPage.isLast());
    }

    @Transactional
    public BlogDto getBlogBySlug(String slug) {
        Blog blog = blogRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Blog post", "slug", slug));

        Instant now = Instant.now();
        boolean isPubliclyVisible = blog.isPublished() && blog.getStatus() == BlogStatus.PUBLISHED
                && (blog.getPublishedAt() == null || !blog.getPublishedAt().isAfter(now));

        if (!isPubliclyVisible) {
            throw new ResourceNotFoundException("Blog post", "slug", slug);
        }

        blog.setViewsCount(blog.getViewsCount() + 1);
        blogRepository.save(blog);
        return BlogDto.from(blog);
    }

    @Transactional
    public int clapBlog(UUID id) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blog post", "id", id));
        blog.setClapsCount(blog.getClapsCount() + 1);
        blogRepository.save(blog);
        return blog.getClapsCount();
    }

    @Transactional(readOnly = true)
    public PageResponse<BlogDto> getAllBlogsForAdmin(String query, BlogStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<Blog> blogPage;
        if (StringUtils.hasText(query)) {
            blogPage = blogRepository.searchAll(query.trim(), pageable);
        } else if (status != null) {
            blogPage = blogRepository.findByStatus(status, pageable);
        } else {
            blogPage = blogRepository.findAll(pageable);
        }

        List<BlogDto> dtos = blogPage.getContent().stream().map(BlogDto::from).toList();
        return new PageResponse<>(dtos, blogPage.getNumber(), blogPage.getSize(), blogPage.getTotalElements(), blogPage.getTotalPages(), blogPage.isLast());
    }

    @Transactional(readOnly = true)
    public BlogDto getBlogByIdForAdmin(UUID id) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blog post", "id", id));
        return BlogDto.from(blog);
    }

    @Transactional
    public BlogDto createBlog(BlogCreateRequest req) {
        return createBlog(req, null);
    }

    @Transactional
    public BlogDto createBlog(BlogCreateRequest req, User author) {
        String slug = req.getSlug();
        if (!StringUtils.hasText(slug)) {
            slug = slugify(req.getTitle());
        } else {
            slug = slugify(slug);
        }

        if (blogRepository.existsBySlug(slug)) {
            slug = slug + "-" + UUID.randomUUID().toString().substring(0, 5);
        }

        if (req.getTags() != null && req.getTags().size() > 4) {
            throw new BadRequestException("A blog post can have at most 4 tags");
        }

        Blog blog = new Blog();
        blog.setTitle(req.getTitle().trim());
        blog.setSlug(slug);
        blog.setExcerpt(req.getExcerpt());
        blog.setContent(req.getContent());
        if (req.getContentJson() != null) {
            blog.setContentJson(req.getContentJson());
        }

        if (req.getTags() != null && !req.getTags().isEmpty()) {
            blog.setTags(String.join(",", req.getTags()));
        }

        blog.setReadTime(StringUtils.hasText(req.getReadTime()) ? req.getReadTime() : calculateReadTime(req.getContent()));
        blog.setCoverImage(req.getCoverImage());
        blog.setCoverVideoUrl(req.getCoverVideoUrl());

        if (author != null) {
            blog.setAuthorId(author.getId());
            blog.setAuthorUsername(author.getUsername());
            blog.setAuthorName(author.getFullName());
            blog.setAuthorAvatar(author.getAvatarUrl());
            blog.setAuthorBio(author.getBio());
        } else {
            blog.setAuthorName(StringUtils.hasText(req.getAuthorName()) ? req.getAuthorName() : "Arun Pandian");
            blog.setAuthorAvatar(req.getAuthorAvatar());
        }

        blog.setCategory(StringUtils.hasText(req.getCategory()) ? req.getCategory().trim() : "Engineering");
        blog.setFeatured(req.isFeatured());
        blog.setSortOrder(req.getSortOrder());

        BlogStatus status = req.getStatus() != null ? req.getStatus() : BlogStatus.DRAFT;
        blog.setStatus(status);

        if (status == BlogStatus.PUBLISHED) {
            blog.setPublished(true);
            blog.setPublishedAt(req.getPublishedAt() != null ? req.getPublishedAt() : Instant.now());
        } else if (status == BlogStatus.SCHEDULED) {
            blog.setPublished(false);
            if (req.getScheduledAt() == null || req.getScheduledAt().isBefore(Instant.now())) {
                throw new BadRequestException("Scheduled time must be in the future");
            }
            blog.setScheduledAt(req.getScheduledAt());
        } else {
            blog.setPublished(false);
            blog.setPublishedAt(null);
        }

        Blog saved = blogRepository.save(blog);
        log.info("Created blog post: {} (slug: {}) with status: {}", saved.getTitle(), saved.getSlug(), saved.getStatus());
        return BlogDto.from(saved);
    }

    @Transactional
    public BlogDto updateBlog(UUID id, BlogUpdateRequest req) {
        return updateBlog(id, req, null);
    }

    @Transactional
    public BlogDto updateBlog(UUID id, BlogUpdateRequest req, User user) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blog post", "id", id));

        if (user != null && user.getRole() != com.arunpandian.blog.entity.enums.Role.ROLE_ADMIN) {
            if (blog.getAuthorId() != null && !blog.getAuthorId().equals(user.getId())) {
                throw new org.springframework.security.access.AccessDeniedException("You do not have permission to edit this post");
            }
        }

        if (StringUtils.hasText(req.getTitle())) {
            blog.setTitle(req.getTitle().trim());
        }

        if (StringUtils.hasText(req.getSlug())) {
            String newSlug = slugify(req.getSlug());
            if (!newSlug.equals(blog.getSlug()) && blogRepository.existsBySlugAndIdNot(newSlug, id)) {
                throw new BadRequestException("Slug is already in use by another blog post: " + newSlug);
            }
            blog.setSlug(newSlug);
        }

        if (req.getExcerpt() != null) {
            blog.setExcerpt(req.getExcerpt());
        }

        if (req.getContent() != null) {
            blog.setContent(req.getContent());
            if (!StringUtils.hasText(req.getReadTime())) {
                blog.setReadTime(calculateReadTime(req.getContent()));
            }
        }
        if (req.getContentJson() != null) {
            blog.setContentJson(req.getContentJson());
        }

        if (req.getTags() != null) {
            if (req.getTags().size() > 4) {
                throw new BadRequestException("A blog post can have at most 4 tags");
            }
            blog.setTags(String.join(",", req.getTags()));
        }

        if (req.getReadTime() != null) blog.setReadTime(req.getReadTime());
        if (req.getCoverImage() != null) blog.setCoverImage(req.getCoverImage());
        if (req.getCoverVideoUrl() != null) blog.setCoverVideoUrl(req.getCoverVideoUrl());
        if (req.getCategory() != null) blog.setCategory(req.getCategory().trim());
        if (req.getAuthorName() != null) blog.setAuthorName(req.getAuthorName());
        if (req.getAuthorAvatar() != null) blog.setAuthorAvatar(req.getAuthorAvatar());
        if (req.getFeatured() != null) blog.setFeatured(req.getFeatured());
        if (req.getSortOrder() != null) blog.setSortOrder(req.getSortOrder());

        if (req.getStatus() != null) {
            blog.setStatus(req.getStatus());
            if (req.getStatus() == BlogStatus.PUBLISHED) {
                blog.setPublished(true);
                if (blog.getPublishedAt() == null) {
                    blog.setPublishedAt(req.getPublishedAt() != null ? req.getPublishedAt() : Instant.now());
                }
            } else if (req.getStatus() == BlogStatus.SCHEDULED) {
                blog.setPublished(false);
                if (req.getScheduledAt() != null) {
                    blog.setScheduledAt(req.getScheduledAt());
                }
            } else {
                blog.setPublished(false);
            }
        }

        if (req.getPublished() != null) {
            blog.setPublished(req.getPublished());
        }
        if (req.getPublishedAt() != null) {
            blog.setPublishedAt(req.getPublishedAt());
        }
        if (req.getScheduledAt() != null) {
            blog.setScheduledAt(req.getScheduledAt());
        }

        Blog saved = blogRepository.save(blog);
        log.info("Updated blog post: {} (id: {})", saved.getTitle(), saved.getId());
        return BlogDto.from(saved);
    }

    @Transactional
    public void deleteBlog(UUID id) {
        deleteBlog(id, null);
    }

    @Transactional
    public void deleteBlog(UUID id, User user) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blog post", "id", id));

        if (user != null && user.getRole() != com.arunpandian.blog.entity.enums.Role.ROLE_ADMIN) {
            if (blog.getAuthorId() != null && !blog.getAuthorId().equals(user.getId())) {
                throw new org.springframework.security.access.AccessDeniedException("You do not have permission to delete this post");
            }
        }

        blogRepository.delete(blog);
        log.info("Deleted blog post with id: {}", id);
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void publishScheduledBlogs() {
        Instant now = Instant.now();
        List<Blog> dueBlogs = blogRepository.findDueScheduledBlogs(now);
        if (!dueBlogs.isEmpty()) {
            log.info("Found {} scheduled blog post(s) to publish", dueBlogs.size());
            for (Blog blog : dueBlogs) {
                blog.setStatus(BlogStatus.PUBLISHED);
                blog.setPublished(true);
                blog.setPublishedAt(blog.getScheduledAt() != null ? blog.getScheduledAt() : now);
                blog.setScheduledAt(null);
                blogRepository.save(blog);
                log.info("Automatically published scheduled post: {} (slug: {})", blog.getTitle(), blog.getSlug());
            }
        }
    }

    public static String slugify(String input) {
        if (!StringUtils.hasText(input)) {
            return "post-" + UUID.randomUUID().toString().substring(0, 8);
        }
        String nowhitespace = WHITESPACE.matcher(input.trim().toLowerCase(Locale.ENGLISH)).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        slug = slug.replaceAll("-{2,}", "-").replaceAll("^-|-$", "");
        return StringUtils.hasText(slug) ? slug : "post-" + UUID.randomUUID().toString().substring(0, 8);
    }

    private String calculateReadTime(String content) {
        if (!StringUtils.hasText(content)) return "1 min read";
        int words = content.trim().split("\\s+").length;
        int minutes = Math.max(1, (int) Math.ceil(words / 200.0));
        return minutes + " min read";
    }
}
