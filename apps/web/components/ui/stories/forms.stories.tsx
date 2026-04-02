import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Checkbox } from '../checkbox';
import { Input } from '../input';
import { Select } from '../select';
import { Textarea } from '../textarea';

const meta = {
  title: 'UI/Forms',
  parameters: {
    layout: 'centered',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Controls: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <Input placeholder="Email address" />
      <Select defaultValue="reading">
        <option value="reading">Reading</option>
        <option value="planned">Planned</option>
        <option value="completed">Completed</option>
      </Select>
      <Textarea placeholder="Write a short review..." />
      <label className="inline-flex items-center gap-2 text-sm text-foreground">
        <Checkbox />
        Remember me
      </label>
    </div>
  ),
};
