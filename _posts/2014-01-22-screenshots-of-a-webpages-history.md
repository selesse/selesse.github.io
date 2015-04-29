---
layout: post
title:  "Screenshots of a Webpage's History"
date:   2014-01-22 22:49:00
categories: git bash
redirect_from: '/blog/7/'
---

This entire post will be about using short scripts to automate the task of
taking screenshots of a webpage's history. The task has been split up into
two components: going through a file's history programmatically and taking a
screenshot of a given webpage.

### Requirements

To follow this example, you will need Firefox, Git, PHP and Python. I chose
this particular combination because selesse.com is a custom-made PHP MVC
framework. I decided to write this post after I wrote this code to see the
progression of my own [about page](/about/).

In addition to my odd choice of dependencies, you will need to install Selenium
via `pip` or `easy_install`:

`[sudo] pip install selenium` or `[sudo] easy_install selenium`

### Setup

Consider the scenario where you have a PHP webpage and you'd like to
visually see its progression. Conveniently, you've also been using Git to store
the history. In this case, the webpage in question will be called `about.php`.

**Note**: The languages and source control tools are implementation details;
they could easily be swapped out.

Here's the file progression for the different `about.php` versions. Every
different version represents a different Git commit.

#### about.php - version 1

```php
<?php echo "Hello, world!"; ?>
```

#### about.php - version 2

```php
<html>
<body>
  <h1> About me </h1>
  <p> This is all about me </p>
</body>
</html>
```

#### about.php - version 3

```php
<html>
<style>
  body {
    font-family: "Comic Sans MS";
    color: green;
  }
</style>
<title> My Fun Page </title>
<body>
<h1> All about me </h1>
<div>
  My name is Joe.
</div>
<ul>
  <li> I like reading </li>
  <li> I like long walks on the beach </li>
  <li> I like <?php echo "PHP"; ?> </li>
</ul>
</body>
</html>
```

### The Code

First, create a Python file that will take screenshots of a given URL:
`take-screenshot.py`.

```python
import selenium.webdriver as webdriver
import contextlib
import sys

if len(sys.argv) == 1:
  print("You need to pass your desired screenshot name to this script.")
  print("  i.e. %s screenshot1" % (__file__))
  sys.exit(1)

filename = sys.argv[1]
try:
  url = sys.argv[2]
except Exception:
  url = ""

with contextlib.closing(webdriver.Firefox()) as driver:
  driver.implicitly_wait(3)
  driver.set_window_size(1024, 768)
  driver.get('http://localhost:3000' + url)
  driver.get_screenshot_as_file(filename + '.jpg')
```

This script takes one (or two) parameters: the filename to save the screenshot
to and the URL to hit. When called, it will open up Firefox at the specified
resolution, grab a screenshot, and save it to `filename.jpg`. It also assumes
you'll be running any kind of web server on port 3000. For true robustness,
it'd be better to have the port and url passed in.

Next, create a file called `grab-all-screenshots.sh` in your Git root folder.

```bash
#!/bin/bash

screenshot_directory="screenshots"
history_file="about.php"
url_to_hit="/about.php"

mkdir -p "$screenshot_directory"

# get a count of the total number of commits for "$history_file"
total_commits=$(git log --follow -- $history_file | grep "commit " | wc -l | tr -d ' ')

git checkout master

# start serving PHP in this directory
php -S localhost:3000 -t `pwd` &

processed=0
git log --follow -- $history_file | grep "commit " | cut -f2 -d' ' | while read sha; do
  commit_number=$(expr $total_commits - $processed)

  git checkout $sha
  python take-screenshot.py "$screenshot_directory/$commit_number"-"$sha" $url_to_hit

  processed=$(expr $processed + 1)
done

git checkout master

killall php
```

First, we start our PHP server on port 3000. Then, for every commit, we keep
track of the Git sha and the current commit number that we're at. We go
backwards through time, calling our `take-screenshot.py` script at every step.
The `$processed` and `$commit_number` variables let us keep track of which
commit we're at numerically. For example, if we have a total of 3 commits for a
particular page, we'd go from 3 to 2 to 1.

Something worth mentioning is that by using the `--follow` flag,
we are immune to changes in file renames.

Once that's done, we're ready to run `./grab-all-screenshots.sh`. These files
should appear in the `screenshots` folder (with different shas):

<!-- oh yeah, I went there. -->
<style type="text/css">
  img {
    border: 1px solid black;
  }
</style>

### 1-484f5e2421132e52337b8306c0cde86858472489.jpg

![First screenshot]({{ site.baseurl }}/assets/7-1.jpg)

### 2-d0898d1492720de2f5ec86bb1694f3bf2c167aaf.jpg

![Second screenshot]({{ site.baseurl }}/assets/7-2.jpg)

### 3-be2b6062e358252042022dc8c2b28cb1b8bf1b1c.jpg

![Third screenshot]({{ site.baseurl }}/assets/7-3.jpg)

One thing to be wary of: if you have any external requests (like Google
Analytics), you may want to consider disabling your Internet for the duration
of the script.

### Conclusion

Despite the silly example, hopefully the power of automated screenshots was
demonstrated. The point was to show how easy it is to create something similar
for a website with a more complicated history in just a few lines of Bash and
Python.

One major limitation of the script is that it assumes that a particular page
URL stays constant over time. For selesse.com, this wasn't true. The URL
changed from `/about.php` to `/about/`.

Going through the pictures will give you good insights into that webpage's
evolution. For someone like me who is not particularly apt at making pages
look pretty, it was fun to see the aesthetics improve over time.
