import { assign, sendParent } from 'xstate';
import { condFieldName, conditionsAll } from '../conditions';
import { clearCurrentFocus, resetValue } from '../form';

// todo, change to an object of params for labels, initialValue etc
interface TextField {
  name: string;
  validator?: any | null;
}

const text = ({ name = '', validator = null }: TextField): any => ({
  id: name,
  type: 'parallel',
  context: {
    value: 'jaetask', // fields values are private
    validator,
    errors: {},
  },
  states: {
    touch: {
      initial: 'untouched',
      states: {
        untouched: {
          on: {
            BLUR: {
              target: 'touched',
              cond: condFieldName(name),
            },
          },
        },
        touched: {
          on: {
            RESET: {
              target: 'untouched',
            },
          },
        },
      },
    },
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
              actions: [
                assign({
                  value: (_: any, e: any) => e.value,
                }),
              ],
              cond: conditionsAll([condFieldName(name)]),
            },
            FOCUS: {
              target: 'unfocused',
              cond: !condFieldName(name),
            },
          },
        },
        unfocused: {
          on: {
            FOCUS: {
              target: 'focused',
              cond: conditionsAll([condFieldName(name)]),
            },
          },
        },
      },
      on: {
        RESET: {
          target: 'focus.unfocused',
          actions: [resetValue(name), clearCurrentFocus()],
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
    visible: {
      initial: 'visible',
      states: {
        visible: {
          on: {
            INVISIBLE: {
              target: ['invisible', `#${name}.focus.unfocused`],
              cond: condFieldName(name),
            },
          },
        },
        invisible: {
          on: {
            VISIBLE: {
              target: 'visible',
              cond: condFieldName(name),
            },
          },
        },
      },
    },
    valid: {
      initial: 'valid',
      states: {
        valid: {
          entry: assign({ errors: {} }),
          on: {
            INVALID: {
              target: 'invalid',
              cond: conditionsAll([condFieldName(name)]),
            },
          },
        },
        invalid: {
          entry: assign({ errors: (_, e: any) => e.errors }),
          on: {
            VALID: {
              target: 'valid',
              cond: condFieldName(name),
            },
          },
        },
      },
      on: {
        RESET: {
          target: 'valid.valid',
          actions: [],
        },
      },
    },
    pristine: {
      initial: 'pristine',
      states: {
        pristine: {
          on: {
            CHANGE: {
              target: 'dirty',
              cond: condFieldName(name),
            },
          },
        },
        dirty: {
          on: {
            RESET: {
              target: 'pristine',
            },
          },
        },
      },
    },
    validator: {
      initial: 'idle',
      states: {
        idle: {},
        validating: {
          invoke: {
            id: `${name}Validator`,
            src: (context: any, event: any) => async (callback: any) => {
              if (validator) {
                const errors = await validator(context, event);
                if (Object.keys(errors).length) {
                  callback({ type: 'INVALID', fieldName: name, errors });
                  callback({ type: 'VALIDATION_RESULT', fieldName: name, errors });
                  return;
                }
              }
              callback({ type: 'VALID', fieldName: name, errors: {} });
              callback({ type: 'VALIDATION_RESULT', fieldName: name, errors: {} });
            },
          },
          on: {
            VALIDATION_RESULT: {
              target: 'idle',
              actions: sendParent((_c: any, e: any) => e),
            },
          },
        },
      },
      on: {
        VALIDATE: '.validating',
      },
    },
  },
  meta: {
    field: {
      type: 'text',
      // todo: fill this from the forms intiial values, will be used to detect pristine/dirty
      initialValue: '',
    },
  },
});

export default text;
