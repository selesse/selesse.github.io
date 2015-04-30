# Section 1

### Introduction

Today, we're going to convert an Ant target to a Gradle task.

Specifically, we'll be looking at a target/task called `createConfigs` that
generates files based on some `.properties`.

The Git repository to go along with this post can be found
[here](https://github.com/selesse/gradle-ant).

# Section 2

### Setup

The Ant target is:

```xml
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
```

The actual `build.xml` that was converted made use of variables. I've
omitted them from this sample for brevity. It also had a total of 8 files
rather than 2, and one file had up to 20 properties being replaced.

# Section 3

### Problem

1. Every new `*.in` file needs to be configured in the `build.xml`.
2. Every property that we want to replace has to be specified.
3. Every time we run the `createConfigs` target, these files are re-generated.
   Even if there were no changes to either the input or the output,
   we're still going to overwrite files.

# Section 4

### Solution

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

This solution addresses all 3 previous criticisms.

<!-- oh yeah, I went there. -->
<style type="text/css">
  img {
    border: 1px solid black;
    margin: 10px 10px;
  }
</style>

#### Gradle

![Gradle task regeneration](/assets/8-gradle.png)

#### Ant

![Ant target results](/assets/8-ant.png)
