import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Input } from '../input';

const meta = {
  title: 'UI/Input',
  component: Input,
  args: {
    placeholder: 'Enter email',
    type: 'text',
    disabled: false,
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Email: Story = { args: { type: 'email', placeholder: 'name@example.com' } };
export const Disabled: Story = { args: { disabled: true, value: 'Disabled input' } };
