import { condFieldName, condIsEnabled, condIsVisible, condIsTouched, conditionsAll } from '../conditions';
import { resetValue, touch, value, untouch, validate, currentFocus, clearCurrentFocus } from '../form';

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
              actions: [validate(name), clearCurrentFocus()],
              cond: condFieldName(name),
            },
            CHANGE: {
              actions: [value(name), touch(name), validate(name)],
              cond: conditionsAll([condFieldName(name), condIsEnabled(name)]),
            },
            FOCUS: {
              target: 'unfocused',
              actions: currentFocus(name),
              cond: !condFieldName(name),
            },
          },
        },
        unfocused: {
          on: {
            FOCUS: {
              target: 'focused',
              actions: currentFocus(name),
              cond: conditionsAll([condFieldName(name), condIsEnabled(name), condIsVisible(name)]),
            },
          },
        },
      },
      on: {
        RESET: {
          target: 'focus.unfocused',
          actions: [resetValue(name), untouch(name), validate(name), clearCurrentFocus()],
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
          on: {
            INVALID: {
              target: 'invalid',
              cond: conditionsAll([condFieldName(name), condIsTouched(name)]),
            },
          },
        },
        invalid: {
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
    meta: {
      field: {
        type: 'text',
      },
    },
  },
});

export default text;
