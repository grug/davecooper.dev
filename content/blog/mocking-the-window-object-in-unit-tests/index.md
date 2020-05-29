---
title: Mocking the window object in unit tests
description: How to mock the browser window object for testing purposes
date: 2020-03-20 00:00:00 +0000
---

Recently, I implemented some functionality that leveraged the [browser's performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance) to help with measuring an initial page render time.

The code looked something similar to this:

### performance.ts

```typescript
export const measureInitialPageLoad = () => {
  if (
    window.performance
      .getEntries()
      .filter((el) => el.name === 'MY_APP_INITIAL_PAGE_RENDERED').length === 0
  ) {
    window.performance.measure('MY_APP_INITIAL_PAGE_RENDERED');
  }
};
```

The code above does the following:

- Defines a function called `measureInitialPageLoad`.
- Calls `window.performance.getEntries()` to get an array of [PerformanceEntry objects](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceEntry) made by the browser.
- Filters the list of `PerformanceEntry`s to see if any of them are called `MY_APP_INITIAL_PAGE_RENDERED`.
  - We have prepended `MY_APP` to this `PerformanceEntry` to help ensure that nothing else is generating a `PerformanceEntry` called `INITIAL_PAGE_RENDERED`.
- If we haven't measured this before (i.e. if the filter returns an array of length 0), then we call `window.performance.measure()` to create a named `PerformanceEntry`.

Pretty straightforward and fairly uninteresting, right?

Well, it starts to get interesting right around the time you need to write some unit tests for this piece of code. We've all been there - writing unit tests for code that leverages the `window` object but a lot of the time you don't stop and think about what the `window` object _actually is_ and why it can sometimes feel a bit odd writing unit tests around it.

To unit test this function, we need to reliably manipulate the `window.performance` object to do two things:

1. Return a desired array of `PerformanceEntry` objects when `window.performance.getEntries()` is called.
2. Track whether of not `window.performance.measure` has been called.

One approach might be to try do something like:

_Note: tests are written using Jest_

### performance.spec.ts

```typescript
import { measureInitialPageLoad } from './performance';

describe('performance', () => {
  it('Calls measure when we have not already measured the initial page rendering', () => {
    window.performance = {
      getEntries: jest.fn().mockReturnValue([]),
      measure: jest.fn(),
    };

    measureInitialPageLoad('INITIAL_PAGE_RENDERED_TEST');
    expect(window.performance.measure).toHaveBeenCalled();
  });
});
```

This is something I commonly see to try hack around the window object in unit tests and for _some things_ it does work. However, it turns out the `window.perfomance` object is **read only**. Uh oh - this won't work!

You'll be left with an error that looks like:

> Cannot assign to 'performance' because it is a read-only property.

Not to mention, it's harder to clean up your mocks inbetween tests if you set things directly on the `window` object like this.

Admittedly, this was the first thing I tried and left me feeling a bit baffled. I searched around for some examples online of other people trying to mock read-only `window` objects and the closest thing I could come across was something like this:

### performance.spec.ts

```typescript
import { measureInitialPageLoad } from './performance';

describe('performance', () => {
  it('Calls measure when we have not already measured the initial page rendering', () => {
    delete (window as any).performance;

    const performance = {
      measure: jest.fn(),
      getEntries: jest.fn(),
    };

    Object.defineProperty(window, 'performance', {
      configurable: true,
      enumerable: true,
      value: performance,
      writable: true,
    });

    measureInitialPageLoad('INITIAL_PAGE_RENDERED_TEST');
    expect(window.performance.measure).toHaveBeenCalled();
  });
});
```

Basically, we delete `performance` off the window object... but to do that, we have to cast as `any` because in the Jest testing environment, we're actually referring to the NodeJS `window` which doesn't have `performance` defined on it. We then add a writeable `performance` object to `window` with our Jest mocks and away we go.

This works... but it's not so great:

- It deletes something from the `window` object.
  - That sounds/feels a bit weird, doesn't it?
- We have to define a new property on `window` with a writeable `performance` object.
  - How many times have you had to do something like this before? I'm guessing the answer to this is zero.

Ideally, what we want is a `window` that behaves normally but allows us to mock objects on it in the _same way_, no matter if the object was originally read-only or not. For example, the pattern used to mock something on the `window.location` object is exactly the same as the pattern used to mock something on the `window.performance` object.

🎉 It turns out we can do that 🎉

To do this, we need to:

1. Export a copy of the `window` object from a module.
2. Use that copy in our code.
3. Once the two things above have been done, we can then mock the `window` object properly in our tests.

Let's do it!

---

First, let's export a copy of the `window` object.

Unfortunately, neither TypeScript nor Jest allow us to do:

### window.ts

```typescript
export { window };
```

So we have to create a copy and export that instead:

### window.ts

```typescript
const windowCopy = window;

export { windowCopy as window };
```

Okay, first step done. Next, let's change our references to `window` in our code to use the copy we are now exporting:

### performance.ts

```typescript
import { window } from './window';

export const measureInitialPageLoad = () => {
  if (
    window.performance
      .getEntries()
      .filter((el) => el.name === 'MY_APP_INITIAL_PAGE_RENDERED').length === 0
  ) {
    window.performance.measure('MY_APP_INITIAL_PAGE_RENDERED');
  }
};
```

That was easy - adding the import was the only thing we needed to do!

Lastly, let's mock the window object in our test (I've also included the other test that I wrote for this particular function):

### performance.spec.ts

```typescript
import { measureInitialPageLoad } from './performance';

import { window } from './window';

jest.mock('./window', () => ({
  window: {
    performance: {
      measure: jest.fn(),
      getEntries: jest.fn(),
    },
  },
}));

describe('performance', () => {
  it('Calls measure when we have not already measured the initial page rendering', () => {
    (window.performance.getEntries as jest.Mock).mockReturnValue([]);
    measureInitialPageLoad('INITIAL_PAGE_RENDERED_TEST');
    expect(window.performance.measure).toHaveBeenCalled();
  });

  it('Does not call measure when we already have measured the initial page render', () => {
    (window.performance.getEntries as jest.Mock).mockReturnValue([
      'INITIAL_PAGE_RENDERED_TEST',
    ]);
    measureInitialPageLoad('INITIAL_PAGE_RENDERED_TEST');
    expect(window.performance.measure).not.toHaveBeenCalled();
  });
});
```

And there we have it - a pattern that can be used to mock anything on the window object, regardless if it is read-only or not. The only thing to remember here is that when you want to mock a return value, you still need to cast the function you're mocking to `jest.Mock` as TypeScript isn't quite smart enough to work out that we are actually dealing with a mock at compile-time.

---

## Concluding thoughts

Personally, I really like this pattern of working with `window` in unit tests because it provides a consistent pattern to mock anything we need regardless of what it is we're trying to mock. The `window` object is a funny one because sometimes it's not always clear how to work with it in a testing environment.

I'd love to hear everyone's thoughts on this and to share how they deal with mocking `window` in their testing environments!

-Dave
