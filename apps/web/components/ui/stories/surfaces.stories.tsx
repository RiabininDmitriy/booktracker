import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Badge } from '../badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card';
import { Drawer } from '../drawer';
import { Modal } from '../modal';
import { Toast } from '../toast';

const meta = {
  title: 'UI/Surfaces',
  parameters: {
    layout: 'centered',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const CardExample: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Card title</CardTitle>
        <CardDescription>Simple surface token preview.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-2">
        <Badge variant="info">Info</Badge>
        <Badge variant="success">Success</Badge>
      </CardContent>
    </Card>
  ),
};

export const ToastExample: Story = {
  render: () => (
    <Toast title="Saved" message="Your changes were successfully stored." variant="success" />
  ),
};

export const ModalExample: Story = {
  render: () => (
    <Modal description="You can wire actions later." open title="Delete review?">
      <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
    </Modal>
  ),
};

export const DrawerExample: Story = {
  render: () => (
    <Drawer description="Quick settings panel." open title="Filters" side="right">
      <p className="text-sm text-muted-foreground">Use this as a mobile filter drawer.</p>
    </Drawer>
  ),
};
