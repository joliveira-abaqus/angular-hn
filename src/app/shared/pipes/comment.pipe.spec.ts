import { CommentPipe } from './comment.pipe';

describe('CommentPipe', () => {
  let pipe: CommentPipe;

  beforeEach(() => {
    pipe = new CommentPipe();
  });

  it('deve ser criado', () => {
    expect(pipe).toBeTruthy();
  });

  it('deve usar o singular para exatamente 1 comentário', () => {
    expect(pipe.transform(1)).toBe('1 comment');
  });

  it('deve usar o plural para mais de 1 comentário', () => {
    expect(pipe.transform(2)).toBe('2 comments');
    expect(pipe.transform(150)).toBe('150 comments');
  });

  it('deve retornar "discuss" quando não há comentários', () => {
    expect(pipe.transform(0)).toBe('discuss');
  });

  it('deve retornar "discuss" para valores negativos', () => {
    expect(pipe.transform(-5)).toBe('discuss');
  });

  it('deve retornar "discuss" para entradas nulas ou indefinidas', () => {
    expect(pipe.transform(null)).toBe('discuss');
    expect(pipe.transform(undefined)).toBe('discuss');
  });

  it('deve retornar "discuss" para NaN', () => {
    expect(pipe.transform(NaN)).toBe('discuss');
  });
});
