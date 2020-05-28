---
title: "Injecting mock data into applications in 2019"
date: 2019-04-30 00:00:00 +0000
description: Why is injecting mocked data into applications in 2019 so difficult? Let's find out.
---

Imagine this timeline... it's 2019 and injecting mock data into web applications sucks. Keeping application state to be deterministic and flexible is incredibly difficult and cumbersome.

_Oh wait_, this is the timeline we live in 😱

Let's take a look at that in the most shameless abrasive way possible - with me shilling a library I wrote!

## How do we currently get data into our applications for development?

Some of the things that I'm sure we've all tried when trying to mash data into our applications:

**Connect the application to production services**

_No. Just don't._

If you do this, the developer police will come and take you to developer jail 🚓

In developer jail, you have to talk about _"which IDE is the best"_ and _Tabs vs. Spaces_ all day, every day. You don't want that and neither do I.

This only leads to problems. You'll accidentally mutate something on one (or all) of your users and everyone will be sad. Plus, you'll be in jail.

**Connect the application to a UAT/Staging services**

_No._

If you do this, the developer police will also come and take you to developer jail 🚓

Inevitably, you'll end up having many people connecting to these services and user data will be mutated in weird ways that make it difficult to test new features or reprocuce bugs. As with the above scenario, everyone will be sad (and in jail - which will probably make you more sad).

**Connect the application to a local copy of your services**

This is the first approach that won't land you in developer jail.

However, it's a pain to do _well_ - and if you don't do it well, you'll go straight to _you-know-where_.

You don't want to have to set your services up manually, so now you'll probably need to containerise (how do you even spell that word?) things and have ways to reliably reproduce your data stores from scratch and then when things change with your application architecture and implementation etc... you're probably going to have to do a lot of extra work to keep up with that.

> Dave, all of these solutions suck so far. What else can I do?

Yes, yes they do. Let's continue...

**Run a local mock service to expose data**

Okay, we're getting somewhere.

We could write a really simple service (Node/Express servers are easy to set up and is generally familiar to frontend developers) to expose the endpoints and data that our application has. Writing a simple Node service isn't that hard and it doesn't put us in a spot where we can be touching actual customer data, nor are we going to be at risk of modifying something that someone else is relying on, since it's our own personal environment.

The downside here, though, is that we now have quite a lot of code to write and maintain when all we really care about is the data that comes back in response to our requests. We also still don't have easy ways of specifically and reliably testing happy/unhappy paths in our applications.

---

> Dave, what about something off-the-shelf?

There are _loads and loads and loads and loads and loads and loads (and loads)_ of solutions available to achieve exactly what we're talking about (did I mention there are loads of them?). Let's just look at a couple to see what they're like.

_disclaimer: I don't want it to sound like I'm trash-talking anything that someone has put time and effort to develop. I'm merely pointing out the underlying problems with data injection that I see in web application development today._

## json-server

[json-server](https://github.com/typicode/json-server) is a simple solution that allows you to specify a JSON file describing the endpoints of your application, and provides a HTTP interface to that. Boom 💥. Zero coding and easy to set up. It also has about a billion Github ⭐️'s so obviously it's doing a lot of things right.

Here's what a sample config looks like (shamelessly lifted from its Github page):

```json
{
  "posts": [{ "id": 1, "title": "json-server", "author": "typicode" }],
  "comments": [{ "id": 1, "body": "some comment", "postId": 1 }],
  "profile": { "name": "typicode" }
}
```

Super easy to write. Super easy to understand. I'll let you guess what is returned when you make a `GET` to `/comments` (_spoiler: you're correct_).

There are some downsides to this:

- _What if I have a tonne of endpoints in my application?_
  - This file becomes quite large
- _How do I easily test happy/unhappy paths?_ (i.e. how do I test that my `POST` to `/login` has failed?)
- _How can I simulate delay into individual responses?_
  - There is a `--delay` flag you can pass into the process, but the delay is applied to all responses
