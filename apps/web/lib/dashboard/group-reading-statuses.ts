import type { DashboardReadingItem } from '@/lib/store/api/dashboard-api';

type GroupedReadingStatuses = {
  planned: DashboardReadingItem[];
  reading: DashboardReadingItem[];
  completed: DashboardReadingItem[];
};

export function groupReadingStatuses(
  items: DashboardReadingItem[] | undefined
): GroupedReadingStatuses {
  const grouped: GroupedReadingStatuses = {
    planned: [],
    reading: [],
    completed: [],
  };

  for (const item of items ?? []) {
    grouped[item.status].push(item);
  }

  return grouped;
}
