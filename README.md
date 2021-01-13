# xstate-form

## Reason

Multiple attempts to get `xstate` and `Formik` to play nicely have resulted in a roll your own scenario. There are things I really like about `Formik`, it's naming convention, states like isDirty, it's Yup integration, FieldError, Validation and the likes. And wherever possible I will aim to keep a similar naming convention so that concepts flow from Formik.

Formik works well in many scenarios but there are things I really dislike such as it's hard to know what changed and when, complex field dependant calculations are hard to implement and the black box approach makes it difficult to hook in to inner _events_.

This is where `xstate` comes in.

The plan here is to create a `Formik` style `xstate` form handler, with validation, `FieldError` and the likes. I doubt it will implement _all_ of Formiks features, and I suspect there will be some _additional_ features.

Most importantly, this is going to be a `functional` solution, it will work independantly of `React`, there will be a `React` handler, a `Vue` handler etc. The idea is to use `xstate` and `xstate-forms` to solve form issues independantly of your renderer.

Forms driven by `xstate` can be single form or multi tab wizards, it's down to you to design your state machine to allow that.

So, here goes.

## 80/20 Rule

> There are probably as many forms as programmers

The desire is to keep the API as clean as possible, so we will always use the 80/20 rule when deciding on features. If a request fits 80% of usecases then it will be considered.

The API is a set of composable functions to help you build an `xstate` machine to handle forms. The idea is to take what you need and leave the rest, if you need an unsupported feature, feel free to copy/modify one of ours and roll your own for that specific scenario.

This approach should keep the API light, clean and easy to use.

## Typescript

This is my first typescript project, please ignore the `any` params at the moment, especially during rapid prototyping, the API will get stricter over time, promise 😂.
