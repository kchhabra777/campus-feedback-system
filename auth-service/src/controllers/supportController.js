import prisma from '../lib/prisma.js';

export const getPosts = async (req, res, next) => {
  try {
    const posts = await prisma.supportPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            studentProfile: { select: { fullName: true, batch: true, branch: true } },
            teacherProfile: { select: { fullName: true, department: true } },
          }
        },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: {
                id: true,
                studentProfile: { select: { fullName: true, batch: true } },
                teacherProfile: { select: { fullName: true } }
              }
            }
          }
        }
      }
    });

    res.json({ posts });
  } catch (error) {
    next(error);
  }
};

export const createPost = async (req, res, next) => {
  try {
    const { content, isAnonymous } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Post content cannot be empty' });
    }

    const post = await prisma.supportPost.create({
      data: {
        content,
        isAnonymous: Boolean(isAnonymous),
        authorId: userId,
      }
    });

    res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    next(error);
  }
};

export const upvotePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await prisma.supportPost.update({
      where: { id },
      data: {
        upvotes: { increment: 1 }
      }
    });

    res.json({ message: 'Post upvoted', post });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, isAnonymous } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content cannot be empty' });
    }

    const comment = await prisma.supportComment.create({
      data: {
        content,
        isAnonymous: Boolean(isAnonymous),
        authorId: userId,
        postId: id
      }
    });

    res.status(201).json({ message: 'Comment added successfully', comment });
  } catch (error) {
    next(error);
  }
};
