---
layout: post
title:  "Efficiency"
date: 2015-05-02 13:57:00
categories: math efficiency
redirect_from: '/blog/12/'
---

<!-- Mathjax -->
<script type="text/javascript" src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML">
</script>

One of the things I've been interested in for a long time is the notion of
efficiency. If I purchase a video game for $60 but only play 1 hour, how
"efficient" was my purchase? We can define the efficiency of the purchase as
being `price / hours = $60 / hr`. If I play for 10 hours, my efficiency
becomes `60 / 10 = $6 / hr`, which is a much more reasonable amount to pay.

It's pretty interesting to start thinking of everything from the perspective
of efficiency.  If I go to a bar and spend $30, and I go for 3 hours, my
efficiency is $10/hour. Similarly, if I buy a treadmill for $1500 and only use
it 20 times, it's as if I've paid 1500 / 20 = $75 per use. Are these numbers
good or bad? At what point has my video game, bar visit, and treadmill
purchase become "worth it"? This post explores the question and suggests a
mathematical answer. Note that this is just a fun way to think about things,
it's not something I use to make daily decisions.

The equation for efficiency can be represented as \\( y = \frac c x \\), where
`y` represents the efficiency, `c` is the money spent, and `x` is the amount
of hours or times used. We can also cheat a bit and ignore amounts of hours
that are < 1. Mathematically, this looks like the following graph:

![Plot of 1/x]({{ site.baseurl }}/assets/plot-1-over-x.png)

As `x` approaches infinity, `y` approaches 0 (the ideal efficiency). There is
one point where the efficiency stops changing radically (note the axes have
changed):

![Plot of 1/x with point (4.64, 0.22) emphasized]({{ site.baseurl }}/assets/plot-1-over-x-spot.png)

At around the point `(4.5, 0.2)`, the rate of change decreases. We can wave
our hands and say that this is the **optimal efficiency**: at this point,
spending more hours does not significantly impact the efficiency. This can be
considered a "break even" point for some things, i.e. "if I go to the gym this
many times, my membership will have been worth it".

One of the problems with this definition is that the optimal efficiency
depends on the initial price, and there's no clear definition on WHEN it is.
This becomes pretty clear if we plot \\( y = \frac {500} x \\):

![Plot of 500/x]({{ site.baseurl }}/assets/plot-500-over-x.png)

By looking at the graph, we can say that at `x ~= 50`, the optimal efficiency
is obtained. One of the problems with this "plot-then-look" approach is that
the range of the axes chosen highly impacts what the optimal efficiency is.
Here's the same graph with different axes, where the optimal efficiency might
more reasonably be 'guessed' to be in between 15 and 20:

![Plot of 500/x, different axes]({{ site.baseurl }}/assets/plot-500-over-x-2.png)

Using calculus, we can mathematically calculate the optimal efficiency. We'll
first start by calculating the rate of change of the efficiency formula and
plotting it:

$$
y = \frac c x, \\
\frac {dy} {dx} = - \frac {c} {x^2}
$$

![Plot of -1/x^2]({{ site.baseurl }}/assets/plot-1-over-x-squared.png)

Somewhat arbitrarily, we'll calculate where the rate of change has a slope of
`y = -100x`, i.e. where the rate of change is changing very slowly.

$$
y = -100x, \\
y = - \frac {c} {x^2}
$$


$$
x = \sqrt[3]{100 c}
$$

So if we look back at our two main graphs, `y=1/x` and `y=500/x`, we can
calculate the optimal points with a formula:

$$
\sqrt[3]{100 * 1} = 4.64
$$

$$
\sqrt[3]{100 * 500} = 36.84
$$

To calculate the optimal efficiency directly (with a little help from the
Internet):

$$
x = \sqrt[3]{100 c}, \\
y = \frac c x
$$

$$
y = {10}^{\frac 2 3} \sqrt[3]{c}
$$

Now we can mathematically determine when doing something is worth it! ;)

<table>
<tr><td>
Input price:

<input id="price" type="number" value="500" />

</td><td>
Optimal Efficiency:

<span id="efficiency-result"></span>
</td></tr>
</table>

<script>
    var input = document.getElementById('price');
    input.addEventListener("change", function () {
        document.getElementById('efficiency-result').textContent =
            Math.round(Math.pow(10, 2/3.0) * Math.pow(input.value, 1/3.0), 1);
    });
    // Initialize the efficiency-result by faking a change event
    input.dispatchEvent(new Event('change'));
</script>

---

Another interesting thing to graph is the optimal efficiency per price:

![Plot of 10^(2/3) * cube root of x]({{ site.baseurl }}/assets/optimal-efficiency-plot.png)
