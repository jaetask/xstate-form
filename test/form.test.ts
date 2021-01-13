import { Machine, interpret, assign } from 'xstate';
import * as Yup from 'yup';
import { buildMachine } from './machines/form.machine';

// scratch pad - all in one file

// credit to Formik for this function, add to docs
// this might not match what I want, test and see..
function yupToFormErrors(validated: any, touched: any) {
  let errors: { [key: string]: any } | null = {};
  if (Array.isArray(validated.inner) && validated.inner.length) {
    validated.inner.forEach((validationError: any) => {
      const field = validationError.path;
      if (touched[field]) {
        errors![field] = validationError?.errors[0] || '';
      } else if (errors![field]) {
        delete errors![field];
      }
    });
  } else if (Array.isArray(validated.errors) && validated.errors.length) {
    // console.log('validated', validated);
    const { message = '', path: field } = validated;
    if (touched[field]) {
      errors![field] = message;
    }
  }

  return errors;
}

const schema = Yup.object({
  query: Yup.string()
    .min(2)
    .required(),
});

const form = (machineConfig: any, machineOptions: any, schema: any) => {
  let state = null;
  let errors: { [key: string]: string } = {};
  const machine = Machine(machineConfig, machineOptions);
  const service = interpret(machine);

  service.onTransition(currentState => {
    if (currentState.changed) {
      state = currentState;
      try {
        schema.validateSync(state.context);
        errors = {};
      } catch (formErrors) {
        errors = yupToFormErrors(formErrors, touched);
        console.log('fomr->errors', errors);
      }
    }
  });

  service.start();

  const touched: { [key: string]: boolean } = {};
  const hasError = (fieldPath: string): boolean =>
    errors[fieldPath] === undefined ? false : true;
  const isTouched = (fieldPath: string): boolean =>
    touched[fieldPath] !== undefined;
  const isInvalid = (fieldPath: string): boolean =>
    hasError(fieldPath) && isTouched(fieldPath);
  const error = (fieldPath: string): string | undefined =>
    errors[fieldPath] === undefined ? undefined : errors[fieldPath];
  const touch = (fieldPath: string): void => {
    touched[fieldPath] = true;
  };

  const validator = {
    errors,
    error,
    hasError,
    isInvalid,
    isTouched,
    touch,
  };

  return { state, send: service.send, service, validator };
};

describe.skip('form', () => {
  it('can exist', () => {
    const machine = {
      id: 'toggle',
      initial: 'idle',
      context: {
        query: '',
      },
      states: {
        idle: {
          on: {
            FORM_QUERY: {
              actions: assign({ query: (_c: any, e: any): any => e.value }),
            },
          },
        },
      },
    };

    // i would like the validator to be passed out here,
    // but also updated on every state change, so that validator.hasError() can be called
    // and be truthful to the state
    // the thing is.. touched/errors etc ARE states,
    // should they be a machine?
    const { send, service, validator } = form(machine, {}, schema);

    service.onTransition((current: any) => {
      if (current.changed) {
        // console.log(current);
        console.log('validator', validator.errors);
      }
    });

    send('FORM_QUERY', { value: '1' }); // nothing happens

    // now touch the item
    validator.touch('query');
    send('FORM_QUERY', { value: '3' });
    console.log('validator', validator);

    // there's some conflict here between a programmatic interface and
    // a MSG based interface.
    // Could all of this be represented by a machine?
    // could the actual form just send messages to the form machine?
    // is there a generic way to do this?
  });
});

describe('xstate->form', () => {
  it('does stuff', () => {
    const machineConfig = buildMachine();
    // console.log('username', machine.states.username);
    // console.log('password', machine.states.password);

    const machine = Machine(machineConfig);
    const service = interpret(machine);

    service.start();
    const send = service.send;

    service.onTransition((current: any) => {
      console.log(current.context);
      if (
        current.event.type === 'CHANGE' &&
        current.history.event.type === 'DISABLE'
      ) {
        // console.log(current.value);
        //expect(current.context.values.username).toEqual('123');
      }
    });

    // lets focus and send some values to the username filed
    send('FOCUS', { fieldName: 'username' });
    send('CHANGE', { fieldName: 'username', value: '123' });

    // disable the field and send update
    send('DISABLE', { fieldName: 'username' });
    send('CHANGE', { fieldName: 'username', value: 'shouldnotbeset' });
    send('RESET');
  });
});
