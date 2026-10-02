import { request } from '@shared/api';
import { enrichPost } from '../lib/enrichPost';
import type { Post } from '../model/types';

type PostDto = {
  id: number;
  userId: number;
  title: string;
  body: string;
};

const toPost = (dto: PostDto): Post => ({ ...dto, ...enrichPost(dto.id) });

export const getPosts = async (): Promise<Post[]> =>
  (await request<PostDto[]>('/posts')).map(toPost);

export const getPost = async (id: number): Promise<Post> =>
  toPost(await request<PostDto>(`/posts/${id}`));
