import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeatureCard } from './FeatureCard';

describe('FeatureCard', () => {
  it('renders the icon correctly', () => {
    render(
      <FeatureCard
        icon="🎮"
        title="Test Feature"
        description="This is a test description"
        href="/test"
      />
    );

    expect(screen.getByText('🎮')).toBeInTheDocument();
  });

  it('renders the title correctly', () => {
    render(
      <FeatureCard
        icon="🎮"
        title="Test Feature"
        description="This is a test description"
        href="/test"
      />
    );

    expect(screen.getByText('Test Feature')).toBeInTheDocument();
  });

  it('renders the description correctly', () => {
    render(
      <FeatureCard
        icon="🎮"
        title="Test Feature"
        description="This is a test description"
        href="/test"
      />
    );

    expect(screen.getByText('This is a test description')).toBeInTheDocument();
  });

  it('renders as a link with correct href', () => {
    render(
      <FeatureCard
        icon="🎮"
        title="Test Feature"
        description="This is a test description"
        href="/test"
      />
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/test');
  });

  it('applies hover styles on group hover', () => {
    const { container } = render(
      <FeatureCard
        icon="🎮"
        title="Test Feature"
        description="This is a test description"
        href="/test"
      />
    );

    const link = container.querySelector('a');
    expect(link).toHaveClass('group');
  });
});
