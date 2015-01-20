---
layout: post
title:  "The Gradle Application Plugin and Fast Testing"
date: 2014-09-28 22:29:00
categories: gradle
---

If you're developing a Java application, the [Gradle application plugin][1] is
a pretty great resource. By specifying the entry point to the application,
i.e. `mainClassName`, some useful Gradle tasks are made accessible. For
example, `gradle run` compiles and runs the application.

For example, suppose you have the following directory structure:

```
$ tree .
.
├── build.gradle
└── src
    └── main
        └── java
            └── com
                └── selesse
                    └── example
                        └── Main.java

6 directories, 2 files
```

The `build.gradle` file contains:

```groovy
apply plugin: 'application'
apply plugin: 'java'

mainClassName = 'com.selesse.example.Main'
```

And `com.selesse.example.Main` contains:

```java
package com.selesse.example;

public class Main {
    public static void main (String[] args) {
        System.out.println("Hello, world!");
    }
}
```

When you execute `gradlew run`, you'll see the following output:

```
$ gradlew run                                                                                                                                                                       86%
:compileJava
:processResources UP-TO-DATE
:classes
:run
Hello, world!

BUILD SUCCESSFUL

Total time: 0.841 secs
```

Another useful feature of the application plugin is its ability
to generate start scripts. By running `gradlew installApp` (for a different
project and directory), the following directory structure is created:

```
$ tree jgitstats/build/install
jgitstats/build/install
└── jgitstats
    ├── bin
    │   ├── jgitstats
    │   └── jgitstats.bat
    └── lib
        ├── JavaEWAH-0.7.9.jar
        ├── commons-codec-1.4.jar
        ├── commons-collections-3.2.1.jar
        ├── commons-lang-2.4.jar
        ├── commons-logging-1.1.1.jar
        ├── docopt-0.6.0-SNAPSHOT.jar
        ├── git-wrapper-0.1.0.jar
        ├── guava-18.0.jar
        ├── httpclient-4.1.3.jar
        ├── httpcore-4.1.4.jar
        ├── jcommon-1.0.23.jar
        ├── jfreechart-1.0.19.jar
        ├── jgitstats-0.1.0.jar
        ├── jsch-0.1.50.jar
        ├── logback-classic-1.1.2.jar
        ├── logback-core-1.1.2.jar
        ├── org.eclipse.jgit-3.4.1.201406201815-r.jar
        ├── slf4j-api-1.7.6.jar
        └── velocity-1.7.jar

3 directories, 21 files
```

Your application's dependencies are included in the `lib` directory, and 2
OS-specific start scripts are created (`jgitstats`, `jgitstats.bat`).  This
allows you to run your application from anywhere by running the script,
without specifying any classpath parameters. This is pretty great!

Unfortunately, executing the program will take a lot of typing, especially if
you're passing arguments:

```bash
~/git/jgitstats/jgitstats/build/install/jgitstats/bin/jgitstats <YOUR PROGRAM MAY ACCEPT ARGUMENTS HERE>
```

Additionally, you might be quickly iterating and making changes to your
application, so you might forget to run `gradlew installApp` in the right
directory. To alleviate the clunky long path typing, I created a short utility
script, `gradle-application-helper`:


```bash
#!/bin/bash

set -e

function run_gradle_application() {
    GRADLE_ROOT_DIRECTORY="$1"
    PATH_FROM_GRADLE_ROOT="$2"

    EXE_PATH="$GRADLE_ROOT_DIRECTORY/$PATH_FROM_GRADLE_ROOT"

    $(builtin cd "$GRADLE_ROOT_DIRECTORY" && ./gradlew installApp > /dev/null)

    shift; shift

    echo $EXE_PATH "${@}"
    exec $EXE_PATH "${@}"
}
```

This script just exposes a function, `run_gradle_application`, that accepts a
Gradle root directory and a path from the Gradle project's root. Here's an
example script that uses it, `jgitstats`:

```bash
#!/bin/bash

source $HOME/bin/gradle-application-helper

PROGRAM_NAME="jgitstats"
GRADLE_ROOT_DIRECTORY="$HOME/git/$PROGRAM_NAME"
PATH_FROM_GRADLE_ROOT="$PROGRAM_NAME/build/install/$PROGRAM_NAME/bin/$PROGRAM_NAME"

run_gradle_application "$GRADLE_ROOT_DIRECTORY" "$PATH_FROM_GRADLE_ROOT" $*
```

Now, every time `jgitstats` script is run, run the Gradle target `installApp`
is executed. If it's successful, the application is called with any arguments
passed to the script:

```
$ jgitstats some-lint
/Users/alex/git/jgitstats/jgitstats/build/install/jgitstats/bin/jgitstats some-lint
17:41:48.846 [main] DEBUG com.selesse.jgitstats.Main - Got {<git-repo>=some-lint, --branch=master} from arguments
17:41:49.019 [main] ERROR com.selesse.jgitstats.Main - Error: /Users/alex/git/some-lint is an invalid Git root
```

If there's a compilation error, a Gradle/Java error message detailing what
went wrong will be printed:

```
$ jgitstats .
/Users/alex/git/jgitstats/jgitstats/src/main/java/com/selesse/jgitstats/Main.java:23: error: ';' expected
        LOGGER.debug("Got {} from arguments", options);
              ^
1 error

FAILURE: Build failed with an exception.

* What went wrong:
Execution failed for task ':jgitstats:compileJava'.
> Compilation failed; see the compiler error output for details.

* Try:
Run with --stacktrace option to get the stack trace. Run with --info or --debug option to get more log output.
```

This allows users to test quickly for programs that have inputs that are
constantly changing. In the above example, the program in question is a Git
repository analyzer. After I was done writing code, I wanted to test the
output on multiple projects and a fast way to make changes without needing to
worry about compilation and packaging.

One caveat is that if this program rarely changes, running `gradlew
installApp` every time is wasteful. This is intended only to be useful for
development on programs accepting command line parameters.

[1]: http://www.gradle.org/docs/current/userguide/application_plugin.html
