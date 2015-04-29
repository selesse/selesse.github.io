# Section 1

### Introduction

Today, we're going to look at converting part of a `build.xml` (Ant) file
into a `build.gradle` (Gradle) file.

Specifically, we'll be looking at a target/task called `createConfigs` that
generates files based on some `.properties`. The Gradle target will be
superior to the Ant task; it will also be shorter.

The Git repository to go along with this post can be found
[here](https://github.com/selesse/gradle-ant).

# Section 2

### Setup

The Ant [build.xml](https://github.com/selesse/gradle-ant/blob/master/build.xml)
looks like this:

```xml
<project name="gradle-ant">

    <target name="createConfigs" depends="" description="Create config files">

        <echo message="Creating log4j.properties" />
        <copy file="src/main/resources/log4j.properties.in" tofile="src/main/resources/log4j.properties" overwrite="true" />
        <replace file="src/main/resources/log4j.properties" propertyFile="some.properties">
            <replacefilter token="@logger.level@" property="logger.level" />
        </replace>

        <echo message="Creating web.xml" />
        <copy file="src/main/webapp/WEB-INF/web.xml.in" tofile="src/main/webapp/WEB-INF/web.xml" overwrite="true" />
        <replace file="src/main/webapp/WEB-INF/web.xml" propertyFile="some.properties">
            <replacefilter token="@application.name@" property="application.name" />
            <replacefilter token="@cache.expiration@" property="cache.expiration" />
        </replace>

    </target>

</project>
```

(The original file that I converted was quite longer, did more substitutions
and replaced about 8 files in total. I've greatly simplified it for the sake
of the blog.)

What is this target doing? It's using some `*.in` files as templates,
copying them, and replacing some properties.

For example, if we had [log4j.properties.in](https://github.com/selesse/gradle-ant/blob/master/src/main/resources/log4j.properties.in):

    log4j.rootLogger = @logger.level@, stdout

and we also had [some.properties](https://github.com/selesse/gradle-ant/blob/master/some.properties):

    logger.level = DEBUG

Our Ant target `createConfigs` would create a `log4j.properties` file in the
same directory, and replace `@logger.level@` with "DEBUG", like so:

    log4j.rootLogger = DEBUG, stdout

You can imagine more complicated setups, where some properties dictate various
configurations.

#### Why are we even doing this task?

This task is pretty useful for when you want distinct configurations for
different types of deployment. For example, if you ever need to work with a
cache, you might want a different cache expiration on your production
environment than you would on your development environment. This kind of
organization makes it easy to separate this logic.

That being said, the script shared above doesn't even cover this scenario.
I've hard-coded the `.properties` file to be `some.properties` for the sake
of simplicity.

# Section 3

### Problem

This approach is undesirable for a few different reasons.

1. Every `*.in` file needs to be configured in the `build.xml`.
2. Every property that we want to replace has to be specified. Besides being
   error-prone, this can lead to some bad cut and paste habits.
3. Every time we run the `createConfigs` target, these files are re-generated.
   Even if there were no changes to either the input or the output,
   we're still going to overwrite files.

While these reasons aren't necessarily deal breakers, let's see how a more
sophisticated build system like [Gradle](http://gradle.org) would handle this
scenario.

# Section 4

### Solution

The solution I've come up with addresses all 3 issues.

Here's what the corresponding
[build.gradle](https://github.com/selesse/gradle-ant/blob/master/build.gradle)
looks like:

```groovy
def buildProperties = new Properties()
file("some.properties").withInputStream {
    buildProperties.load(it)
}

task createConfigs() {
    group 'Configuration'
    description 'Generates all configuration files'

    FileTree sources = fileTree(projectDir).include("**/*.in")
                                           .exclude("classes/", "bin/", "build/")

    sources.each { File source ->
        File newFile = new File(source.parentFile, source.name.replaceAll("\\.in", ""))
        def createTaskName = 'createConfig' + newFile.name.capitalize()
        def deleteTaskName = 'deleteConfig' + newFile.name.capitalize()

        task(createTaskName, type: Copy) {
            group 'Configuration'
            description 'Generates configuration file from "' +
                projectDir.toURI().relativize(source.toURI()) + '"'

            inputs.file source
            outputs.file newFile

            from source
            into source.parentFile
            rename '(.+)*.in', '$1'
            filter(org.apache.tools.ant.filters.ReplaceTokens, tokens: buildProperties)
        }

        task(deleteTaskName, type: Delete) {
            delete newFile
        }

        createConfigs.dependsOn(createTaskName)
        clean.dependsOn(deleteTaskName)
    }
}
```

With this, we're dynamically creating a task for every `*.in` file. By
doing this, Gradle knows *WHEN* to re-generate the files, and when not to.
Also, every configuration file that needs to be created gets a task,
for example: `./gradlew createConfigLog4j.properties`.

<!-- oh yeah, I went there. -->
<style type="text/css">
  img {
    border: 1px solid black;
    margin: 10px 10px;
  }
</style>

<div class="center">
    ![Gradle task regeneration](/img/8-gradle.png)
</div>

The Ant version is a little less inspired:

<div class="center">
    ![Ant target results](/img/8-ant.png)
</div>

