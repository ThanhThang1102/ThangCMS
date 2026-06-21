import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import postService from '../services/postService';
import Spinner from '../components/Spinner';
import { IMAGE_BASE_URL } from '../config';
import './PostDetailPage.css';

export default function PostDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    postService.getById(id)
      .then(setPost)
      .catch(() => setError('Không tìm thấy bài viết này.'))
      .finally(() => setLoading(false));
  }, [id]);

  const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  });

  if (loading) return <Spinner text="Đang tải bài viết..." />;
  if (error) return (
    <div className="error-page">
      <div className="error-icon">😕</div>
      <h2>{error}</h2>
      <Link to="/tin-tuc" className="btn-back">← Quay lại tin tức</Link>
    </div>
  );

  return (
    <div className="post-detail">
      <div className="breadcrumb">
        <Link to="/">Trang chủ</Link> / <Link to="/tin-tuc">Tin tức</Link> / <span>{post.title}</span>
      </div>

      <article className="article">
        {post.imageUrl && (
          <div className="article-hero-img">
            <img src={`${IMAGE_BASE_URL}${post.imageUrl}`} alt={post.title} />
          </div>
        )}

        <div className="article-header">
          <h1 className="article-title">{post.title}</h1>
          <div className="article-meta">
            <span>📅 {formatDate(post.createdDate)}</span>
          </div>
        </div>

        <div className="article-body">
          {post.content
            ? <div dangerouslySetInnerHTML={{ __html: post.content }} />
            : <p className="no-content">Bài viết chưa có nội dung chi tiết.</p>}
        </div>

        <div className="article-footer">
          <Link to="/tin-tuc" className="btn-back">← Quay lại danh sách bài viết</Link>
        </div>
      </article>
    </div>
  );
}
