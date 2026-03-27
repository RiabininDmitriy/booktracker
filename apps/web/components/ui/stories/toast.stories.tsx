import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Toast } from '../toast';

const meta = {
  title: 'UI/Toast',
  component: Toast,
  args: {
    title: 'Saved',
    message: 'Your changes were successfully stored.',
    variant: 'info',
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {};
export const Success: Story = { args: { variant: 'success', title: 'Success' } };
export const Warning: Story = { args: { variant: 'warning', title: 'Warning' } };
export const Danger: Story = { args: { variant: 'danger', title: 'Error' } };
