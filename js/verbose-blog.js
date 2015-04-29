document.addEventListener("DOMContentLoaded", function(event) {
    var all_sections = document.querySelectorAll("[id^='section']");

    for (var i = 0; i < all_sections.length; i++) {
        var section_heading = $(all_sections[i]);
        section_heading.hide();
        var section = section_heading.nextUntil("h1");
        section.each(function(x, element) {
            $(element).hide();
        });
    }
});
