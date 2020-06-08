---
title: 'My new blog site'
date: 2020-06-08 00:00:00 +0000
description: Here's my experience of moving from Jekyll to Gatsby
---

> I've moved my blog post to a new platform!

Ah yes, it's time for that classic blog post: the one about how you're using some new shiny thing.

My blog site has taken a few different forms over the years:

- Wordpress
  - This was when Wordpress was pretty garbage at doing most things. I know it has come a long way in the last 5 years.
- Jekyll
  - I switched to this when Jekyll had become popular. It integrated nicely with GitHub Pages at the time and there wasn't really anything better in terms of dev experience. However, if you wanted to do any customisation, you had to write Ruby code. This led to some pretty attrocious code to be written by me well, more attrocious than usual...
- Gatsby
  - Oh boy, this is nice.

I was a bit over being locked into a static site generator that used Ruby as its backbone as it felt really difficult to do anything due to my lack of comfort with the language. I knew a few people who had made the switch to Gatsby - and let's face it, it's the flavour of the month for now - so I thought I'd give it a go and see what the fuss is about.

Recently, I've been doing some NextJS work for some side projects. I found the new-developer experience of using NextJS to be almost identical to Gatsby:

- CLI tool to scaffold out your project
- Zero config to begin local development
- TypeScript support out-of-the-box
- Great tutorials/documentation

You get a _lot_ of nice things out-of-the-box:

- TypeScript
- Route handling
- A starter template
  - The Gatsby blog starter is what this site is based on and I find it a pretty nice starting point to customise from.
- GraphQL

It's all pretty slick and seems to work with minimal fuss.

I decided to give myself an evening to move my blog over from Jekyll and to be honest, it was pretty simple. There was a bit of manual work that I could have automated, but I don't have a huge amount of blog posts, so I figured copying and pasting content wasn't that bad.

I then spent another evening theming things, but ended up keeping things pretty similar to the starter template as it's clean and super accessible.

The only negative experience I had wasn't actually Gatsby's fault at all - it was GitHub Pages. I find the documentation to be super lacking as it is slightly ambiguous when it comes to hosting a static site on a custom domain with HTTPS. However, there was a silver lining here and that was I got to check out [Vercel](https://vercel.com) and all I can say is _wow_. They've really got it together when it comes to getting up and running with a static site. It automatically worked out that my GitHub project was a Gatsby one and immediately deploys to a unique URL (plus your own custom domain if you provide one). It does this for every push to master which is great. It was also very clear how to set up with a custom domain so it gets a Dave Cooper thumbs up, for sure.

Anyway, that's my stream of consciousness about how much I'm a fan of Gatsby. Hit me up if you've got any questions about it or need help getting going with your own site.

-Dave
