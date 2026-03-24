export class BookSearchResultDto {
  externalId: string;
  title: string;
  author: string | null;
  coverUrl: string | null;
  firstPublishYear: number | null;
}
