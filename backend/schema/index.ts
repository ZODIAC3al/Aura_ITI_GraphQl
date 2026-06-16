import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/user';
import Post from '../models/post';
import Comment from '../models/comment';

export const typeDefs = `#graphql
  type User {
    id: ID!
    name: String
    email: String!
    posts: [Post!]!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    comments: [Comment!]!
    createdAt: String!
  }

  type Comment {
    id: ID!
    content: String!
    author: User!
    post: Post!
    createdAt: String!
  }

  type AuthResponse {
    token: String!
    user: User!
  }

  type Query {
    me: User
    
    # Retrieve all records
    getAllUsers: [User!]!
    getAllPosts: [Post!]!
    getAllComments: [Comment!]!
    
    # Retrieve specific record by ID
    getUserById(id: ID!): User
    getPostById(id: ID!): Post
    getCommentById(id: ID!): Comment
    
    # Relationship Queries
    getPostsByUser(userId: ID!): [Post!]!
    getUserByPost(postId: ID!): User
    getCommentsByPost(postId: ID!): [Comment!]!
    getPostByComment(commentId: ID!): Post
    
    # Compatibility queries
    posts: [Post!]!
    post(id: ID!): Post
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): AuthResponse!
    login(email: String!, password: String!): AuthResponse!
    logout: Boolean!

    # User CRUD Mutations
    addUser(name: String!, email: String!, password: String!): User!
    updateUser(id: ID!, name: String, email: String): User!
    deleteUser(id: ID!): Boolean!

    # Post CRUD Mutations
    addPost(title: String!, content: String!): Post!
    updatePost(id: ID!, title: String, content: String): Post!
    deletePost(id: ID!): Boolean!

    # Comment CRUD Mutations
    addComment(postId: ID!, content: String!): Comment!
    updateComment(id: ID!, content: String!): Comment!
    deleteComment(id: ID!): Boolean!
    
    # Compatibility mutations
    createPost(title: String!, content: String!): Post!
    createComment(postId: ID!, content: String!): Comment!
  }
`;

