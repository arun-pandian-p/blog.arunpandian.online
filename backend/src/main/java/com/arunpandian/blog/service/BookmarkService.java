package com.arunpandian.blog.service;

import com.arunpandian.blog.dto.blog.BookmarkDto;
import com.arunpandian.blog.entity.Blog;
import com.arunpandian.blog.entity.Bookmark;
import com.arunpandian.blog.entity.User;
import com.arunpandian.blog.exception.ResourceNotFoundException;
import com.arunpandian.blog.repository.BlogRepository;
import com.arunpandian.blog.repository.BookmarkRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final BlogRepository blogRepository;

    public BookmarkService(BookmarkRepository bookmarkRepository, BlogRepository blogRepository) {
        this.bookmarkRepository = bookmarkRepository;
        this.blogRepository = blogRepository;
    }

    @Transactional
    public boolean toggleBookmark(User user, UUID blogId) {
        if (!blogRepository.existsById(blogId)) {
            throw new ResourceNotFoundException("Blog post", "id", blogId);
        }

        Optional<Bookmark> existing = bookmarkRepository.findByUserIdAndBlogId(user.getId(), blogId);
        if (existing.isPresent()) {
            bookmarkRepository.delete(existing.get());
            return false;
        } else {
            Bookmark bookmark = new Bookmark(user.getId(), blogId);
            bookmarkRepository.save(bookmark);
            return true;
        }
    }

    @Transactional
    public void removeBookmark(User user, UUID blogId) {
        bookmarkRepository.deleteByUserIdAndBlogId(user.getId(), blogId);
    }

    @Transactional(readOnly = true)
    public boolean isBookmarked(User user, UUID blogId) {
        if (user == null) return false;
        return bookmarkRepository.existsByUserIdAndBlogId(user.getId(), blogId);
    }

    @Transactional(readOnly = true)
    public List<BookmarkDto> getUserBookmarks(User user) {
        List<Bookmark> bookmarks = bookmarkRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        if (bookmarks.isEmpty()) {
            return List.of();
        }

        List<UUID> blogIds = bookmarks.stream().map(Bookmark::getBlogId).toList();
        Map<UUID, Blog> blogMap = blogRepository.findAllById(blogIds).stream()
                .collect(Collectors.toMap(Blog::getId, b -> b));

        List<BookmarkDto> dtos = new ArrayList<>();
        for (Bookmark bm : bookmarks) {
            Blog blog = blogMap.get(bm.getBlogId());
            if (blog != null) {
                dtos.add(BookmarkDto.from(bm, blog));
            }
        }
        return dtos;
    }
}
