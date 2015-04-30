/*
 * This is write-only code. I feel awful for having written it.
 * I apologize to future me and anyone else who happens to stumble upon this.
 *
 * In case anybody ever needs to understand how this works, buckle up:
 *
 * The JavaScript assumes multiple consecutively dumped documents structured
 * like so:
 *
 *     <!-- Conceptually, this is document 1 -->
 *     <h1 id="section-1">Section 1</h1>
 *
 *     <!-- ... meaningful content, composed of multiple tags ... -->
 *
 *     <h1 id="section-2">Section 2</h1>
 *
 *     <h1 id="section-n">Section n</h1>
 *
 *     <!-- Conceptually, this is document 2 -->
 *     <h1 id="section-1">Section 1</h1>
 *
 *     <!-- ... meaningful content, composed of multiple tags ... -->
 *
 *     <h1 id="section-2">Section 2</h1>
 *
 * *THEN*, the code rearranges it (via dom manipulation, obviously)
 * so all the meaningful content is rearranged to look like this:
 *
 *      <h1 id="section-1">Section 1</h1>
 *
 *      <!-- this is document 1's first section -->
 *      <!-- this is document 2's first section -->
 *      <!-- ... --->
 *      <!-- this is document n's first section -->
 *
 *      <h1 id="section-2">Section 2</h1>
 *      <!-- this is document 1's second section -->
 *      <!-- this is document 2's second section -->
 *      <!-- ... --->
 *      <!-- this is document n's second section -->
 *
 * OK, cool. Now the sections are together, so I can just hide and show the
 * appropriate sections based on the slider. Before doing that, I need to
 * actually create the sliders. They get inserted before all of the sections.
 *
 * Then, to determine which chunks to hide/show, we assume that every section
 * starts with a <h3> tag, so the entire section is segmented into chunks.
 *
 */
(function() {
    var content = {};
    var all_sections;
    var number_of_levels;
    var number_of_segments;

    document.addEventListener("DOMContentLoaded", function(event) {
        all_sections = document.querySelectorAll("[id^='section']");
        number_of_levels = document.querySelectorAll("#section-1").length;
        number_of_segments = all_sections.length / number_of_levels;

        content = {};
        for (var i = 0; i < number_of_segments; i++) {
            content[i] = [];
        }

        build_content_object(all_sections);
        manipulate_dom_so_segments_are_in_order();

        var initial_level = Math.floor(number_of_levels / 2);
        $(content[initial_level]).each(function(x, element) {
            $(element).show();
        });

        create_range_elements(initial_level);
        register_events();
        // Yeah, cause this is how you should initialize your app, right?
        $("input").trigger("change");
        $(all_sections).hide();
    });

    function build_content_object(all_sections) {
        for (var i = 0; i < number_of_segments; i++) {
            var section_heading = $(all_sections[i]);
            var section_id = section_heading.attr('id');

            var section = document.querySelectorAll("#" + section_id);
            content[i] = section;
        }
    }

    function manipulate_dom_so_segments_are_in_order() {
        for (var i = 0; i < number_of_segments; i++) {
            for (var j = 0; j + 1 < number_of_levels; j++) {
                var chunk = $(content[i][j + 1]).nextUntil("h1").detach();
                $(content[i][0]).nextUntil("h1").last().after(chunk);
            }
        }
    }

    function create_range_elements(initial_level) {
        for (var i = 0; i < number_of_segments; i++) {
            var section = document.getElementById("section-" + (i + 1));

            $(section).before('<input id="' + (i+1) + '" type="range" min="1" max="' +
                    number_of_levels + '" value="' + (initial_level + 1) +'" />');
        }
    }

    function register_events() {
        $("input").change(function() {
            var id = $(this).attr('id');
            $(this).data("old", $(this).data("new") || $(this).attr('value') || "");
            $(this).data("new", $(this).val());

            // 0-indexed
            id = id - 1;
            var oldValue = $(this).data("old") - 1;
            var newValue = $(this).data("new") - 1;

            var section = $(content[id]).nextUntil("h1");
            var indexes = $(section).filter("h3").map(function() { return $.inArray(this, section) });

            var chunk;
            for (var i = 0; i + 1 < indexes.length; i++) {
                chunk = section.slice(indexes[i], indexes[i+1]);
                chunk.toggle(i == newValue);
            }
            // So uhm, the input elements get inserted before every section,
            // except the last one because of indexing or something...
            // That probably doesn't make sense, but https://www.youtube.com/watch?v=9D-QD_HIfjA
            var push_it_to_the_limit = section.length - 1;
            if (id + 1 == number_of_segments) {
                push_it_to_the_limit += 1;
            }
            chunk = section.slice(indexes[indexes.length - 1], push_it_to_the_limit);
            chunk.toggle(indexes.length - 1 == newValue);
        });
    }
})();
