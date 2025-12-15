import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Forum = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [replyTo, setReplyTo] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, [page, search]);

  const fetchPosts = async () => {
    try {
      const res = await api.get(`/forum/posts?page=${page}&search=${search}`);
      setPosts(res.data || []);
    } catch (err) {
      toast.error('Failed to load posts');
    }
  };

  const fetchComments = async (postId) => {
    try {
      const res = await api.get(`/forum/posts/${postId}/comments`);
      setComments(res.data || []);
    } catch (err) {
      toast.error('Failed to load comments');
    }
  };

  const createPost = async (e) => {
    e.preventDefault();
    try {
      await api.post('/forum/posts', { title: newTitle, content: newContent });
      toast.success('Post created!');
      setNewTitle(''); setNewContent(''); setShowForm(false);
      fetchPosts();
    } catch (err) {
      toast.error('Failed to post');
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/forum/posts/${selectedPost.id}/comments`, {
        content: commentInput,
        parent_id: replyTo?.id || null
      });
      toast.success('Comment added!');
      setCommentInput('');
      setReplyTo(null);
      fetchComments(selectedPost.id);
    } catch (err) {
      toast.error('Failed');
    }
  };

  const likePost = async (postId) => {
    await api.post(`/forum/posts/${postId}/like`);
    fetchPosts();
  };

  const likeComment = async (commentId) => {
    await api.post(`/forum/comments/${commentId}/like`);
    fetchComments(selectedPost.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-green-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-5xl font-bold text-primary text-center mb-12">💬 Community Forum</h1>

        {/* Create Post */}
        <div className="text-center mb-12">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary text-white px-10 py-5 rounded-2xl text-2xl font-bold hover:bg-green-700 shadow-xl transition"
          >
            {showForm ? 'Cancel' : '+ New Discussion'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-3xl shadow-2xl p-10 mb-16">
            <form onSubmit={createPost} className="space-y-8">
              <input
                type="text"
                placeholder="Post Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="w-full px-8 py-5 border-2 rounded-2xl text-2xl focus:border-primary outline-none"
              />
              <textarea
                placeholder="Write your discussion..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows="6"
                required
                className="w-full px-8 py-6 border-2 rounded-2xl text-xl focus:border-primary outline-none"
              />
              <button type="submit" className="bg-accent text-primary px-12 py-6 rounded-2xl text-2xl font-bold hover:bg-yellow-500 shadow-xl transition">
                Publish Post
              </button>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="text-center mb-12">
          <input
            type="text"
            placeholder="🔍 Search discussions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-10 py-5 w-full max-w-2xl border-2 rounded-3xl text-xl focus:border-primary outline-none"
          />
        </div>

        {/* Posts List */}
        <div className="space-y-10">
          {posts.map((post) => (
            <div
              key={post.id}
              onClick={() => {
                setSelectedPost(post);
                fetchComments(post.id);
              }}
              className="bg-white rounded-3xl shadow-2xl p-10 cursor-pointer hover:shadow-3xl transition transform hover:-translate-y-2"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-3xl font-bold text-primary mb-2">{post.title}</h3>
                  <p className="text-xl text-gray-700 line-clamp-3">{post.content}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg text-gray-600">by <strong>{post.username}</strong></p>
                  <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    likePost(post.id);
                  }}
                  className="flex items-center gap-3 text-2xl hover:text-red-600 transition"
                >
                  ❤️ {post.likes || 0} Likes
                </button>
                <p className="text-xl text-gray-600">
                  💬 {post.comment_count || 0} Comments
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Thread Modal */}
        {selectedPost && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-6" onClick={() => setSelectedPost(null)}>
            <div className="bg-white rounded-3xl shadow-3xl max-w-5xl w-full max-h-screen overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-12">
                <h2 className="text-5xl font-bold text-primary mb-6">{selectedPost.title}</h2>
                <p className="text-2xl text-gray-800 mb-8 leading-relaxed">{selectedPost.content}</p>
                <div className="flex justify-between items-center mb-12">
                  <p className="text-xl text-gray-600">
                    by <strong>{selectedPost.username}</strong> • {new Date(selectedPost.created_at).toLocaleString()}
                  </p>
                  <button
                    onClick={() => likePost(selectedPost.id)}
                    className="flex items-center gap-4 text-3xl hover:text-red-600 transition"
                  >
                    ❤️ {selectedPost.likes || 0}
                  </button>
                </div>

                {/* Comments */}
                <div className="space-y-8">
                  <h3 className="text-3xl font-bold text-primary mb-8">Comments ({comments.length})</h3>
                  {comments.map((comment) => (
                    <div key={comment.id} className={`pl-${comment.parent_id ? '12' : '0'} border-l-4 border-primary bg-gray-50 rounded-2xl p-8`}>
                      <div className="flex justify-between mb-4">
                        <p className="text-xl">
                          <strong>{comment.username}</strong> • {new Date(comment.created_at).toLocaleString()}
                        </p>
                        <button
                          onClick={() => likeComment(comment.id)}
                          className="flex items-center gap-2 text-xl hover:text-red-600"
                        >
                          ❤️ {comment.likes || 0}
                        </button>
                      </div>
                      <p className="text-xl text-gray-800 mb-4">{comment.content}</p>
                      <button
                        onClick={() => setReplyTo(comment)}
                        className="text-primary font-bold hover:underline"
                      >
                        Reply
                      </button>
                      {comment.reply_count > 0 && <p className="text-gray-600 mt-2">{comment.reply_count} replies</p>}
                    </div>
                  ))}
                </div>

                {/* Add Comment */}
                <form onSubmit={addComment} className="mt-16">
                  <textarea
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder={replyTo ? `Replying to ${replyTo.username}...` : "Write a comment..."}
                    rows="5"
                    required
                    className="w-full px-8 py-6 border-2 rounded-2xl text-xl focus:border-primary outline-none"
                  />
                  {replyTo && (
                    <p className="text-right text-gray-600 mt-2">
                      Replying to <strong>{replyTo.username}</strong> <button onClick={() => setReplyTo(null)} className="text-red-600 ml-2">Cancel</button>
                    </p>
                  )}
                  <button type="submit" className="mt-6 bg-primary text-white px-12 py-6 rounded-2xl text-2xl font-bold hover:bg-green-700 shadow-xl">
                    Post Comment
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Forum;