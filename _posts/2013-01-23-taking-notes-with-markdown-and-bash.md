---
layout: post
title:  "Taking Notes with Markdown and Bash"
date:   2013-01-23 21:27:00
categories: markdown bash
---

I'm taking an anthropology class this semester (read: a class where you need
to take notes) and I want to use vim to take down my notes.

For my first lecture, I wrote my notes in plain text, formatting it
inconsistently and in whatever way that let me keep up with the professor. For
the second lecture, I had a fun thought: why don't I write my notes in HTML?
So I started writing my notes in basic HTML, wrapping paragraphs in \<p\>'s but
I found myself facing the same problem as before, but it was even harder to
style. The end result was prettier at the cost of distracting me and preventing
me from paying close attention to the lectures.  Also, the raw notes were in
HTML, so it wasn't exactly pretty to read the source.

Then I remembered [Markdown](http://daringfireball.net/projects/markdown/).
Markdown lets you convert text to HTML in a pretty convenient way.  It's
commonly used on <http://github.com> repositories.

Thinking of the cool things I could do, I came up with the following bash
script:

Note: redcarpet is required (`gem install redcarpet`). You can substitute
`redcarpet` with any other markdown tool (like [this
one](https://github.com/chjj/marked)).

<pre class="prettyprint">
#!/bin/bash

# Bash script created to generate HTML pages from a set of markdown notes.

# Run this in a directory with .markdown files and it'll overwrite any .html
# files with the same name (i.e. 3.markdown becomes 3.html). Also writes
# index.html which is an index of all your notes with links to them.

# written by Alex Selesse on January 23, 2013

set -e

COURSE=&quot;ANTH 210 - Intro to Archaeology&quot;

function header() {
  echo &quot;&lt;!doctype html&gt;&quot;
  echo &quot;&lt;head&gt;&quot;
  echo '  &lt;meta http-equiv=&quot;Content-Type&quot; content=&quot;text/html; charset=UTF-8&quot;/&gt;'
  # include our custom css
  echo '  &lt;link rel=&quot;stylesheet&quot; href=&quot;notes.css&quot; type=&quot;text/css&quot;/&gt;'
  # include Twitter's Bootstrap
  echo '  &lt;link rel=&quot;stylesheet&quot; href=&quot;bootstrap.css&quot; type=&quot;text/css&quot;/&gt;'
  echo '  &lt;link rel=&quot;stylesheet&quot; href=&quot;bootstrap-responsive.css&quot; type=&quot;text/css&quot;/&gt;'
  echo &quot;  &lt;title&gt;$@&lt;/title&gt;&quot;
  echo &quot;&lt;/head&gt;&quot;
  echo &quot;&lt;body&gt;&quot;
  echo '&lt;div class=&quot;container-fluid&quot;&gt;'
  echo '  &lt;div class=&quot;row-fluid&quot;&gt;'
}

function footer() {
  echo &quot;  &lt;/div&gt;&quot;
  echo '  &lt;div class=&quot;row center&quot;&gt;'
  echo '    &lt;a href=&quot;index.html&quot;&gt; &lt;h3&gt; Home &lt;/h3&gt; &lt;/a&gt;'
  echo '  &lt;/div&gt;'
  echo &quot;&lt;/div&gt;&quot;
  echo &quot;&lt;/body&gt;&quot;
  echo &quot;&lt;/html&gt;&quot;
}

# every markdown file is its own html page, keep track of them
NOTES=()

# list markdown files, sort numerically (so 10.blah comes after 9.blah)
for file in `ls *.markdown | sort -fg`; do
  # extract filename, 3.markdown becomes 3.html
  filename=&quot;${file%.*}.html&quot;

  # print header, redcarpet'd file, footer
  {
    header &quot;$filename&quot;
    redcarpet &quot;$file&quot;
    footer
  } &gt; $filename

  # keep track of all the HTML files we're going through
  NOTES+=(&quot;$filename&quot;)
done

# create index file where you'll be able to access all your notes
{
  header &quot;Notes for $COURSE&quot;
  echo &quot;&lt;h1&gt; Notes for $COURSE &lt;/h1&gt;&quot;
  echo &quot;&lt;h3&gt; Generated `date` &lt;/h3&gt;&quot;
  echo '&lt;div class=&quot;row center&quot;&gt;'
  echo '  &lt;div class=&quot;span4&quot;&gt;&lt;/div&gt;'
  echo '  &lt;div class=&quot;span4&quot;&gt;'
  echo '    &lt;ul class=&quot;nav nav-pills nav-stacked&quot;&gt;'
  # for every file we have produced, add it to the &quot;master&quot; file
  for file in ${NOTES[@]}; do
    filename=&quot;${file%.*}.markdown&quot;
    echo &quot;    &lt;li&gt;&lt;a href=\&quot;$file\&quot;&gt;$file&lt;/a&gt;&quot;
    echo &quot;(last modified &quot;
    echo &quot;$(perl -e &quot;print scalar(localtime(`stat -f %m $filename`))&quot;))&quot;
  done
  echo &quot;    &lt;/ul&gt;&quot;
  echo '  &lt;/div&gt;'
  echo '  &lt;div class=&quot;span4&quot;&gt;&lt;/div&gt;'
  echo '&lt;/div&gt;'
  footer
} &gt; index.html
</pre>

The result is an *index.html* file that contains links to every one of your
Markdown files. It also appends the same header and footer to the index and
all of the html files, so styling is consistent and you'll be able to find
your way back to the index via every file. It also tells you the last time the
Markdown files were modified - useful to track down when particular topics
were covered.

I've been using it for a few weeks and I'm really happy with it. I like
reading my notes in Markdown or having them nicely structured in HTML.

Bonus: it's much easier to write notes in Markdown than HTML.
