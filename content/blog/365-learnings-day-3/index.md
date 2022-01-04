---
title: '[Day 3] 365 learnings: TypeScript indexed access types'
date: 2022-01-03
description: Let's explore indexed access types!
---

3/365 learnings for the year.

Today I came across the following situation:

- I had an array of strings
- I wanted to generate a type which is composed of all of the string literals in that array
- I wanted to specify a function parameter to use said type so that TypeScript errors when we try to pass something that _isn't_ one of those strings in the array

To provide a simple example, this is our array:

```typescript
const things = ['apple', 'strawberry', 'banana'];
```

I already knew how to generate the type of `'apple' | 'strawberry' | 'banana'` - we can use `as const`:

```typescript
const things = ['apple', 'strawberry', 'banana'] as const;

// type of things is: readonly ["apple", "banana", "strawberry"]
```

However, if we have a function that takes one of these things, we need to do more to enforce that we can _only_ pass one of the things in:

```typescript
const things = ['apple', 'strawberry', 'banana'] as const;

function doSomething(thing) {
  // how do we type our thing?
}

doSomething('apple'); // works
doSomething('rock'); // works, but we want it to fail
```

We can't simply type `thing` as `typeof things` because that will mean that we're expecting an entire array that contains every single thing.

After a bit of Googling I found [indexed access types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html). To copy the definition of what an indexed access type actually does:

> We can use an indexed access type to look up a specific property on another type

Meaning we can use this to get the type of the elements within our array. When we combine this with `typeof`, we get a rock solid type:

```typescript
const things = ['apple', 'strawberry', 'banana'] as const;

function doSomething(thing: typeof things[number]) {
  // do something
}

doSomething('apple'); // works!
doSomething('rock'); // fails!
```

<br />

This is super handy and I suspect it won't be long before I encounter another use case where I'll be able to use this again.
