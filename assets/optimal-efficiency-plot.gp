set term png
unset label

set ylabel "Hours / Times Used"
set xlabel "Price"
set xrange[0:500]
set title "Optimal efficiency"
set output "optimal-efficiency-plot.png"
plot 10**(2/3.0)*(x ** (1/3.0))
