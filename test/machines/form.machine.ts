import { text, submit } from '../../src/fields';
import { form } from '../../src/form';

// consider building a form like you would manually, but using object functions instead.
// Imagine having a composition function, for every field type, textarea, dropdowns etc
// and people can send the events however/whenever they like. This allows for
// greater flexibility via composable forms. If they really need something custom,
// they could always just hand code a field exactly how they want.
//
// It means a UI library would send a CHANGE msg onChange, or SUBMIT onClick. Enabling React,
// Vue, Angular or possibly react native integration. It means users can build forms, run tests
// independant of UI, for rapid development and bug fixing. TDD forms if you like 😀
//
// Am sure David would have an idea about model based form testing that could be applied.

export const buildMachine = (): any => {
  return form({
    fields: {
      username: text('username'), //todo, provide method to extend field actions
      password: text('password'),
      // ...
      submitForm: submit('submitForm'),
    },
    initialValues: {
      username: 'jaetask',
    },
  });
};