- Writing lots of JSON is a pain. You get little auto-complete and no typings on anything.

## apimocker

I wanted to give some code examples for [apimocker](https://github.com/gstroup/apimocker) but to come up with a self-contained example that demonstrates basic usage is a bit lengthy, so I'll leave that up to you to check out on its Github page. Essentially, it's a beefier version of `json-server`.

`apimocker` allows for things like:

- Switch-responses based on URL parameters (this is a term I like to refer to as `scenarios` - remember this for later)
- Splitting of responses into files
- Global response delay, or endpoint-specific response delay

This is all very cool 😎, except that these config files become very large, very quickly and can be quite hard to read. For example, to configure more advanced switch-responses (`scenarios` - keep remembering this term!) you need to know `JSON path`, which is like `XPath`, only more annoying (okay, that's subjective).

---

These solutions are still a bit heavy and a bit cumbersome, _in my opinion_. In these cases, we're spining up a new process and having that constantly run. My dev laptop is a fairly new Macbook, but it still sounds like it's about to launch into orbit any time I look at it.

Wouldn't it just be nice to have some way of not writing these messy, sometimes complicated configs and save on machine resources?

Hmmm 🤔

## Enter data-mocks

Here's the part where I shamelessly plug a library I've written. I bet you've been looking forward to this!

I co-authored a library called [data-mocks](https://github.com/ovotech/data-mocks). It's very rad - but of course I'd say that...

Here's a brief overview of what it is/does:

- Uses a code driven config to define endpoints we want to mock, and their respective responses
- Similar to [angular-multimocks](https://github.com/nabil-boag/angular-multimocks), but _framework agnostic_
  - This means it'll work with plain `JS`, `Angular`, `React`, `React Native` etc...
  - This library was actually the inspiration for writing `data-mocks`
- Compatible with `XHR` and `Fetch`
- Light and easy to set up
- `Scenario` (he said that term again!) support

Under the hood, `data-mocks` intercepts HTTP requests your application makes, based on a regex performed against the URL that is being requested. No actual HTTP requests get made as they are picked up by [fetch-mock](https://github.com/wheresrhys/fetch-mock) for Fetch requests and [xhr-mock](https://github.com/jameslnewell/xhr-mock) for XHR requests. The authors of those two libraries are the real MVPs here and deserve massive amounts of respect 🏆

Let's look at a basic React app that makes a request to an API:

**App.jsx**

```jsx
import React from "react"
import ReactDOM from "react-dom"

import { SomeComponent } from "./SomeComponent"

ReactDOM.render(<SomeComponent />, document.getElementById("app"))
```

**SomeComponent.jsx**

```jsx
import React, { Component } from "react"

export class SomeComponent extends React.Component {
  state = {
    thing: undefined,
  }

  componentDidMount() {
    fetch("www.davesapi.com/get-my-thing").then(thing =>
      this.setState({ thing })
    )
  }

  render() {
    return (
      <>
        <h1>Dave's cool thing</h1>
        Here's a thing: {!this.state.thing ? "Loading..." : this.state.thing}
        {!this.state.thing === "badThing" ? null : (
          <h1>OH NO, THAT IS A BAD THING!</h1>
        )}
      </>
    )
  }
}
```

When the component loads, we hit our server and we display our `thing` once it comes back.

Neato burrito 🌯

But what if something bad (i.e. `badThing`) comes back from the API? 🤔

We could:

- Hardcode our server to respond with `badThing`? ❌
  - That would suck and is way too manual
- Hardcode the response in our component? ❌
  - That would also suck and is also way too manual
- Use `data-mocks`? ✅

Introducing data-mocks into an application is very simple.

All a mock is, is the following:

- A URL matcher, which is just a regex on the endpoint name
- A HTTP method
- A response object
- A response code
- A delay, in milliseconds

That's it. Five things to describe literally any mock. No JSON config. No having to learn a massive API or read a massive readme (although there is one available...).

All we need to do is call the `injectMocks` function exposed by `data-mocks` and pass in a list of mocks we want to use. Very neat.

**App.jsx**

```jsx
import React from "react"
import ReactDOM from "react-dom"

import { SomeComponent } from "./SomeComponent"

import { injectMocks } from "data-mocks"

const mocks = {
  default: [
    {
      url: /get-my-thing/,
      method: "GET",
      response: { thing: "this is a thing" },
      responseCode: 200,
      delay: 250,
    },
  ],
}

injectMocks(mocks, "default") // This sets the default scenario

ReactDOM.render(<SomeComponent />, document.getElementById("app"))
```

Sick - we're good to go. We can now run our app locally and we get the same behaviour as we did when we were connecting to the actual service.

But I promised you better than that - I promised you an easy way to test other paths of use in the app.

## Scenarios

We can now talk about them! 🕺💃

> A scenario is just a mapping of responses that is given a name (i.e. the scenario you are running). The `default` scenario is the default set of behaviour exhibited by endpoints in the application. Any non-default scenario will give you the full set of default mocks, plus all mocks defined in the scenario. If a mock has the same URL matcher in the specified scenario, it will override the response in the corresponding default mock.

In simpler terms:

> A scenario is a set of API responses you want your application to give in a given scenario (yes, we've used the term to define the term).

Let's see what this looks like:

**App.jsx**

```jsx
import React from "react"
import ReactDOM from "react-dom"

import { SomeComponent } from "./SomeComponent"

import { injectMocks, extractScenarioFromLocation } from "data-mocks"

const mocks = {
  default: [
    {
      url: /get-my-thing/,
      method: "GET",
      response: { thing: "thisIsAThing" },
      responseCode: 200,
      delay: 250,
    },
  ],
  badThing: [
    {
      url: /get-my-thing/,
      method: "GET",
      response: { thing: "badThing" },
      responseCode: 200,
      delay: 250,
    },
  ],
}

injectMocks(mocks, extractScenarioFromLocation(window.location))

ReactDOM.render(<SomeComponent />, document.getElementById("app"))
```

You're probably getting the idea here. However, two things will probably stick out:

- _"When I run this, I still get the default scenario respone. What gives?"_
- _"What is this `extractScenarioFromLocation(window.location)` business?"_

To answer both at once: we need to specify which scenario to run. The way we do this is through the _URL of the page we're on_. Go on, add `?scenario=badThing` to your query string (i.e. `localhost:8080?scenario=badThing`). If you have another way that you'd like to pass in the scenario name to the `injectMocks` function, feel free to not use the `extractScenarioFromLocation` util function.

You'll now see that we get the unhappy path response from our mocks.

_This is especially helpful when running things like Cypress tests - as we don't need to change anything at all in our code to test different behaviours and make assertions based on what comes back from our APIs!_

## Other considerations

There are a couple of things to keep in mind with this approach that will make life nice and easy for you:

- You can avoid having mocks bundled into your application by surrounding the call to `injectMocks` with a `if (process.env === 'development') { injectMocks(...); }` block.
  - Alternatively you can define a separate entry point into your application (i.e. `App.dev.jsx`) and point your dev build to there. This is a bit more work, though.
- You can move your mock definitions into their own section of the project (i.e. `/mocks`) to avoid clutter in the entry point of your application

## Summary of what this allows us to do

With all of the above, we can now:

- Easily integrate new mocks into the application
- Easily toggle between our new best friend, scenarios
  - This allows us to test feature/bug fixes when developing **and** in automated UI tests. This is the killer feature of `data-mocks`, in my opinion. Nothing else seems to offer something as easy (in terms of configuring and using the feature)
- Write frontend code without having to have a single line of backend code (or a mock API server) written
- Not have to write _yet another_ JSON config

_There you go, now we're data-mock'ing!_

If you've got any questions about this or want to contribute, please ping me or open a PR/Github issue 😊

-Dave
