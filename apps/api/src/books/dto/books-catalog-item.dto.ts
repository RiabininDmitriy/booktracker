export class BooksCatalogItemDto {
  id: string;
  externalId: string;
  title: string;
  author: string | null;
  coverUrl: string | null;
  avgRating: number | null;
  reviewCount: number;
  createdAt: Date;
}
