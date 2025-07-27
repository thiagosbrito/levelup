import { render } from '@testing-library/react-native';
import React from 'react';
import { ThemedText } from '../ThemedText';

describe('ThemedText', () => {
  it('renders correctly with default props', () => {
    const { getByText } = render(<ThemedText>Hello World</ThemedText>);
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('renders with title type', () => {
    const { getByText } = render(
      <ThemedText type="title">Title Text</ThemedText>
    );
    const element = getByText('Title Text');
    expect(element).toBeTruthy();
  });

  it('renders with subtitle type', () => {
    const { getByText } = render(
      <ThemedText type="subtitle">Subtitle Text</ThemedText>
    );
    const element = getByText('Subtitle Text');
    expect(element).toBeTruthy();
  });

  it('renders with defaultSemiBold type', () => {
    const { getByText } = render(
      <ThemedText type="defaultSemiBold">Bold Text</ThemedText>
    );
    const element = getByText('Bold Text');
    expect(element).toBeTruthy();
  });

  it('renders with link type', () => {
    const { getByText } = render(
      <ThemedText type="link">Link Text</ThemedText>
    );
    const element = getByText('Link Text');
    expect(element).toBeTruthy();
  });

  it('applies custom style', () => {
    const customStyle = { fontSize: 20 };
    const { getByText } = render(
      <ThemedText style={customStyle}>Styled Text</ThemedText>
    );
    const element = getByText('Styled Text');
    expect(element).toBeTruthy();
  });

  it('forwards other props to Text component', () => {
    const { getByText } = render(
      <ThemedText testID="themed-text">Test Text</ThemedText>
    );
    const element = getByText('Test Text');
    expect(element).toBeTruthy();
  });
});
