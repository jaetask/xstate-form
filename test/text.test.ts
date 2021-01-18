import { Machine } from 'xstate';
// import * as Yup from 'yup';
import { buildMachine } from './machines/form.machine';
import { blur, change, disable, enable, focus, reset, visible, invalid, valid, invisible } from '../src/actions';
import { transitions } from './test-utils';

describe('text', () => {
  describe('initial values', () => {
    it('defaults to initial value', () => {
      const machineConfig = buildMachine();
      const machine = Machine(machineConfig);
      expect(machine.initialState.context.values.username).toEqual(machineConfig.context.initialValues.username);
    });
    it('defaults to initial value on reset', () => {
      const machineConfig = buildMachine();
      const machine = Machine(machineConfig);
      const name = 'username';
      const value = '0504094';
      let result = transitions(machine, [focus(name), change(name, value), blur(name)], machine.initialState);
      expect(result.context.values.username).toEqual(value);
      result = transitions(machine, [reset()], result);
      expect(result.matches('form.username.touch.untouched')).toBeTruthy();
    });
  });

  describe('enable', () => {
    it('ignores changes when disabled', () => {
      const machineConfig = buildMachine();
      const machine = Machine(machineConfig);
      const { username } = machineConfig.context.values;
      const result = transitions(
        machine,
        [focus('username'), disable('username'), change('username', '123')],
        machine.initialState
      );
      expect(result.context.values.username).toEqual(username);
    });

    it('allows changes after enabled and when focused', () => {
      const machineConfig = buildMachine();
      const machine = Machine(machineConfig);
      const result = transitions(
        machine,
        [disable('username'), enable('username'), focus('username'), change('username', '909090')],
        machine.initialState
      );
      expect(result.context.values.username).toEqual('909090');
    });

    it('ignores focus when disabled', () => {
      const machineConfig = buildMachine();
      const machine = Machine(machineConfig);
      const result = transitions(
        machine,
        [focus('username'), disable('username'), focus('username')],
        machine.initialState
      );
      expect(result.matches('form.username.focus.unfocused')).toBeTruthy();
    });

    it('loses focus when disabled', () => {
      const machineConfig = buildMachine();
      const machine = Machine(machineConfig);
      let result = transitions(machine, [focus('username')], machine.initialState);
      expect(result.matches('form.username.focus.focused')).toBeTruthy();
      result = transitions(machine, [disable('username')], result);
      expect(result.matches('form.username.focus.unfocused')).toBeTruthy();
    });
  });

  describe('focus', () => {
    it('ignores changes when unfocused', () => {
      const machineConfig = buildMachine();
      const machine = Machine(machineConfig);
      const { username } = machineConfig.context.values;
      const state = machine.transition(machine.initialState, change('username', '123'));
      expect(state.context.values.username).toEqual(username);
    });

    it('accepts changes when focused', () => {
      const machineConfig = buildMachine();
      const machine = Machine(machineConfig);
      const result = transitions(machine, [focus('username'), change('username', '3333')], machine.initialState);
      expect(result.context.values.username).toEqual('3333');
    });

    it('ignores changes after blur', () => {
      const machineConfig = buildMachine();
      const machine = Machine(machineConfig);
      const { username } = machineConfig.context.values;
      const result = transitions(
        machine,
        [focus('username'), blur('username'), change('username', '999999')],
        machine.initialState
      );
      expect(result.context.values.username).toEqual(username);
    });
    it('loses focus if another field is focused', () => {
      const machineConfig = buildMachine();
      const machine = Machine(machineConfig);
      let result = transitions(machine, [focus('username')], machine.initialState);
      expect(result.matches('form.username.focus.focused')).toBeTruthy();

      // now focus another field
      result = transitions(machine, [focus('password')], result);
      expect(result.matches('form.username.focus.unfocused')).toBeTruthy();
      expect(result.matches('form.password.focus.focused')).toBeTruthy();
    });
  });

  /**
   * `pristine` is when a field has been edited
   *    - is pristine by default
   *    - is pristine on `FOCUS`
   *    - is pristine on `RESET`
   *    - is dirty on any `CHANGE`, `SELECT` etc **That is different from default value**
   */
  describe('pristine', () => {
    it('is pristine by default', () => {
      const machineConfig = buildMachine();
      const machine = Machine(machineConfig);
      let result = machine.transition(machine.initialState, focus('someUnrelatedFIeld'));
      expect(result.matches('form.username.pristine.pristine')).toBeTruthy();
    });
    it('is pristine on `FOCUS`', () => {
      const machineConfig = buildMachine();
      const machine = Machine(machineConfig);
      let result = machine.transition(machine.initialState, focus('username'));
      expect(result.matches('form.username.pristine.pristine')).toBeTruthy();
    });
    it('is pristine on `RESET`', () => {
      const machineConfig = buildMachine();
      const machine = Machine(machineConfig);
      const name = 'username';
      let result = transitions(machine, [focus(name), change(name, '123'), reset()], machine.initialState);
      expect(result.matches('form.username.pristine.pristine')).toBeTruthy();
    });
    it('is dirty on `CHANGE`', () => {
      const machineConfig = buildMachine();
      const machine = Machine(machineConfig);
      const name = 'username';
      let result = transitions(machine, [focus(name), change(name, '123')], machine.initialState);
      expect(result.matches('form.username.pristine.dirty')).toBeTruthy();
    });
    // todo: is not dirty on change back/to default value
  });

  /**
   * `touched` is when a field has had focus and been blurred
   *   - is untouched by default
   *   - is untouched on `RESET`
   *   - is touched on first `BLUR`
   */
  describe('touch', () => {
    it('is untouched by default', () => {
      const machineConfig = buildMachine();
      const machine = Machine(machineConfig);
      let result = machine.transition(machine.initialState, focus('someUnrelatedFIeld'));
      expect(result.matches('form.username.touch.untouched')).toBeTruthy();
    });
    it('is untouched on RESET', () => {
      const machineConfig = buildMachine();
      const machine = Machine(machineConfig);
      const name = 'username';
      let result = transitions(machine, [focus(name), change(name, 'rand8'), blur(name)], machine.initialState);
      expect(result.matches('form.username.touch.touched')).toBeTruthy();
      result = machine.transition(result, reset());
      expect(result.matches('form.username.touch.untouched')).toBeTruthy();
    });

    it('is touched on blur (after focus)', () => {
      const machineConfig = buildMachine();
      const machine = Machine(machineConfig);
      let result = machine.transition(machine.initialState, focus('username'));
      expect(result.matches('form.username.touch.untouched')).toBeTruthy();
      result = machine.transition(result, blur('username'));
      expect(result.matches('form.username.touch.touched')).toBeTruthy();
    });

    it('is not touched on blur (if not previously focused)', () => {
      const machineConfig = buildMachine();
      const machine = Machine(machineConfig);
      let result = machine.transition(machine.initialState, enable('username')); // just a random message that's not focus
      expect(result.matches('form.username.touch.untouched')).toBeTruthy();
      result = machine.transition(result, blur('username'));
      expect(result.matches('form.username.touch.touched')).toBeTruthy();
    });
  });

  // validation is changing, skip this for now
  describe.skip('validation', () => {
    it('is valid by default', () => {
      const machineConfig = buildMachine();
      const machine = Machine(machineConfig);
      let result = transitions(machine, [focus('username')], machine.initialState);
      expect(result.matches('form.username.valid.valid')).toBeTruthy();
    });
    it('is valid when changed', () => {
      const machineConfig = buildMachine();
      const machine = Machine(machineConfig);
      let result = transitions(machine, [focus('username'), change('username', '123')], machine.initialState);
      expect(result.matches('form.username.valid.valid')).toBeTruthy();
    });
    it('is valid on reset', () => {
      const machineConfig = buildMachine();
      const machine = Machine(machineConfig);
      let result = transitions(
        machine,
        [focus('username'), change('username', '123'), invalid('username')],
        machine.initialState
      );
      expect(result.matches('form.username.valid.invalid')).toBeTruthy();
      result = transitions(machine, [reset()], machine.initialState);
      expect(result.matches('form.username.valid.valid')).toBeTruthy();
    });
    it('can be valid after invalid', () => {
      const machineConfig = buildMachine();
      const machine = Machine(machineConfig);
      let result = transitions(
        machine,
        [focus('username'), change('username', '123'), invalid('username')],
        machine.initialState
      );
      expect(result.matches('form.username.valid.invalid')).toBeTruthy();
      result = transitions(machine, [valid('username')], machine.initialState);
      expect(result.matches('form.username.valid.valid')).toBeTruthy();
    });
    it('ignores invalid when not touched', () => {
      const machineConfig = buildMachine();
      const machine = Machine(machineConfig);
      let result = transitions(machine, [focus('username'), invalid('username')], machine.initialState);
      expect(result.matches('form.username.valid.valid')).toBeTruthy();
    });
  });

  describe('visibility', () => {
    it('ignores changes when invisible', () => {
      const machineConfig = buildMachine();
      const machine = Machine(machineConfig);
      const { username } = machineConfig.context.values;
      const result = transitions(
        machine,
        [focus('username'), invisible('username'), change('username', '123')],
        machine.initialState
      );
      expect(result.context.values.username).toEqual(username);
    });

    it('ignores focus when invisible', () => {
      const machineConfig = buildMachine();
      const machine = Machine(machineConfig);
      const result = transitions(
        machine,
        [focus('username'), invisible('username'), focus('username')],
        machine.initialState
      );
      expect(result.matches('form.username.focus.unfocused')).toBeTruthy();
    });

    it('allows changes after visible and when focused', () => {
      const machineConfig = buildMachine();
      const machine = Machine(machineConfig);
      const value = '7437t634';
      const result = transitions(
        machine,
        [invisible('username'), visible('username'), focus('username'), change('username', value)],
        machine.initialState
      );
      expect(result.context.values.username).toEqual(value);
    });

    it('loses focus when invisible', () => {
      const machineConfig = buildMachine();
      const machine = Machine(machineConfig);
      let result = transitions(machine, [focus('username')], machine.initialState);
      expect(result.matches('form.username.focus.focused')).toBeTruthy();
      result = transitions(machine, [invisible('username')], result);
      expect(result.matches('form.username.focus.unfocused')).toBeTruthy();
    });
  });

  describe('context.focused', () => {
    it('sets value on field focused', () => {
      const machineConfig = buildMachine();
      const machine = Machine(machineConfig);
      const state = machine.transition(machine.initialState, focus('username'));
      expect(state.context.focused).toEqual('username');
    });

    it('resets value on field unfocused', () => {
      const machineConfig = buildMachine();
      const machine = Machine(machineConfig);
      let result = transitions(machine, [focus('username'), blur('username')], machine.initialState);
      expect(result.context.focused).toBeNull();
    });

    it('resets value on reset', () => {
      const machineConfig = buildMachine();
      const machine = Machine(machineConfig);
      let result = transitions(machine, [focus('username')], machine.initialState);
      expect(result.context.focused).toEqual('username');
      result = transitions(machine, [reset()], result);
      expect(result.context.focused).toBeNull();
    });
  });
});
