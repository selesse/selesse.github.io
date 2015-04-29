# Section 1

### Introduction

Today, we're going to look at converting a `build.xml` (Ant) file into a
`build.gradle` (Gradle) file.

Ant files (`build.xml`) are configured via XML, Gradle files (`build.gradle`)
are configured via a Groovy domain-specific language ([DSL](http://en.wikipedia.org/wiki/Domain-specific_language)).

Specifically, we'll be looking at a target/task called `createConfigs`. This
target is responsible for creating files based on templates. The
target algorithm is described below.

First, the templates get copied into their desired destinations (i.e.
`log4j.properties.in` gets copied to `log4j.properties`). Then, some strings
within these files are substituted by values configured in a
`*.properties` file. This process is repeated for as many files as desired.

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

This Ant project ("gradle-ant") only has one 'target': "createConfigs". This
target is responsible for copying 2 different files: `log4j.properties.in`
and `web.xml.in`. It copies them in the same directory as they are. After
it's copied them, it replaces the tokens specified (i.e. `@logger.level@` in
`log4j.properties.in` with the property `logger.level` found in
`some.properties`.

To run this Ant target, you'd type `ant createConfigs` in the directory the
`build.xml` file is in. You can try this by cloning the GitHub repository,
`cd gradle-ant`, and type `ant createConfigs`.

To further explain how this task works, I'll walk through an example. Suppose
we have [log4j.properties.in](https://github.com/selesse/gradle-ant/blob/master/src/main/resources/log4j.properties.in):

    log4j.rootLogger = @logger.level@, stdout

and we also have [some.properties](https://github.com/selesse/gradle-ant/blob/master/some.properties):

    logger.level = DEBUG

Our Ant target `createConfigs` would create a `log4j.properties` file in the
same directory as `log4j.properties.in`, and replace `@logger.level@` with
"DEBUG", like so:

    log4j.rootLogger = DEBUG, stdout

Similarly, `web.xml` would get created with `@application.name@` and
`@cache.expiration@` substituted with whatever's in `some.properties`.

#### Why are we even doing this task?

Suppose you are working on an application, and you want to cache some of
your resources. In your production environment, when your resources are pretty
stable and you're receiving lots of traffic, you might want to instruct the
browser to cache certain resources for a long time. However, when you're
developing, you might have a hard time if you have to wait an hour for a
resource to become stale. Thus, in general, this kind of task is pretty useful
for when you want distinct configurations for different types of deployment.

The way it's currently organized will *not* work "out of the box". Usually,
a separate `production.properties` and `development.properties`

That being said, the script shared above doesn't even cover this scenario.
I've hard-coded the `.properties` file to be `some.properties` for the sake
of simplicity.

# Section 3

### Problem

This approach is undesirable for a few different reasons.

1. Every `*.in` file needs to be configured in the `build.xml`. Every new file
   we want to template like this will need to be added,
   which means adding a minimum of 4 lines of configuration per file. 1
   line to specify the input file "variable", 1 line to specify the output
   file "variable", 1 line to specify the copy XML task and `n + 2` lines to
   specify the properties, where `n` is the number of properties you want to
   replace.
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

The solution I've come up with addresses all 3 issues. I will first show the
solution, then explain how it works.

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

There are 2 "main" parts to the file: the `createConfigs` task and the
Properties section. The Properties part was moved out of the `createConfigs`
because it didn't really fit inside the `createConfigs` task.

The "Properties" section simply loads the `some.properties` file into a Java
[Properties](http://docs.oracle.com/javase/8/docs/api/java/util/Properties.html)
object. For the case of our mock project, we won't look at whether or not the
file exists; we'll just assume it's there.

The rest of the script is creating a Gradle task called `createConfigs`. In
it, we first scan the `projectDir` (a variable provided by Gradle that's in
scope) for every file that ends in `*.in`, except in the directories
`classes/`, `bin/` and `build/`. We don't want to generate any files from any
generated directory - that would cause weird issues.

Then, for every `*.in` file, we dynamically create a Gradle task. The Gradle
task name is the `createConfig` and the file name without the `.in` part. So,
for `web.xml.in`, the task we'd create would be called `createConfigWeb.xml`.
To run it, we'd call `./gradlew createConfigWeb.xml`. The part where we
replace all the Property tokens happens when we call
`filter (ReplaceTokens, tokens: buildProperties)`. Our explicit specification
of `inputs` and `outputs` is done to help Gradle know when inputs and/or
outputs have changed.

Finally, we make `createConfigs` depend on all of the `createConfigXXX` tasks
we create. This way, we can just run `createConfigs` to create all the
configs, and we'll be able to see when every config files gets generated.

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

The first time we run `createConfigs`, both configuration files are generated
since they don't yet exist. The second time we run it, Gradle knows that the
files are up to date, so it doesn't bother re-generate them.

We then explicitly modify the files (an input file and an output file of two
separate configuration files to prove that it works!),
and re-run the `createConfigs` task. As we'd expect, both configuration files
get regenerated! All the issues we identified have been addressed.

The Ant version is a little less inspired:

<div class="center">
    ![Ant target results](/img/8-ant.png)
</div>

As suggested by Ant's output, the files are copied and replaced no matter what.
