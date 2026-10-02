import { faker } from '@faker-js/faker/locale/base';

export const THUMBNAIL_SIZE = 32;
export const IMAGE_SIZE = 300;

const imageUrl = (postId: number, size: number) => {
  faker.seed(postId);
  return faker.image.url({ width: size, height: size });
};

export const enrichPost = (postId: number) => ({
  thumbnailUrl: imageUrl(postId, THUMBNAIL_SIZE),
  imageUrl: imageUrl(postId, IMAGE_SIZE),
});
