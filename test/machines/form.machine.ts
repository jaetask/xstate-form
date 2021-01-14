import { assign } from 'xstate';
import { raise } from 'xstate/lib/actions';

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

// const removeValue = (name: string): any =>
//   assign({
//     values: ({ values }: any) => {
//       if (values[name]) {
//         // todo: set back to default value (if there is one)...
//         delete values[name];
//       }
//       return values;
//     },
//   });

const resetValue = (name: string): any =>
  assign({
    values: (context: any) => {
      if (context.values[name]) {
        // todo: set back to default value (if there is one)...
        context.values[name] = context?.initialValues[name] || undefined;
      }
      return context.values;
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

const text = (name: string) => ({
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
          },
        },
        unfocused: {
          on: {
            FOCUS: {
              target: 'focused',
              cond: condIsEnabled(name),
            },
          },
        },
      },
      on: {
        RESET: {
          target: 'focus.unfocused',
          actions: [resetValue(name), untouch(name)],
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

const submit = (name: string) => ({
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
            CLICK: {
              actions: [raise('SUBMIT')],
              cond: condIsEnabled(name),
            },
          },
        },
        unfocused: {
          on: {
            FOCUS: {
              target: 'focused',
              cond: condIsEnabled(name),
            },
          },
        },
      },
      on: {
        RESET: {
          target: 'focus.unfocused',
          actions: [],
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

const resettingState = () => ({
  after: {
    250: 'form',
  },
});

const submittingState = () => ({
  after: {
    1000: 'submitted',
  },
});

// who knows how the project will want to handle this?
// some may want a single submit, some may want RETRY capability..
const submittedState = () => ({
  after: {
    2500: 'form',
  },
});

/**
 * Composable forms:
 * ----------------
 * Forms are generally either being filled in, resetting, submitting or submitted. There
 * may be other states such as recalculating, but this is a user specific case.
 *
 * By providing this default machine, users are free to roll thier own and just use
 * parts that they need.
 *
 * Each state should be overridable, allowing maximum flexibility, such as async submitting via an
 * invoke service (or whatever). All forms will need initialValues, touched, errors, values and
 * schema context items.
 */
const form = ({
  fields = {},
  initialValues = {},
  additionalStates = {}, // enable users to expand the states for things like RETRY!
  resetting = resettingState(),
  submitting = submittingState(),
  submitted = submittedState(),
}): any => {
  return {
    id: 'xstateForm',
    initial: 'form',
    context: {
      initialValues,
      touched: {},
      errors: {},
      values: {},
      schema: undefined,
    },
    states: {
      // Each field is a parallel state,
      // todo: Does this support nesting? tabbed forms etc? Can fields be grouped? i.e. radios?
      form: {
        type: 'parallel',
        states: fields,
        on: {
          SUBMIT: 'submitting',
          RESET: 'resetting',
        },
      },
      // does having this state affect the form fields RESET ability?
      resetting,
      submitting,
      submitted,
      ...additionalStates,
    },
  };
};

// Build shape is starting to take place.
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
