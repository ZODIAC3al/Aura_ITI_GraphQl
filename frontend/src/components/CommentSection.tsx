import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';

const ADD_COMMENT_MUTATION = gql`
  mutation AddComment($postId: ID!, $content: String!) {
    addComment(postId: $postId, content: $content) {
      id
      content
      createdAt
      author {
        id
        name
      }
    }
  }
`;

const DELETE_COMMENT_MUTATION = gql`
  mutation DeleteComment($id: ID!) {
    deleteComment(id: $id)
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

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  currentUserId?: string;
  onCommentsUpdated: () => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  comments,
  currentUserId,
  onCommentsUpdated,
}) => {
  const [content, setContent] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [addComment] = useMutation(ADD_COMMENT_MUTATION, {
    onCompleted: () => {
      setContent('');
      onCommentsUpdated();
    },
    onError: (err: any) => {
      setErrorMsg(err.message);
    },
  });

  const [deleteComment] = useMutation(DELETE_COMMENT_MUTATION, {
    onCompleted: () => {
      onCommentsUpdated();
    },
    onError: (err: any) => {
      setErrorMsg(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!content.trim()) return;

    addComment({ variables: { postId, content } });
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
    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(216, 180, 248, 0.2)' }}>
      <h4 style={{ margin: '0 0 12px', fontSize: '1rem', color: 'var(--text-light)', fontWeight: '600' }}>
        Comments ({comments.length})
      </h4>

      {errorMsg && <div className="error-badge" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>{errorMsg}</div>}

      {comments.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {comments.map((comment) => (
            <div
              key={comment.id}
              style={{
                background: 'rgba(216, 180, 248, 0.06)',
                padding: '10px 14px',
                borderRadius: '14px',
                border: '1px solid rgba(216, 180, 248, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                animation: 'fadeIn 0.2s ease-out',
              }}
            >
              <div style={{ flex: 1, marginRight: '8px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '600', color: '#a770db' }}>{comment.author?.name || 'Anonymous'}</span>
                  <span style={{ margin: '0 6px', fontSize: '0.75rem' }}>•</span>
                  <span style={{ fontSize: '0.75rem' }}>{formatTime(comment.createdAt)}</span>
                </div>
                <div style={{ fontSize: '0.95rem', wordBreak: 'break-word', color: 'var(--text-dark)' }}>
                  {comment.content}
                </div>
              </div>

              {currentUserId && comment.author?.id === currentUserId && (
                <button
                  className="cute-btn cute-btn-danger"
                  style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '8px' }}
                  onClick={() => deleteComment({ variables: { id: comment.id } })}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: '0.9rem', margin: '12px 0 20px' }}>
          No comments yet.
        </div>
      )}

      {currentUserId && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            className="cute-input"
            style={{ padding: '8px 14px', borderRadius: '12px', fontSize: '0.9rem' }}
            placeholder="Add a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button
            type="submit"
            className="cute-btn cute-btn-primary"
            style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '0.9rem' }}
          >
            Send
          </button>
        </form>
      )}
    </div>
  );
};
