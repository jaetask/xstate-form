# xstate-form

## Alpha

This module is currently in alpha

- Under continuous develoment
- API is not guaranteed
- Rapid prototyping may cause bugs and/or inconsistencies

## React example

This core library is in parallel development with a `React` [example repo](https://github.com/jaetask/example-forms) which also contains a `useFormMachine` hook.

### API

The current create form api looks like this

```js
import { form, fields } from 'xstate-form';

const machine = form({
  id: 'myAwesomeForm',
  fields: [
    fields.text({ name: 'username' }),
    fields.text({ name: 'password' }),
    // ...
    fields.submit({ name: 'submitForm' }),
  ],
  initialValues: {
    username: 'jaetask',
    password: 'ThisIsTheWay',
  },
});
```

The `machine` const is now an `xstate` compliant machine configuration object that can be passed to `useMachine` or `interpret`. The various form fields e.g. (`form.text()`) return a state object with default event handling, actions and state transitions.

Here's an example of the `text` state node.
_simplified for berevity_

```js
{
  id: name,
  type: 'parallel',
  states: {
    focus: {
      initial: 'unfocused',
      states: {
        focused: {
          on: {
            BLUR: {},
            CHANGE: {},
            FOCUS: {},
          },
        },
        unfocused: {
          on: {
            FOCUS: {},
          },
        },
      },
    },
    enable: {
      // ...
    },
    visible: {
      // ...
    },
    valid: {
      // ...
    },
    meta: {
      field: {
        type: 'text',
      },
    },
  },
});
```

_note: we don't currently use the `meta.field.type` but think this is a good idea for future use, form generation, testing etc_

- Fields are named via `StateNode.id`, allows referencing in actions
- Ticket to allow [passing meta data](https://github.com/jaetask/xstate-form/projects/1#card-52969608) to fields

## Validation

> Validation API currently in flux

Currently loking at a way to make all fields self validate and post status back to parent. Fields as `Actors`

---

Form validation works via a simple JS function, (this enables any validation library, including `Yup` to be used by the user). There is a [ticket](https://github.com/jaetask/xstate-form/projects/1#card-52968847) to add Yup integration by default via `validationSchema`

```js
import { form, fields } from 'xstate-form';

const machine = form({
  id: 'myAwesomeForm',
  validate: (values, event, meta, name) => {
    const errors = {};
    if (values.username.match(/[0-9]+/g)) {
      errors.username = 'Username cannot include a number';
    }
    if (values.password.length <= 8) {
      errors.password = 'Password must be > 8 chars';
    }
    return errors;
  },
  fields: [
    fields.text({ name: 'username' }),
    fields.text({ name: 'password' }),
    // ...
    fields.submit({ name: 'submitForm' }),
  ],
  initialValues: {
    username: 'jaetask',
    password: 'ThisIsTheWay',
  },
});
```

Validation works on every `CHANGE`, `FOCUS` and `BLUR` event, this is similar to other form libraries, there will also be a `VALIDATE` method to explicitly trigger validation yourself. [see ticket](https://github.com/jaetask/xstate-form/projects/1#card-52969369)

## 80/20 Rule

> There are probably as many forms as programmers

The desire is to keep the API as clean as possible, so we will always use the 80/20 rule when deciding on features. If a request fits 80% of usecases then it will be considered.

The API is a set of composable functions to help you build an `xstate` machine to handle forms. The idea is to take what you need and leave the rest, if you need an unsupported feature, feel free to copy/modify one of ours and roll your own for that specific scenario.

This approach should keep the API light, clean and easy to use.

## Typescript

This is my first typescript project, please ignore the `any` params at the moment, especially during rapid prototyping, the API will get stricter over time, promise 😂.
