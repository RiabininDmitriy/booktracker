import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from '../button';
import { Modal } from '../modal';

const meta = {
  title: 'UI/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  args: {
    open: true,
    title: 'Delete review?',
    description: 'This action cannot be undone.',
    children: (
      <p className="text-sm text-muted-foreground">
        You are about to permanently remove this review.
      </p>
    ),
    footer: (
      <>
        <Button size="sm" variant="ghost">
          Cancel
        </Button>
        <Button size="sm" variant="danger">
          Delete
        </Button>
      </>
    ),
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
