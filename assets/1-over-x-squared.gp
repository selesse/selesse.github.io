set term png
unset label

set title "Rate of Change of Efficiency ( $ / hr )"
set xrange[1:10]
set yrange[0:1]
set output "plot-1-over-x-squared.png"
plot 1/(x**2)
