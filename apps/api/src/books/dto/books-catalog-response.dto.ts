import { BooksCatalogItemDto } from './books-catalog-item.dto';

export class BooksCatalogResponseDto {
  items: BooksCatalogItemDto[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
