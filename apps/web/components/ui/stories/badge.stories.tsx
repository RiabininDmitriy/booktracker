import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Badge } from '../badge';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  args: {
    children: 'Badge',
    variant: 'default',
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Info: Story = { args: { variant: 'info', children: 'Info' } };
export const Success: Story = { args: { variant: 'success', children: 'Success' } };
export const Warning: Story = { args: { variant: 'warning', children: 'Warning' } };
