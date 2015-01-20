---
layout: post
title:  "Readable Unit Tests in Java with AssertJ"
date: 2014-10-08 20:31:00
categories: java assertj testing
---

A common criticism of JUnit assertions is that the order of arguments in the
"assertEquals" function is ambiguous:

```java
@Test
public void testTwoVariablesAreEqual() throws Exception {
    assertEquals(a, b);
}
```

Is `a` the "expected" value, or is `b`? Can someone who's unfamiliar with the
conventions easily figure it out? Should you struggle to remember the order
every time? Do rhetorical questions help reader comprehension? When you run a
test and `a` is not equal to `b`, you'll see something like:

```
org.junit.ComparisonFailure: expected:<[a]> but was:<[b]>
    at org.junit.Assert.assertEquals(Assert.java:115)
```

If the order's wrong, it might be really confusing and time will be wasted
pinpointing the error.

### Solution #1 : JUnit

Instead of using `assertEquals`, JUnit's Assert class has `assertThat`:

```java
@Test
public void testTwoVariablesAreEqual() throws Exception {
    assertThat(a, is(b));
}
```

This is definitely more readable and easier to write. A failure of such a test
case looks something like:

```
java.lang.AssertionError:
Expected: is "b"
     but: was "a"
        at org.hamcrest.MatcherAssert.assertThat(MatcherAssert.java:20)
```

### Solution #2 : AssertJ

[AssertJ][1], a fork of [FEST][2], is a "rich and intuitive set of
strongly-typed assertions to use for unit testing (either with JUnit or
TestNG)". It allows developers to easily write object-specific assertions:

```java
@Test
public void testTwoVariablesAreEqual() throws Exception {
    assertThat(a).isEqualTo(b);
}
```

```
org.junit.ComparisonFailure: expected:<"[b]"> but was:<"[a]">
```

The [features highlight][3] section is really great, but I'll summarize what I
like most:

```java
@Test
public void testTwoVariablesAreEqual() throws Exception {
    List<String> someList = Lists.newArrayList();
    assertThat(someList).isEmpty();

    someList.add("someString");

    // List-specific assertions
    assertThat(someList).hasSize(1);
    assertThat(someList).contains("someString");

    // String-specific assertions
    assertThat("it's always sunny in Philadelphia").endsWith("Philadelphia");
}
```

What's great here is that AssertJ gives you class-specific assertions in a way
that's really readable. For example, `hasSize` and `contains` mean specific
things in the context of a `List`. If you're coding in Java, you're probably
using an IDE. If that's the case, when you use AssertJ, the autocompletion on
`assertThat(someVariable).` becomes almost magical! You know exactly what
types of assertions you can make on that object, and you can easily write your
own if you need to.

Another great thing about AssertJ is that you can write these neat
[class-specific assertions for custom objects][4]! AssertJ provides these
"custom" implementations for Guava, Joda-Time and others.

AssertJ provides some [helper scripts][5] that help when converting from JUnit
to AssertJ, or for when [migrating from FEST][6].

I wanted to write more on AssertJ, but when I was going through [its home
page][1], I realized that the documentation already does a better job than I
could.

### Conclusion

It's a powerful idea to have assertions that are context-specific. It makes
sense to have different assertions for different kinds of objects. AssertJ is
a great way to keep your tests readable and maintainable. If you're used to
the JUnit style of `assertEquals` like I was, AssertJ-style assertions are a
breath of fresh air!

[1]: http://joel-costigliola.github.io/assertj/index.html
[2]: https://code.google.com/p/fest/ "FEST: Fixtures for Easy Software Testing"
[3]: http://joel-costigliola.github.io/assertj/assertj-core-features-highlight.html
[4]: http://joel-costigliola.github.io/assertj/assertj-core-custom-assertions.html
[5]: http://joel-costigliola.github.io/assertj/assertj-core-converting-junit-assertions-to-assertj.html
[6]: http://joel-costigliola.github.io/assertj/assertj-core-migrating-from-fest.html
