---
title: 'Is moving to TypeScript in 2019 hard?'
date: 2019-11-11 00:00:00 +0000
description: I explore whether moving to TypeScript in 2019 is hard to do
---

I recently had a conversation with some friends that went something like this:

> **Friend A**: I'm working on a JavaScript project. I'll probably migrate it to TypeScript at some point.
> **Me**: You should just do it now - it takes no time to do and you can immediately begin harnessing the features of TypeScript while not impacting your existing codebase.
> **Friend B**: Is it really easy? Last time I tried to do this I spent hours trying to understand a bunch of documentation and new tooling

I've been using TypeScript for years now, so it's quite hard to unlearn a lot of things I know about how to get it set up and strategies I'd take to migrate an existing JavaScript codebase to TypeScript, but I'll try be methodical about this...

Assumptions we're making about the person wanting to make the switch:

- They have a pretty good knowledge of JavaScript.
- They have heard of TypeScript and possibly have a small idea of its capabilities (but mostly just the "TypeScript is a superset of JavaScript" and "it provides types!" parts).
- They're able to use Google.

Now, you could just take a look at the [migrating from JavaScript guide](https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html) but this can be a bit overwhelming if you don't know what's in front of you.

Let’s say we want to get on Dave’s TypeScript HypeWagon™ and have the following project:

```bash
.
├── build
├── package.json
└── src
    ├── components
    │   └── foo.js
    └── util
        └── bar.js
```

We have a:

- `build` directory. This is where our built code lives.
- `package.json` file. This is where our dependencies are managed and where our build scripts live.
- `foo.js` file inside a component directory.
- `bar.js` file inside a util directory.

Cool - super contrived - let's see where this leads us...

---

What do we need to do in order to start cooking with TypeScript?

### Add TypeScript to your project

In order to use TypeScript, we obviously need to add it to our project first. If you're using [NPM](https://www.npmjs.com/), run:

```bash
npm i --save-dev typescript
```

If you're using [Yarn](https://yarnpkg.com/lang/en/), run

```bash
yarn add --dev typescript
```

_Done. Next!_

---

### Create a config file

Not a bad start. Let's create a `tsconfig.json` file in the root of our project and slap in the following config:

```json
{
  "compilerOptions": {
    "outDir": "./build",
    "allowJs": true,
    "target": "es6"
  },
  "include": ["./src/**/*"]
}
```

This tells the TypeScript compiler a few things:

- Look inside the `src/` directory for TypeScript files (the `include` setting).
- Allow JavaScript files as well (the `allowJs` setting).
- Spit output files to the `build/` directory (the `outDir` setting).
- Emit ES6 code (the `target` setting).

For existing codebases, this is a quick way to dip your toes into the TypeScript waters. However, it is a very relaxed config that isn't super TypeScript'y. We'll talk about what this means in a bit.

---

### Build our code

Okay, we've installed TypeScript and defined a config that shouldn't slow us down in getting up and running with TypeScript.

Now we need to build our code using the TypeScript compiler. Let's add a `build` script in `package.json`.

```json
{
  "scripts": {
    "build": "tsc"
  }
}
```

That's all. The TypeScript compiler will know to look in the root of your project for `tsconfig.json` (it will complain at you if it can't find it) and begin doing your bidding. You'll notice that your `build/` directory output mimics your `src/` directory structure. There will be more on this in a bit.

🎉 At this stage, you're all up and running - you can write and compile TypeScript 🎉

---

### Writing TypeScript

Now that we can compile TypeScript in our projects, let's go ahead and rename our files to use the `.ts` (if the original file was using JS) or `.tsx` (if the original file was using JSX).

---

### Okay, what next

We're not exactly done yet...

The contrived example provided so far doesn't account for (at least) a few things:

1. How do I hook this all up to appropriate tooling?
2. How do I get more strict with my codebase?

Once both of these things are addressed, you're basically 95% of the way there.

So... let's address them.

---

### Tooling

There are many bundling tools out there to help manage TypeScript projects, but for this article we'll stick with the most popular one - [Webpack](https://webpack.js.org/).

I could go on all day about the capabilities of Webpack, but for the scope of this article, let's just focus on what we need to do for TypeScript.

Let's install a few things and I'll explain them along the way:

```bash
yarn add -D ts-loader webpack webpack-cli
```

All we really need to tell Webpack is a few things:

1. What the input(s) to our source are.
2. Where our output(s) are.
3. What sort of files we want Webpack to handle (i.e. TypeScript files).
4. What to do when we encounter a TypeScript file.

In order to do this, we'll need to create a webpack config file (`webpack.config.js`) in the root of our project:

```js
const path = require('path');

module.exports = {
  entry: './src/components/foo.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  module: {
    rules: [{ test: /\.tsx?$/, exclude: /node_modules/, loader: 'ts-loader' }],
  },
};
```

Here we can observe the following things:

1. The entry point into our application is `./src/components/foo.ts`.
2. We are outputting our bundle to `./dist/bundle.js`.
3. We want Webpack to handle `.js`, `.jsx`, `.ts` and `.tsx` files.
4. We have a rule that when we encounter a `.ts` or `.tsx` file we run `ts-loader` on them.

📀 \*_Record scratch_\* 📀

What on Earth is `ts-loader`?!

A loader is a preprocessor that runs when a rule is matched. In this case, we run the `ts-loader` to convert our TypeScript to browser-friendly code.

There are _loads_ of loaders that do _loads_ of things, and there are loaders that do the same things as other loaders (for instance, `ts-loader` and `babel-loader` can do pretty similar things) so it can feel overwhelming at times.

Okay. Now we have Webpack configured to do what we want it to, we need to run it. Fortunately it's just a modification to our build script in `package.json`:

```json
{
  "scripts": {
    "build": "tsc && webpack"
  }
}
```

This calls `tsc` to compile our code and spit out any errors that may have occurred, and then calls `webpack` to bundle our code into a single output file (this means we only need to serve one JavaScript file - there are advantages and disadvantages to this, but that is out of scope for this post).

---

### Scaling up

This post has covered how to start using TypeScript in an existing project but what do we do from here?

It's not considered good practice to keep the really loose rules that we have in our `.tsconfig` file as it won't catch as many potential errors that we'd like to at compile-time.

However, if you turn on all the stricter rules (you can read about all the compiler options [here](https://www.typescriptlang.org/docs/handbook/compiler-options.html)) you'll quickly find yourself working with a codebase with a lot of errors/warnings.

If you have the time (and patience) you can go from 0-100, turn on `strict` mode and work through any errors/warnings. Otherwise you can try turning on one of the rules that `strict` mode applies at a time and working through it that way.

One other way you can go about this is to be more lenient on older files in a codebase and enforce that all new files introduced into a codebase pass `strict` compiles.

### Final thoughts

I guess the question here I was trying to answer is:

> Is it easy to migrate an existing JavaScript codebase to TypeScript

I think the answer is: _it depends, but **mostly yes**_.

It's really about striking a balance between time, effort and sanity.

I still recommend that people make the plunge as you can start slow and forgiving and eventually ramp up to a fully-fledged TypeScript environment in your projects.

-Dave
