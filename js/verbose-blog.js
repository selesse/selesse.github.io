(function() {
    var content = {};

    document.addEventListener("DOMContentLoaded", function(event) {
        var all_sections = document.querySelectorAll("[id^='section']");
        var number_of_levels = document.querySelectorAll("#section-1").length;
        var number_of_segments = all_sections.length / number_of_levels;

        content = {};
        for (var i = 0; i < number_of_levels; i++) {
            content[i] = [];
        }

        var current_level = 0;
        for (var i = 0; i < all_sections.length; i++) {
            // Hide the section heading
            var section_heading = $(all_sections[i]);
            section_heading.hide();

            // Grab the chunk
            var section = section_heading.nextUntil("h1");
            content[current_level].push(section);

            // Initialize all of the elements by hiding them
            section.each(function(x, element) {
                $(element).hide();
            });

            if (((i + 1) / number_of_segments) % 1 === 0) {
                current_level = current_level + 1;
            }
        }

        var initial_level = Math.floor(number_of_levels / 2);
        $(content[initial_level]).each(function(x, element) {
            $(element).show();
        });

        create_range_elements(content, initial_level, number_of_levels);
        register_events();
    });

    function create_range_elements(content, initial_level, number_of_levels) {
        for (var i = 0; i < content[initial_level].length; i++) {
            // content[initial_level] is an array of html elements, prepend this
            // to the first one
            var element = content[initial_level][i][0];

            $(element).before('<input id="' + i + '" type="range" min="1" max="' +
                    number_of_levels + '" value="' + (initial_level + 1) +'" />');
        }
    }

    function register_events() {
        $("input").change(function() {
            var id = $(this).attr('id');
            $(this).data("old", $(this).data("new") || $(this).attr('value') || "");
            $(this).data("new", $(this).val());

            // 0-indexed
            var oldValue = $(this).data("old") - 1;
            var newValue = $(this).data("new") - 1;

            content[oldValue][id].hide();
            content[newValue][id].show();
        });
    }

})();
