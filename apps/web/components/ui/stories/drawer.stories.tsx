import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Drawer } from '../drawer';

const meta = {
  title: 'UI/Drawer',
  component: Drawer,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    open: true,
    title: 'Filters',
    description: 'Adjust list visibility and sorting.',
    side: 'right',
    children: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Sort by rating</p>
        <p>Only favorites</p>
      </div>
    ),
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Right: Story = {};
export const Left: Story = {
  args: {
    side: 'left',
  },
};
