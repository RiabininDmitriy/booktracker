import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Badge } from '../badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card';

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Atomic Habits</CardTitle>
        <CardDescription>Lightweight surface with semantic tokens.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-2">
        <Badge variant="info">In progress</Badge>
      </CardContent>
    </Card>
  ),
};
