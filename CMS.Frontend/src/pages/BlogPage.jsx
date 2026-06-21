import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import postService from '../services/postService';
import categoryService from '../services/categoryService';
import Spinner from '../components/Spinner';
import { IMAGE_BASE_URL } from '../config';
import './BlogPage.css';

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 4;

  useEffect(() => {
    categoryService.getAll()
      .then(setCategories)
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const req = selectedCat
      ? postService.getByCategory(selectedCat)
      : postService.getAll();
    req
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCat]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCat]);

  const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  return (
    <div className="blog-page">
      <div className="blog-header">
        <h1>📰 Tin tức &amp; Bài viết</h1>
        <p>Cập nhật thông tin mới nhất từ hệ thống</p>
      </div>

      <div className="blog-layout">
        {/* Sidebar */}
        <aside className="blog-sidebar">
          <h3>🗂️ Chuyên mục</h3>
          <ul>
            <li>
              <button
                className={selectedCat === null ? 'active' : ''}
                onClick={() => setSelectedCat(null)}
              >
                Tất cả bài viết
                <span className="cat-count">{posts.length}</span>
              </button>
            </li>
            {categories.map(c => (
              <li key={c.id}>
                <button
                  className={selectedCat === c.id ? 'active' : ''}
                  onClick={() => setSelectedCat(c.id)}
                >
                  {c.name}
                  {c.postCount > 0 && <span className="cat-count">{c.postCount}</span>}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Posts */}
        <main className="blog-main">
          {loading ? <Spinner text="Đang tải bài viết..." /> : (
            posts.length === 0
              ? <div className="empty-state">Không có bài viết nào trong chuyên mục này.</div>
              : <>
                  <div className="post-list">
                    {currentPosts.map(p => (
                      <Link to={`/tin-tuc/${p.id}`} key={p.id} className="post-item">
                        <div className="post-thumb">
                          {p.imageUrl
                            ? <img src={`${IMAGE_BASE_URL}${p.imageUrl}`} alt={p.title} />
                            : <div className="no-img">📰</div>}
                        </div>
                        <div className="post-content">
                          {p.categoryName && <span className="post-cat-tag">{p.categoryName}</span>}
                          <h2 className="post-item-title">{p.title}</h2>
                          <div className="post-meta">
                            <span>📅 {formatDate(p.createdDate)}</span>
                          </div>
                          <span className="read-more">Đọc tiếp →</span>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="page-btn prev-btn"
                      >
                        ← Trước
                      </button>

                      {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`page-btn ${page === currentPage ? 'active' : ''}`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="page-btn next-btn"
                      >
                        Sau →
                      </button>
                    </div>
                  )}
                </>
          )}
        </main>
      </div>
    </div>
  );
}
