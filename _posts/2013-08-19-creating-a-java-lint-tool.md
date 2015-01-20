---
layout: post
title:  "Creating a Java Lint Tool"
date:   2013-08-19 22:19:00
categories: java lint
---

Like many other programmers, I'm always looking for excuses to code
things. Unfortunately, I'm not very good at actually implementing my ideas. My
current priorities as a software engineering graduate are to improve in the
following areas:

  1. Experience
  2. Code cleanliness (will always be continuously ongoing)
  3. Implementing modular code
  4. Ability to deal with large code bases

I thus decided to create a Java Lint tool (`jxlint`) to help scratch some of
these itches. [Lint](http://en.wikipedia.org/wiki/Lint_(software\)) tools
generally perform static analysis of source code. In this case, `jxlint` is a
framework developed to enable easy analysis. Fortunately, the analysis will
not be part of the framework, which increases the tool's usefulness. My
personal use case for the tool will be similar to that of [Android's lint tool](http://developer.android.com/tools/help/lint.html).
In fact, many of the behaviors in `jxlint` were modeled and inspired by
Android lint.

My personal need for such a tool was work-related. For one of the frameworks I
used, there were various application behaviors described via XML files. Some
of these behaviors, if incorrectly configured, would cause runtime crashes. I
thought it might be interesting to see if a lint tool could be developed to
help speed up development. The name `jxlint` comes from the original intent of
the project: Java XML lint tool. (The "x" in jxlint is no longer really
relevant.)

I split the "project" into two separate phases:

1. **Framework development**. This phase would be where I attempt to figure
   out what would work for 80% of the use cases. I'd build something
   well-tested, extensible, and useful. It'll be great to gain experience in
   building a framework. This is extremely useful because building frameworks
   is hard.
2. **[Dogfooding](http://en.wikipedia.org/wiki/Eating_your_own_dog_food)**.
   Here, I'd use my own framework to develop that XML linter for work.
   Hopefully, through using it, I'd gain good insights about what worked and
   what didn't and could iterate based on that. I will attempt to persuade
   some coworkers to help me build some rules and get feedback through that.

#### Why static analysis? Doesn't this already exist?

The tool created is not meant to be new, special, or particularly exciting.
It's a problem that I encountered where I decided that it'd be interesting to
attempt to solve it. Practice at coding is a major motivator, much more so
than the actual result. And even though they already exist, it's much harder
to come up with your own solution than to read someone else's and go "Oh yeah,
I'd have done that."

#### Goals

The major goal of the project is to have a lint tool where adding rules and
their corresponding test is extremely easy.

A secondary goal is to create the program without much external influence by
other tools. This will hopefully let me compare my architecture to other
existing systems. The project will be at constant risk of having me over
complicating things or doing things naively.
