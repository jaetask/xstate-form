import { assign } from 'xstate';

// consider building a form like you would manually, but using object functions instead.
// Imagine having a composition function, for every field type, textarea, dropdowns etc
// and people can send the events however/whenever they like. This allows for
// greater flexibility, and composable forms. If they really need something custom,
// they could always just hand code a field exactly how they want.

const value = (name: string): any =>
  assign({
    values: ({ values }: any, e: any) => {
      values[name] = e.value;
      return values;
    },
  });

const removeValue = (name: string): any =>
  assign({
    values: ({ values }: any) => {
      if (values[name]) {
        // todo: set back to default value (if there is one)...
        delete values[name];
      }
      return values;
    },
  });

const touch = (name: string): any =>
  assign({
    touched: ({ touched }: any) => {
      touched[name] = true;
      return touched;
    },
  });

const untouch = (name: string): any =>
  assign({
    touched: ({ touched }: any) => {
      if (touched[name]) {
        delete touched[name];
      }
      return touched;
    },
  });

const condFieldName = (name: string): any => (_: any, e: any) => e.fieldName === name;

const condIsEnabled = (name: string): any => (_: any, e: any, m: any) =>
  e.fieldName === name && m.state.matches(`form.${name}.enable.enabled`);

const textField = (name: string) => ({
  id: name,
  type: 'parallel',
  states: {
    focus: {
      initial: 'unfocused',
      states: {
        focused: {
          on: {
            BLUR: {
              target: 'unfocused',
              cond: condFieldName(name),
            },
            CHANGE: {
              actions: [value(name), touch(name)],
              cond: condIsEnabled(name),
            },
            RESET: {
              internal: true,
              target: 'unfocused',
              actions: [removeValue(name), untouch(name)],
            },
          },
        },
        unfocused: {
          on: {
            FOCUS: {
              target: 'focused',
              cond: condIsEnabled(name),
            },
            RESET: {
              internal: true,
              target: 'unfocused',
              actions: [removeValue(name), untouch(name)],
            },
          },
        },
      },
    },
    enable: {
      initial: 'enabled',
      states: {
        enabled: {
          on: {
            DISABLE: {
              target: ['disabled', `#${name}.focus.unfocused`],
              cond: condFieldName(name),
            },
          },
        },
        disabled: {
          on: {
            ENABLE: {
              target: 'enabled',
              cond: condFieldName(name),
            },
          },
        },
      },
    },
  },
});

// todo : default values for context, could we just use withContext? do we want to expose that?
export const buildMachine = (): any => ({
  id: 'formMachine',
  initial: 'form',
  context: {
    touched: {},
    errors: {},
    values: {
      def: 9000,
      someValue: 10000,
      username: 'jaetask',
    },
    schema: undefined,
  },

  /**
   * Composable forms:
   * ----------------
   *
   * maybe the form fields are a substate of the machine anyway, forms are always either, idling,
   * resetting, submitting or submitted.
   *
   * And each one of the form 'states' will be a function returning an object, users can then
   * decide if/how they want to override core usage. This allows for the most flexibility. We give guidelines
   * but they can be ignored if required
   *
   * states: {
   *   idle: {
   *      type: 'parallel',
   *      states: {
   *        username: textField('username'),
   *        password: textField('password'),
   *        ...
   *      },
   *   },
   *
   *   resetting: resetting(),
   *
   *   submitting: submitting() || submittingAsync()  // user could then invoke as async service if required.
   *
   *   submitted: submitted() // could allow transition back to idle, or even a reset? depends on scenario/user
   * }
   *
   *
   * If someone needs to perform calculations, then this would be on an event or something changes,
   * so they can do this using chained actions.
   */
  states: {
    // this is the object they would pass in to our formBuilder function, ⬆ would be internal
    // each form element is a parallel state,
    // todo: does this support nesting?
    // tabbed forms etc?
    // can fields be grouped? i.e. radios?
    form: {
      type: 'parallel',
      states: {
        username: textField('username'),
        password: textField('password'),
      },
    },
    resetting: {},
    submitting: {},
    submitted: {},
  },
});
