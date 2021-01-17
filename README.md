# xstate-form

## Alpha

This module is currently in alpha

- Under continuous develoment
- API is not guaranteed until beta
- Rapid prototyping may cause bugs, inconsistencies

## React example

This core library is in parallel development with a `React` [example repo](https://github.com/jaetask/example-forms) which also contains a `useFormMachine` hook.

## 80/20 Rule

> There are probably as many forms as programmers

The desire is to keep the API as clean as possible, so we will always use the 80/20 rule when deciding on features. If a request fits 80% of usecases then it will be considered.

The API is a set of composable functions to help you build an `xstate` machine to handle forms. The idea is to take what you need and leave the rest, if you need an unsupported feature, feel free to copy/modify one of ours and roll your own for that specific scenario.

This approach should keep the API light, clean and easy to use.

## Typescript

This is my first typescript project, please ignore the `any` params at the moment, especially during rapid prototyping, the API will get stricter over time, promise 😂.
