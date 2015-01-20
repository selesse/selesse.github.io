---
layout: post
title:  "Using jxlint"
date:   2013-11-18 18:50:00
categories: java lint jxlint
---

As referenced in [my previous blog post](/blog/3/), I recently created a
static analysis tool in Java. For this post, I'll explain how to use it.
You can find the code [on Github](https://github.com/selesse/jxlint).
(I haven't yet had a chance to use this on a real system, so its
development has somewhat stagnated.)

The tool's help file looks like this:

    usage: jxlint [flags] <directory>
     -h,--help                Usage information, help message.
     -v,--version             Output version information.
     -l,--list                Lists lint rules with a short, summary
                              explanation.
     -s,--show <RULE[s]>      Lists a verbose rule explanation.
     -c,--check <RULE[s]>     Only check for these rules.
     -d,--disable <RULE[s]>   Disable the list of rules.
     -e,--enable <RULE[s]>    Enable the list of rules.
     -w,--nowarn              Only check for errors; ignore warnings.
     -Wall,--Wall             Check all warnings, including those off by
                              default.
     -Werror,--Werror         Treat all warnings as errors.
     -q,--quiet               Don't output any progress or reports.
     -t,--html <filename>     Create an HTML report.
     -x,--xml <filename>      Create an XML (!!) report.

    <RULE[s]> should be comma separated, without spaces.
    Exit Status:
    0                     Success
    1                     Failed
    2                     Command line error

Assuming you know nothing about jxlint (and just want to use it), here's what
you need to know to start using it. For those who prefer perusing code
over reading, [here's a sample XML implementation](https://github.com/selesse/jxlint/tree/master/src/test/java/com/selesse/jxlint/samplerules/xml).

### Using jxlint to implement your own lint tool

To use jxlint, clone the Github repository:

    git clone https://github.com/selesse/jxlint.git

The first step is to create a "container" class for all your rules. This will
be the class that you'll modify if you want to add (or delete) rules in your
system. Note that rules can be enabled or disabled on a per-rule basis at
runtime (by specifying the appropriate command line options). This container
 class should extend `AbstractLintRules`; you'll need to implement
`initializeLintRules`. You'll have access to the `lintRules` variable, which is
of type `List<LintRule>`.

```java
public class MyXmlLintRulesImpl extends AbstractLintRules {
    @Override
    public void initializeLintRules() {
    }
}
```

Then, modify the main method in `com.selesse.jxlint.Main`. It should look like
this:

```java
public static void main(String[] args) {
    LintRulesImpl.setInstance(new MyXmlLintRulesImpl());
    new Main().run(args);
}
```

Now all that's needed is to create some rules and add them to the
`AbstractLintRules` implementation.

Every rule should extend `LintRule`. This class needs to override two methods:
`List<File> getFilesToValidate()` and `boolean applyRule(File file)`.
Essential variables/functions are `getSourceDirectory()` (which returns
the directory that the lint project is in), and `failedRules` (which is a
`List<LintError>`).

For this example, I'll create a rule saying that every XML file should have a
root-element `<author>` tag with 2 attributes.

```java
public class AuthorTagRule extends LintRule {
    public AuthorTagRule() {
        String name = "Author tag specified";
        String summary = "XML files must contain a valid root-element <author> tag.";
        String detailedDescription = "For style purposes, every XML file must contain an " +
            "<author> tag as the root element. This tag should also have the 'name' and 'creationDate' " +
            "attributes. For example:\n<?xml version=\"1.0\" encoding=\"UTF-8\">\n<author name=\"Alex Selesse\" " +
            "creationDate=\"2013-11-18\">\n .. content ..\n</author>";
        Severity severity = Severity.WARNING;
        Category category = Category.STYLE;
        boolean enabledByDefault = false;

        super(name, summary, detailedDescription, severity, category, enabledByDefault);
    }

    @Override
    public List<File> getFilesToValidate() {
        return FileUtils.allFilesIn(getSourceDirectory());
    }

    @Override
    public boolean applyRule(File file) {
        try {
            DocumentBuilderFactory documentBuilderFactory = DocumentBuilderFactory.newInstance();
            DocumentBuilder documentBuilder = documentBuilderFactory.newDocumentBuilder();
            documentBuilder.setErrorHandler(null); // shut up!
            Document document = documentBuilder.parse(file);

            document.getDocumentElement().normalize();

            Node node = document.getFirstChild();
            if (node.getNodeName().equals("author")) {
                NamedNodeMap namedNodeMap = node.getAttributes();
                if (namedNodeMap.getNamedItem("name") == null || namedNodeMap.getNamedItem("creationDate") == null) {
                    // report that "name", "creationDate", or both attributes are missing
                    String failedRuleString = "";
                    if (namedNodeMap.getNamedItem("name") == null) {
                        failedRuleString += "Author element does not contain \"name\" attribute";
                    }
                    if (namedNodeMap.getNamedItem("creationDate") == null) {
                        if (failedRuleString.length() > 0) {
                            failedRuleString += ". Also, author ";
                        }
                        else {
                            failedRuleString += "Author ";
                        }
                        failedRuleString += "element does not contain \"creationDate\" attribute";
                    }
                    failedRules.add(new LintError(this, file, failedRuleString));
                    return false;
                }
                return true;
            }
        } catch (Exception e) {
            // this will catch parser configuration errors, XML parse errors, as well as I/O exceptions
            failedRules.add(new LintError(this, file, "Error checking rule, could not parse XML", e));
            return false;
        }

        failedRules.add(new LintError(this, file, "Author element was not root element"));
        return false;
    }
}
```

Add this to the `AbstractLintRules`, and you're done:

```java
public class MyXmlLintRulesImpl extends AbstractLintRules {
    @Override
    public void initializeLintRules() {
        lintRules.add(new AuthorTagRule());
    }
}
```

To run your tool, compile the code by running the Gradle wrapper.
 On Windows, `gradlew.bat release`; on everything else `./gradlew
release`. If you want to validate the files in `$HOME/target-folder`, use
`java -jar release/jxlint*.jar $HOME/target-folder`.

(I don't like the idea of using `java -jar <jxlint jar> <target-folder>`
as a permanent solution; creating a script or executable is on the backlog.)

### Utilities

The [FileUtils](https://github.com/selesse/jxlint/blob/master/src/main/java/com/selesse/jxlint/model/FileUtils.java)
class contains a few helpful utility methods: `List<File> allXmlFilesIn(File)`,
`List<File> allFilesIn(File)`,
`List<File> allFilesWithExtensionIn(File, String extension)`,
`List<File> allFilesWithFilenameIn(File, String fileName)`. These are
especially when overriding `LintRules`'s `List<File> getFilesToValidate()`.

### Custom reporting

A `Reporter` is a class that formats the caught jxlint errors in a nice,
easy-to-read way.

Reporters should override the 4 following functions:

1. `printCategoryHeader()`
2. `printHeader()`
3. `printError(LintError error)`
4. `printFooter()`

There are 3 default reporters that should cover most of the cases.
One of the goals was to allow any extra functionality (i.e. report to CSV)
to be intuitive and easy.

1. The [DefaultReporter](https://github.com/selesse/jxlint/blob/master/src/main/java/com/selesse/jxlint/report/DefaultReporter.java)
is a console reporter. This is what it looks like in action:

    ![Default reporter sample output]({{ site.baseurl }}/assets/default-reporter.png)

2. The [HtmlReporter](https://github.com/selesse/jxlint/blob/master/src/main/java/com/selesse/jxlint/report/HtmlReporter.java)
is a basic, unstyled HTML reporter. It is the one that might prove most
useful to override. [This is what it looks like](/blog/jxlint.html) in
the same context as the `DefaultReporter`.
3. The [XmlReporter](https://github.com/selesse/jxlint/blob/master/src/main/java/com/selesse/jxlint/report/XmlReporter.java)
is a basic XML reporter. [This is what it looks like](/blog/jxlint.xml)
in the same context as the `DefaultReporter`.

### Conclusion

This has hopefully given you a brief overview of how to use jxlint. Ideally,
you can now appreciate how getting started with jxlint is fast but powerful.
For more details (and up-to-date ones at that), it's best to browse the code's
sample implementations.

In a future post, I will provide my opinion on the good parts and bad parts of
the code and tool. Please send me an email if you have any suggestions or
comments.
