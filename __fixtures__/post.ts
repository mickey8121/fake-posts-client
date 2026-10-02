import type { Post } from '@entities/post';

export const makePost = (id: number): Post => ({
  id,
  userId: 1,
  title: `title ${id}`,
  body: `body ${id}`,
  thumbnailUrl: `https://example.test/${id}/32`,
  imageUrl: `https://example.test/${id}/300`,
});
