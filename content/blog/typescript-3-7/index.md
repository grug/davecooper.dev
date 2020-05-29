---
title: 'Cool TypeScript 3.7 things'
date: 2019-11-06 00:00:00 +0000
description: Some cool TypeScript 3.7 things with code examples
---

What a great day - it's not raining in London _and_ there's a new version of TypeScript out - 🎉 - let's talk about some of the neat stuff in it!

_Note: most of the knowledge in this post can be acquired by digesting the changelog for this release. I just thought I'd give my own summary as it may be easier to consume._

[TypeScript 3.7](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html) (I suggest you give this a quick flick through) has given us a super rad set of features/changes. I thought I'd pick a few of the things that I think are going to improve the quality of life for everyone and give a breakdown with code examples to illustrate their usefulness.

_Spoiler: a class of annoying boilerplate is removed_

---

### Optional Chaining

Let's look at some code that we see frequently

```typescript
if (foo && foo.bar && foo.bar.baz) {
  console.log(`This sucks!`);
}
```

We all have written code like this and we all hate it... fortunately, _optional chaining_ eliminates this (be careful, though - more on this in a second!). We can now do this:

```typescript
if (foo?.bar?.baz) {
  console.log(`Now we're cooking with gas!`);
}
```

I can hear you breathing a sigh of relief from here... not having to write _**that**_ sort of code again is a rather cathartic feeling.

We can also use optional chaining for array access and calling functions.

**Array access:**

```typescript
const result = someArray?.[0];

console.log(`Result: ${result}`); // Will be the value of the array element if someArray exists, else undefined.
```

**Calling functions (code lifted from release notes):**

```typescript
async function makeRequest(url: string, log?: (msg: string) => void) {
  log?.(`Request started at ${new Date().toISOString()}`);

  const result = (await fetch(url)).json();

  log?.(`Request finished at at ${new Date().toISOString()}`);

  return result;
}
```

There are some gotchas with this, though...

1. Optional chaining doesn't short circuit, so if you have a line of code such as:

```typescript
let result = foo?.bar / someFunctionCall();
```

It doesn't stop `someFunctionCall` from being invoked, meaning you may try divide `undefined` by whatever `someFunctionCall` returns which isn't ideal. This is why it's recommended you have `strictNullChecks` enabled.

2. The two following lines may look equivalent, but are not:

```typescript
foo && (await foo());
```

and

```typescript
await foo?.();
```

The first snippet will short circuit and not call `foo()` if it isn't defined, whereas the second snippet will wrap the undefined case into a promise and return that.

3. When matching regular expressions, `null` is returned, not `undefined`, which makes the two following lines non-equivalent:

```typescript
const match = someString.match(/someRegex/);
return match && match[1];
```

and

```typescript
const match = someString.match(/someRegex/);
return match?.[1];
```

To rewrite the first snippet using optional chaining, you'd also need to use the nullish coalescing operator (see the next section for a full explanation of this operator - for now you can think of it as a 'fallback' operator):

```typescript
const match = someString.match(/someRegex/);
return match?.[1] ?? null;
```

---

### Nullish Coalescing

The nullish coalescing operator (or fallback operate, as I like to say in my head when reading code) is another sweet addition to TypeScript 3.7. In essence, it allows us to say "use this value if it is present, else do something else.

Without the fallback operator, to achieve this sort of behaviour, we'd have to write something like (code shamelessly stolen again from the 3.7 release notes):

```typescript
let x = foo !== null && foo !== undefined ? foo : bar();
```

We can now rewrite the above as:

```typescript
let x = foo ?? bar();
```

🙏 Sweet merciful lord that is so much nicer 🙏

This operator also now allows us to avoid subtle bugs, too. Before, a common thing I would see in code would be:

```typescript
const x: number | string = y || 100;
```

Which works for _most_ cases but falls over at the fact that if `y` is `0` or `''`, the fallback value will be used, despite `0` or `''` potentially being valid values. We can now safely rewrite it as:

```typescript
const x: number | string = y ?? 100;
```

Hooray!

---

### Uncalled Function Checks

The last neat thing I wanted to pick out of this release are uncalled function checks. Suppose you have the following code:

```typescript
interface User {
  isAdmin(): boolean;
  doSomethingDangerous(): void;
}

function foo(user: User) {
  if (user.isAdmin) {
    doSomethingDangerous();
  }
}
```

We have a bug: `user.isAdmin` is always true because the function is defined, therefore we will always invoked `doSomethingDangerous()`!

Uh oh 🙀

Fortunately, this will now error in 3.7:

```bash
// error! This condition will always return true since the function is always defined.
//  Did you mean to call it instead?
```

---

All of the features and improvements in TypeScript 3.7 are pretty neato burrito 🌯

I'm super excited to use them all at length and you should be too!

-Dave
