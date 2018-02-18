import { bindState } from 'react-form-base';

export function bindDialogState(component, key = 'form') {
  return {
    ...bindState(component, key),
    open: Boolean(component.state && component.state[`${key}Open`])
  };
}
