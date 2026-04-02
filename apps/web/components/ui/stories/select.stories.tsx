import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Select } from '../select';

const meta = {
  title: 'UI/Select',
  component: Select,
  args: {
    defaultValue: 'reading',
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-72">
      <Select {...args}>
        <option value="reading">Reading</option>
        <option value="planned">Planned</option>
        <option value="completed">Completed</option>
      </Select>
    </div>
  ),
};
