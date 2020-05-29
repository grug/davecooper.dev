---
title: Sanely testing React hooks
date: 2020-01-15 00:00:00 +0000
description: Discussion around sane patterns for testing React hooks
---

Hi there 👋 Let's talk about how to test React hooks.

Suppose we have a React application (with TypeScript) that uses Redux for state management.

Suppose inside said application you have a hook that does the following:

1. Dispatch an action which ends up make an API call to get a `thing` and put it into state.
2. Returns that `thing` from state.

It might even look like this:

**useThing.ts**

```typescript
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { getThingStart } from './redux/actions';

const useThing = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getThingStart());
  }, [dispatch]);

  return useSelector((state) => state.thing);
};

export { useThing };
```

We can then use this hook inside a component:

**MyComponent.tsx**

```tsx
import React from 'react';
import { useThing } from './useThing';

const MyComponent = () => {
  const { thing } = useThing();

  if (!thing) {
    return <div>Loading...</div>;
  }

  return <div>This is your thing: {thing}</div>;
};
```

We might even have many components that use this hook.

We probably want to test that this hook behaviour works as expected.

How do we do this? What would good tests for this look like?

The most common way I see custom hooks being tested is by testing a component that uses the custom hook. I'm really not a fan of this as component can have so many things going on inside them that could effect the internal state of a component. This effects the confidence we can have in the test which isn't really what we're aiming for.

Since we can't call hooks outside of components (with some exceptions), I also see people wrapping their hooks with dummy components. I'm not sure if this is better or worse than the previously mentioned strategy, but it still doesn't make me happy. There are also cases of when things don't go according to plan within the component that probably aren't being catered for in a simple dummy component.

Why don't we try treat testing hooks as closely as we can to unit testing a regular JavaScript function? After all, hooks are just functions...

Fortunately, we can write tests for our hooks in this style thanks to [react-hook-testing-library](https://github.com/testing-library/react-hooks-testing-library). It provides a `renderHook` function which lets us pass in our hook and execute it. Under the hood, `renderHook` is using the hook within a dummy component, but the difference here is:

- To the test-writer, it appears that we are just executing a function with a callback - not an uncommon thing to do.
- The dummy component is very defensively programmed and can handle pretty much any error/exception case gracefully (it's actually somewhat complicated to do)
  - I took a look through the source code for this function and I'm really glad it wasn't me that had to write it...

Let's see what tests for this hook might look like (using Jest):

**useThing.spec.ts**

```typescript
import { renderHook } from '@testing-library/react-hooks';
import { getThingStart } from './redux/actions';
import { useThing } from './useThing';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

const mockUseSelector = useSelector as jest.Mock;
const mockUseDispatch = useDispatch as jest.Mock;
const mockDispatch = jest.fn();

describe('useThing hook', () => {
  it('calls dispatch and retrieves our thing', () => {
    mockUseDispatch.mockImplementation(() => mockDispatch);
    mockUseSelector.mockImplementation(
      (callback) => callback({ thing: 'this is our thing' }), // This is our mocked state.
    );

    const { result } = renderHook(() => useThing()); // Call our hook.

    expect(result.current).toBe('this is our thing'); // Make sure hook returns our slice of state.
    expect(mockDispatch).toHaveBeenCalledWith(getThingsStart()); // Make sure the right action was dispatched.
  });
});
```

Lovely.

To break down what the test is doing...

```typescript
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

const mockUseSelector = useSelector as jest.Mock;
const mockUseDispatch = useDispatch as jest.Mock;
const mockDispatch = jest.fn();
```

These lines set up our mocked behaviour for `useSelector`, `useDispatch` and `dispatch`. We need to be able to mock implementations for `useSelector` and `useDispatch` and we need to spy on what `dispatch` was called with.

```typescript
mockUseDispatch.mockImplementation(() => mockDispatch);
mockUseSelector.mockImplementation((callback) =>
  callback({ thing: 'this is our thing' }),
);
```

These lines tell the `useDispatch` hook to return our mocked `dispatch` function and for the `useSelector` hook to call a callback containing a mocked state object.

```typescript
const { result } = renderHook(() => useThing());
```

This line calls `renderHook` and tells it to run our `useThing` hook. `renderHook` returns a `result` object.

```typescript
expect(result.current).toBe('this is our thing');
expect(mockDispatch).toHaveBeenCalledWith(getThingsStart());
```

Finally, we make our assertions! We first assert that the `useThing` hook returned the right value. Next we make sure that `dispatch` was called with the right action to dispatch.

## Final thoughts

We now have a hook that we've concisely and confidently tested 🎉

I'm really happy with this pattern of testing hooks and I think that people should consider treating their hook tests more like their unit tests.

I'd love to hear any thoughts about this, so please feel free to reach out to me about it :)

-Dave
