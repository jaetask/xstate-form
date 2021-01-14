import { text, submit } from '../../src/fields';
import { form } from '../../src/form';

// consider building a form like you would manually, but using object functions instead.
// Imagine having a composition function, for every field type, textarea, dropdowns etc
// and people can send the events however/whenever they like. This allows for
// greater flexibility, and composable forms. If they really need something custom,
// they could always just hand code a field exactly how they want.

export const buildMachine = (): any => {
  return form({
    fields: {
      username: text('username'),
      password: text('password'),
      // ...
      submitForm: submit('submitForm'),
    },
    initialValues: {
      username: 'jaetask',
    },
  });
};
