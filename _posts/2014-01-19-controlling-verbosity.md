---
layout: post
title:  "Controlling Verbosity: A Proof of Concept"
date:   2014-01-19 22:45:00
categories: learning verbosity
redirect_from: '/blog/6/'
---

<script>
"using strict";

var content = [
[
  // Least verbose.
  "I came up with an idea. I'm using this blog post as a proof of " +
  "concept. My idea is to have a slider from which you can control the " +
  "verbosity of all the paragraphs on a page.",

  // Medium verbose.
  "Through reading through several blog posts and articles, I've noticed " +
  "that there's often either too much detail, or not enough. To 'remedy' " +
  "this, I came up with an idea. The reader of a post would have control " +
  "over the level of detail in every paragraph in a post. This would be " +
  "useful for scenarios where there are multiple target audiences with " +
  "varying expertises. I've created this blog post using this system, since " +
  "I'm also interested in the writer's perspective. Please note that I have " +
  "not researched whether or not something like this already exists.",

  // Most verbose.
  "I have a hard time reading blog posts when there's a lot of fluff. " +
  "Sometimes, it goes the other way: a blog post or a tutorial is just a " +
  "bit too vague. Other people reading the same content might have " +
  "different opinions, so it's impractical to yell at the content creator " +
  "for them to change it. So how do you make everybody " +
  "happy? I've recently been thinking about what it'd be like for both " +
  "a content creator and a content reader to be able to control the " +
  "verbosity of a paragraph. The reader would be have the ability to " +
  "control the verbosity for parts that are either too vague or too " +
  "detailed. This could be useful for things like providing " +
  "installation instructions. Suppose you're trying to document how to " +
  "install your Java application with Gradle. If somebody's already " +
  "familiar with Gradle, you might only want to tell them what target " +
  "to run. If somebody doesn't know Gradle, but knows Maven, they might " +
  "want different instructions. If somebody doesn't know Maven or " +
  "Gradle, you might want to write detailed instructions. " +
  "This blog post is a proof of concept and an example of such a " +
  "system. It should also be noted that I have not done any research on " +
  "this whatsoever. I was curious about both the reader and writer " +
  "perspective; this post has been created to satisfy both those " +
  "constraints.",
],

[
  "It might be worth writing the most verbose paragraph first as cutting " +
  "out words from paragraphs could be a useful experience.",

  "Creating these different paragraphs could be a useful experience for " +
  "the writer. Progressively summarizing and cutting out details from " +
  "the most detailed paragraph would be an easy and useful way to " +
  "approach the problem. Another thing to note is that the number of " +
  "verbosity levels could be completely different than what is " +
  "presented here.",

  "One of my first ideas was that the content creator would write the " +
  "most verbose paragraph first. The medium/regular level would then be " +
  "the summary of this most verbose paragraph. The least verbose " +
  "paragraph would be the summary the medium paragraph. Even though " +
  "doing these summaries is extra work, the expectation is that the " +
  "summarization will provide value to both the " +
  "reader and writer. One thing that should be specified is that " +
  "there doesn't need to be 3 different levels of verbosity. It's easy " +
  "to conceptualize things like \"small, medium, big\", and \"beginner, " +
  "intermediate, advanced\", that's why 3 levels were chosen.",
],

[
  "It could also be valuable to write the least verbose paragraph first, " +
  "then iteratively add to your paragraphs.",

  "Writers obviously have different needs and different ways of writing. " +
  "It would be interesting to observe how the process would be different " +
  "through writing the least verbose paragraph first and going the other " +
  "way. This would also heavily depend on the type of content being created.",

  "There could also be a lot of value to starting the other way: going " +
  "from least verbose to most verbose. It would depend on the type of " +
  "content being written. Writing installation instructions would " +
  "probably be most easily done from this order. You'd assume people " +
  "have a similar set-up to yours, or have the knowledge to figure it out " +
  "fairly easily. For a project that needs libraries installed, maybe you'd " +
  "just list them rather than detail things about what they are, where to " +
  "get them, etc."
],

[
  "Short essays such as this are not the intended target. I should write a " +
  "tutorial using this style.",

  "I don't think the most popular or intended use for this type of system " +
  "would be essays (like this one). Mixing and matching verbosity levels " +
  "might yield too many interesting combinations to read! It might be " +
  "worth further exploring this from the angle of a tutorial.",

  "The type of system I see this being used the most for is a system " +
  "that tries to educate its author. Different examples could be provided " +
  "at the different levels. Textbooks and online tutorials seem " +
  "like they might be interesting to read from this angle. Textbooks are " +
  "harder to vouch for since you might miss critical information by not " +
  "reading the most verbose paragraph. The writer would have to be careful " +
  "about how they split up their different levels. If it's organized in a " +
  "way that every verbosity-level contains the same information, it could " +
  "work. I have not done this in this post; you can choose different " +
  "levels in a row and have a hard time following the train of thought."
]
  ];

// Please don't judge me! This is proof of concept code.
// Originally, it was written using jQuery because I had it, but now I don't.
// I carefully hand-crafted this beautiful browser-agnostic JavaScript. ;)
document.addEventListener("DOMContentLoaded", function(event) { 
  for (var i = 0; i < content.length; i++) {
    var section = content[i];

    // Choose the middle granularity by default.
    var granularity = 1;
    var chosenContent = section[granularity];

    // Where's your jQuery God now?
    var inputRangeHtml = document.createElement("input");
    inputRangeHtml.setAttribute("id", "section" + i);
    inputRangeHtml.setAttribute("type", "range");
    inputRangeHtml.setAttribute("min", "1");
    inputRangeHtml.setAttribute("max", "3");
    inputRangeHtml.setAttribute("value", "2");

    var paragraphHtml = document.createElement("p");
    paragraphHtml.setAttribute("id", "section" + i);
    paragraphHtml.appendChild(document.createTextNode(chosenContent));

    document.getElementsByClassName("post-content")[0].appendChild(inputRangeHtml);
    document.getElementsByClassName("post-content")[0].appendChild(paragraphHtml);

    // Something something JavaScript scoping
    (function() {
        var input = document.querySelectorAll("input#section" + i)[0];

        input.addEventListener('input', function() {
          var newGran = parseInt(input.value) - 1;

          var whichContent = parseInt(
            input.getAttribute('id').substring("section".length)
          );

          var paragraph = document.querySelectorAll("p#section" + whichContent)[0];
          paragraph.replaceChild(document.createTextNode(content[whichContent][newGran]), paragraph.childNodes[0]);
        });
    })();
  }
  });
</script>
