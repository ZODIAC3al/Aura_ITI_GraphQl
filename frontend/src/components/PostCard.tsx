import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { CommentSection } from './CommentSection';

const DELETE_POST_MUTATION = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id)
  }
`;

interface Author {
  id: string;
  name: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: Author;
}

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: Author;
  comments: Comment[];
}

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onPostDeleted: () => void;
  onPostUpdated: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUserId,
  onPostDeleted,
  onPostUpdated,
}) => {
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const [deletePost, { error }] = useMutation(DELETE_POST_MUTATION, {
    onCompleted: () => {
      onPostDeleted();
    },
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deletePost({ variables: { id: post.id } });
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(parseInt(timestamp) || timestamp);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="instagram-card">
      {/* Header */}
      <div className="card-header">
        <div className="header-user-info">
          <div className="user-avatar">{getInitials(post.author?.name)}</div>
          <span className="user-username">{post.author?.name || 'Anonymous'}</span>
        </div>
        {currentUserId && post.author?.id === currentUserId && (
          <button
            className="cute-btn cute-btn-danger"
            style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '10px' }}
            onClick={handleDelete}
          >
            Delete
          </button>
        )}
      </div>

      {error && <div className="error-badge" style={{ margin: '0 14px 10px' }}>⚠️ {error.message}</div>}

      {/* Content Area */}
      <div className="card-content-area">
        <h4 className="post-title">{post.title}</h4>
        <p className="post-body">{post.content}</p>
      </div>

      {/* Action Bar */}
      <div className="card-action-bar">
        <button className={`action-icon-btn ${liked ? 'liked' : ''}`} onClick={() => setLiked(!liked)}>
          {liked ? '❤️' : '🤍'}
        </button>
        <button className="action-icon-btn" onClick={() => setShowComments(!showComments)}>
          💬
        </button>
      </div>

      {/* Caption Preview */}
      <div className="caption-area">
        <span className="caption-author">{post.author?.name || 'Anonymous'}</span>
        <span style={{ color: 'var(--text-muted)' }}>posted an update</span>
      </div>

      {/* Timestamp */}
      <div className="post-time">{formatTime(post.createdAt)}</div>

      {/* Comments Drawer */}
      {showComments && (
        <div style={{ padding: '0 14px 14px' }}>
          <CommentSection
            postId={post.id}
            comments={post.comments || []}
            currentUserId={currentUserId}
            onCommentsUpdated={onPostUpdated}
          />
        </div>
      )}
    </div>
  );
};