export const resolvers = {
    Query: {
        me: async (_: any, __: any, context: any) => {
            if (!context.user || !context.user.userId) {
                return null;
            }
            return await User.findById(context.user.userId);
        },
        getAllUsers: async () => {
            return await User.find();
        },
        getAllPosts: async () => {
            return await Post.find().sort({ createdAt: -1 });
        },
        getAllComments: async () => {
            return await Comment.find().sort({ createdAt: -1 });
        },
        getUserById: async (_: any, { id }: { id: string }) => {
            return await User.findById(id);
        },
        getPostById: async (_: any, { id }: { id: string }) => {
            return await Post.findById(id);
        },
        getCommentById: async (_: any, { id }: { id: string }) => {
            return await Comment.findById(id);
        },
        getPostsByUser: async (_: any, { userId }: { userId: string }) => {
            return await Post.find({ author: userId }).sort({ createdAt: -1 });
        },
        getUserByPost: async (_: any, { postId }: { postId: string }) => {
            const post = await Post.findById(postId);
            if (!post) return null;
            return await User.findById(post.author);
        },
        getCommentsByPost: async (_: any, { postId }: { postId: string }) => {
            return await Comment.find({ post: postId }).sort({ createdAt: 1 });
        },
        getPostByComment: async (_: any, { commentId }: { commentId: string }) => {
            const comment = await Comment.findById(commentId);
            if (!comment) return null;
            return await Post.findById(comment.post);
        },
        posts: async () => {
            return await Post.find().sort({ createdAt: -1 });
        },
        post: async (_: any, { id }: { id: string }) => {
            return await Post.findById(id);
        }
    },
    Mutation: {
        register: async (_: any, { name, email, password }: any, context: any) => {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new Error("Email already in use");
            }

            const user = new User({ name, email, password });
            await user.save();

            const token = jwt.sign(
                { userId: user._id },
                process.env.SECRET || 'secretkey',
                { expiresIn: '7d' }
            );

            if (context.res) {
                context.res.cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
                });
            }

            return { token, user };
        },
        login: async (_: any, { email, password }: any, context: any) => {
            const user: any = await User.findOne({ email });
            if (!user) {
                throw new Error("Invalid email or password");
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                throw new Error("Invalid email or password");
            }

            const token = jwt.sign(
                { userId: user._id },
                process.env.SECRET || 'secretkey',
                { expiresIn: '7d' }
            );

            if (context.res) {
                context.res.cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
                });
            }

            return { token, user };
        },
        logout: async (_: any, __: any, context: any) => {
            if (context.res) {
                context.res.clearCookie('token');
            }
            return true;
        },
        addUser: async (_: any, { name, email, password }: any) => {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new Error("Email already in use");
            }
            const user = new User({ name, email, password });
            return await user.save();
        },
        updateUser: async (_: any, { id, name, email }: any, context: any) => {
            if (!context.user || !context.user.userId) {
                throw new Error("Authentication required");
            }
            if (context.user.userId !== id) {
                throw new Error("Not authorized to update this user");
            }
            const user = await User.findById(id);
            if (!user) {
                throw new Error("User not found");
            }
            if (name !== undefined) user.name = name;
            if (email !== undefined) user.email = email;
            return await user.save();
        },
        deleteUser: async (_: any, { id }: any, context: any) => {
            if (!context.user || !context.user.userId) {
                throw new Error("Authentication required");
            }
            if (context.user.userId !== id) {
                throw new Error("Not authorized to delete this user");
            }
            await User.findByIdAndDelete(id);
            await Post.deleteMany({ author: id });
            await Comment.deleteMany({ author: id });
            if (context.res) {
                context.res.clearCookie('token');
            }
            return true;
        },
        addPost: async (_: any, { title, content }: any, context: any) => {
            if (!context.user || !context.user.userId) {
                throw new Error("Authentication required");
            }

            const post = new Post({
                title,
                content,
                author: context.user.userId,
                comments: []
            });

            return await post.save();
        },
        updatePost: async (_: any, { id, title, content }: any, context: any) => {
            if (!context.user || !context.user.userId) {
                throw new Error("Authentication required");
            }

            const post = await Post.findById(id);
            if (!post) {
                throw new Error("Post not found");
            }

            if (post.author.toString() !== context.user.userId) {
                throw new Error("Not authorized to update this post");
            }

            if (title !== undefined) post.title = title;
            if (content !== undefined) post.content = content;

            return await post.save();
        },
        deletePost: async (_: any, { id }: any, context: any) => {
            if (!context.user || !context.user.userId) {
                throw new Error("Authentication required");
            }

            const post = await Post.findById(id);
            if (!post) {
                throw new Error("Post not found");
            }

            if (post.author.toString() !== context.user.userId) {
                throw new Error("Not authorized to delete this post");
            }

            await Post.findByIdAndDelete(id);
            await Comment.deleteMany({ post: id });
            return true;
        },
        addComment: async (_: any, { postId, content }: any, context: any) => {
            if (!context.user || !context.user.userId) {
                throw new Error("Authentication required");
            }

            const post = await Post.findById(postId);
            if (!post) {
                throw new Error("Post not found");
            }

            const comment = new Comment({
                content,
                author: context.user.userId,
                post: postId
            });

            await comment.save();

            post.comments.push(comment._id as any);
            await post.save();

            return comment;
        },
        updateComment: async (_: any, { id, content }: any, context: any) => {
            if (!context.user || !context.user.userId) {
                throw new Error("Authentication required");
            }

            const comment = await Comment.findById(id);
            if (!comment) {
                throw new Error("Comment not found");
            }

            if (comment.author.toString() !== context.user.userId) {
                throw new Error("Not authorized to update this comment");
            }

            comment.content = content;
            return await comment.save();
        },
        deleteComment: async (_: any, { id }: any, context: any) => {
            if (!context.user || !context.user.userId) {
                throw new Error("Authentication required");
            }

            const comment = await Comment.findById(id);
            if (!comment) {
                throw new Error("Comment not found");
            }

            if (comment.author.toString() !== context.user.userId) {
                throw new Error("Not authorized to delete this comment");
            }

            await Comment.findByIdAndDelete(id);

            await Post.findByIdAndUpdate(comment.post, {
                $pull: { comments: id }
            });

            return true;
        },
        createPost: async (_: any, { title, content }: any, context: any) => {
            if (!context.user || !context.user.userId) {
                throw new Error("Authentication required");
            }

            const post = new Post({
                title,
                content,
                author: context.user.userId,
                comments: []
            });

            return await post.save();
        },
        createComment: async (_: any, { postId, content }: any, context: any) => {
            if (!context.user || !context.user.userId) {
                throw new Error("Authentication required");
            }

            const post = await Post.findById(postId);
            if (!post) {
                throw new Error("Post not found");
            }

            const comment = new Comment({
                content,
                author: context.user.userId,
                post: postId
            });

            await comment.save();

            post.comments.push(comment._id as any);
            await post.save();

            return comment;
        }
    },
    User: {
        posts: async (user: any) => {
            return await Post.find({ author: user._id }).sort({ createdAt: -1 });
        }
    },
    Post: {
        author: async (post: any) => {
            return await User.findById(post.author);
        },
        comments: async (post: any) => {
            return await Comment.find({ _id: { $in: post.comments } }).sort({ createdAt: 1 });
        }
    },
    Comment: {
        author: async (comment: any) => {
            return await User.findById(comment.author);
        },
        post: async (comment: any) => {
            return await Post.findById(comment.post);
        }
    }
};