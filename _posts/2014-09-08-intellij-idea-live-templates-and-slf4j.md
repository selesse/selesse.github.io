---
layout: post
title:  "IntelliJ IDEA, Live Templates and SLF4J"
date: 2014-09-08 08:17:00
categories: idea intellij
redirect_from: '/blog/9/'
---

I've only recently started appreciating (and using) logging frameworks. I
mostly work in Java, so [SLF4J][1] is an obvious choice. For those that don't
know SLF4J, the first paragraph on its website explains it really well:

> The Simple Logging Facade for Java (SLF4J) serves as a simple facade or
> abstraction for various logging frameworks (e.g. java.util.logging, logback,
> log4j) allowing the end user to plug in the desired logging framework at
> deployment time.

The most common way to use SLF4J is to instantiate a `Logger` field:

```java
private static final Logger LOGGER = LoggerFactory.getLogger(ThisClass.class);
```

Or, with the more verbose fully qualified approach:

```java
private static final org.slf4j.Logger LOGGER = org.slf4j.LoggerFactory.getLogger(ThisClass.class);
```

There's a lot of repetition involved if you have to sprinkle logging
throughout an application. As such, it might be tempting to copy and paste a
`Logger` instantiation from one class to another. If you copied this
particular snippet, though, you'd be creating a Logger for the `ThisClass`
class, and might forget to update the field to match the class you're logging
for. I'm guilty of having done this this; I only realized my
mistake when I noticed some logs were coming from the wrong class.

IntelliJ IDEA offers a cool feature called [live templates][2]. A live
template shortcut is some pre-defined text that gets expanded. For example,
typing `psvm`, then pressing on the tab character will expand to `public
static void main (String[] args)`. These templates are customizable, and you
can specify the context under which they're permissible.

To access these, go to `Settings`, then `Live Templates`:

![Live Template menu in IntelliJ IDEA][3]

Once there, create a template under whatever category seems fitting. As an
abbreviation, I used `slf4j`. For context, I used "Java statement" and "Java
declaration". In the template text, I used:

```java
private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger($CLASS_NAME$.class);
```

To define `$CLASS_NAME$`, in "Edit variables", write `className()` as the
expression, and click "Skip if defined". Putting it all together, it should
look like this:

![Live template for SLF4J][4]

Now, see it in action!

![SLF4J Demo Gif][5]


This isn't anything revolutionary, it's just a neat feature I discovered and
wanted to share. It made me realize I should spend a bit more time learning my
IDE.

[1]: http://www.slf4j.org "SLF4J Home"
[2]: http://www.jetbrains.com/idea/webhelp/live-templates.html "Live Templates" 
[3]: {{ site.baseurl }}/assets/9-live-templates.png "Live Template Menu"
[4]: {{ site.baseurl }}/assets/9-slf4j-template.png "SLF4J Live Template Settings"
[5]: {{ site.baseurl }}/assets/9-slf4j.gif "SLF4J live template expansion demo"
