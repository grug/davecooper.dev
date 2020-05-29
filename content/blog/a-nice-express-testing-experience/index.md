---
title: 'A nice Express testing experience'
date: 2020-01-05 00:00:00 +0000
description: I discuss a nice way to code test Express endpoints
---

Oh hello there - this is my first post of the new decade! 🎉

This one is a short story of relieving some testing pain. As an early declaration - I know I'm late to the party with the solution to the problem I came up with, but I still see lots and lots of code being written in the painful ways I describe so I think it's worth talking about.

I recently had to spin up a Node (TypeScript)/Express service from scratch.

After scaffolding my project with the usual things, it was time to write an endpoint. I figured for monitoring purposes, I'll want a ping/pong endpoint.

Here's what the application looks like so far in our journey:

**app.ts**

```typescript
import express from 'express';
import { pingHandler } from './pingHandler';

const app = express();

app.get('/ping', pingHandler);

app.listen(3000, () => console.log(`Dave's cool API server started`));
```

**pingHandler.ts**

```typescript
import { Response, Request } from 'express';
import { OK } from 'http-status-codes';

export function pingHandler(_: Request, res: Response) {
  return res.status(OK).send('PONG');
}
```

Nothing fancy _at all_.

Let's try and test the `/ping` endpoint. It only does one thing and we have a single handler function that does anything interesting.

It's effectively one line of code that is pretty innocuous, if we're being honest.

This was the point that I realised that I see so much code to test Express endpoints that looks like the following:

**pingHandler.spec.ts**

```typescript
import { Request } from 'express';
import { pingHandler } from './pingHandler';

describe(`pingHandler`, () => {
  it(`responds with 'PONG' and 200 when the endpoint it is hit`, () => {
    const req = ({} as any) as Request;

    const res: any = {
      end: jest.fn(),
    };

    pingHandler(req, res);
    expect(res.end).toHaveBeenCalled();
  });
});
```

This is **so painful**. There are so many things I find wrong with code like this:

- There is a line that has two castings in it
- Two things are typed as `any`
- It doesn't actually check the response or status code
- It's hard to read

Tests like this try to act like unit tests - but testing endpoints like this shouldn't really be carried out like traditional unit tests. Obviously if this handler function were calling out to other functions we've written, then those would require unit testing. However, the sort of test we're really looking for here sits halfway between what I'd describe as a unit test and an integration test.

What can we do? Instead of trying to "unit test" a function like this, why not use a more appropriate tool for the job (_something something square peg, round hole..._)?

Hello [supertest](https://github.com/visionmedia/supertest) 👋

Supertest allows us to pass our app to it, make requests and make assertions on the output in a clear and concise manner.

I could go on about how the API works, but they have good docs for that - it's probably easier to just show you what the test now looks like:

```typescript
import request from 'supertest';
import app from './app';

describe(`pingHandler`, () => {
  it(`responds with 'PONG' and 200 when the endpoint it is hit`, (done) => {
    request(app).get('/ping').expect(200, 'PONG', done);
  });
});
```

Look at that! Much easier to read/understand what's going on and we're _actually testing the things that matter_. I really think this is the way to go when compared to the previous style of test I showed you earlier.

Anyways, that's pretty much it for now. It looks very obvious when written out like this but I see it from developers all the time so I'm hoping this helps some people see that there are other ways of testing endpoints in their Express applications.

Hit me up if you want to chat about it 😀

-Dave
