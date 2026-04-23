import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import FormField from '@/components/ui/form-field';

describe('FormField', () => {
  it('renders the label and fires onChangeText when the user types', () => {
    const onChangeText = jest.fn();
    const { getByText, getByLabelText } = render(
      <FormField label="Username" value="" onChangeText={onChangeText} />
    );

    // The label should appear on screen
    expect(getByText('Username')).toBeTruthy();

    // Simulate the user typing into the field. The input is reachable by its
    // accessibility label which I set to match the field label.
    fireEvent.changeText(getByLabelText('Username'), 'colin');
    expect(onChangeText).toHaveBeenCalledWith('colin');
  });

  it('uses the placeholder if I pass one', () => {
    const { getByPlaceholderText } = render(
      <FormField
        label="Email"
        value=""
        onChangeText={() => {}}
        placeholder="you@example.com"
      />
    );

    expect(getByPlaceholderText('you@example.com')).toBeTruthy();
  });
});
