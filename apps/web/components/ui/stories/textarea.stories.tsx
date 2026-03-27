import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Textarea } from '../textarea';

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  args: {
    placeholder: 'Write your notes...',
    disabled: false,
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Filled: Story = { args: { defaultValue: 'Great pacing and characters.' } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 'Disabled textarea' } };
