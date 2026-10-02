import { enrichPost } from '../../src/entities/post/lib/enrichPost';

const pictureSeed = (url: string) => url.split('/seed/')[1].split('/')[0];

describe('enrichPost', () => {
  it('returns a 32x32 thumbnail and a 300x300 image', () => {
    const { thumbnailUrl, imageUrl } = enrichPost(1);
    expect(thumbnailUrl).toMatch(/\/32\/32$/);
    expect(imageUrl).toMatch(/\/300\/300$/);
  });

  it('shows the same picture at both sizes', () => {
    const { thumbnailUrl, imageUrl } = enrichPost(7);
    expect(pictureSeed(thumbnailUrl)).toBe(pictureSeed(imageUrl));
  });

  it('is stable for a post and differs between posts', () => {
    expect(enrichPost(3)).toEqual(enrichPost(3));
    expect(enrichPost(3).imageUrl).not.toBe(enrichPost(4).imageUrl);
  });
});
