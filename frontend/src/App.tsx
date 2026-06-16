import React, { useState } from 'react';
import { ApolloProvider, useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { client } from './apollo-client';
import { AuthCard } from './components/AuthCard';
import { PostCard } from './components/PostCard';

const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
    }
  }
`;

const GET_POSTS_QUERY = gql`
  query GetPosts {
    getAllPosts {
      id
      title
      content
      createdAt
      author {
        id
        name
      }
      comments {
        id
        content
        createdAt
        author {
          id
          name
        }
      }
    }
  }
`;

const ADD_POST_MUTATION = gql`
  mutation AddPost($title: String!, $content: String!) {
    addPost(title: $title, content: $content) {
      id
      title
      content
      createdAt
    }
  }
`;

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

const Dashboard: React.FC<{ currentUser: { id: string; name: string } }> = ({ currentUser }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, loading, refetch } = useQuery<any>(GET_POSTS_QUERY, {
    fetchPolicy: 'network-only',
  });

  const [addPost] = useMutation(ADD_POST_MUTATION, {
    onCompleted: () => {
      setTitle('');
      setContent('');
      setShowCreateModal(false);
      refetch();
    },
    onError: (err: any) => {
      setErrorMsg(err.message);
    },
  });

  const [logout] = useMutation(LOGOUT_MUTATION, {
    onCompleted: () => {
      localStorage.removeItem('token');
      window.location.reload();
    },
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!title.trim() || !content.trim()) {
      setErrorMsg('Please fill in both title and content.');
      return;
    }
    addPost({ variables: { title, content } });
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation - Desktop */}
      <aside className="sidebar-nav">
        <div className="sidebar-logo">AURA</div>
        <div className="sidebar-links">
          <button className="sidebar-link active">
            <span>Home</span>
          </button>
          <button className="sidebar-link" onClick={() => setShowCreateModal(true)}>
            <span>Create</span>
          </button>
        </div>
        <div className="sidebar-footer">
          <button className="sidebar-link" onClick={() => logout()}>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Bottom Navigation - Mobile */}
      <nav className="bottom-nav">
        <button className="bottom-nav-btn" style={{ color: 'var(--accent-sage)' }}>
          <span>Home</span>
        </button>
        <button className="bottom-nav-btn" onClick={() => setShowCreateModal(true)}>
          <span>Create</span>
        </button>
        <button className="bottom-nav-btn" onClick={() => logout()}>
          <span>Log Out</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        <div className="feed-container">
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px', color: 'var(--text-primary)' }}>
            Latest Posts
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', margin: '60px 0', color: 'var(--text-muted)' }}>
              Loading feed...
            </div>
          ) : data?.getAllPosts?.length > 0 ? (
            data.getAllPosts.map((post: any) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUser.id}
                onPostDeleted={refetch}
                onPostUpdated={refetch}
              />
            ))
          ) : (
            <div className="instagram-card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No posts yet. Click the create button to write one.
            </div>
          )}
        </div>
      </main>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowCreateModal(false)}>
              ×
            </button>
            <h3 style={{ margin: '0 0 20px', fontWeight: '700', fontSize: '1.3rem', color: 'var(--text-primary)' }}>
              Create Post
            </h3>
            {errorMsg && <div className="error-badge">⚠️ {errorMsg}</div>}
            <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '0.9rem' }}>Title</label>
                <input
                  type="text"
                  className="cute-input"
                  placeholder="Give your post a title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '0.9rem' }}>Content</label>
                <textarea
                  className="cute-input"
                  style={{ minHeight: '120px', resize: 'vertical' }}
                  placeholder="Share your perspective..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
              <button type="submit" className="cute-btn cute-btn-primary" style={{ marginTop: '8px' }}>
                Publish Post
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const MainApp: React.FC = () => {
  const { data, loading, refetch } = useQuery<any>(ME_QUERY);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-muted)', backgroundColor: 'var(--bg-matcha)' }}>
        Connecting...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-matcha)' }}>
      {data?.me ? (
        <Dashboard currentUser={data.me} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>
          <div style={{ textAlign: 'center', marginTop: '40px', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '2.8rem', margin: '0 0 10px', background: 'linear-gradient(45deg, #86efac, #f4efe2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '700' }}>
              AURA
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', margin: 0 }}>
              Connect, write, and share your perspective.
            </p>
          </div>
          <AuthCard onAuthSuccess={refetch} />
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <ApolloProvider client={client}>
      <MainApp />
    </ApolloProvider>
  );
}

export default App;
