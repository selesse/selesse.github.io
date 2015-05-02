set term png
unset label

set ylabel "Efficiency ( $ / hr )"
set xlabel "Hours / Times Used"
set title "Efficiency vs Hours / Times Used"
set xrange[1:50]
set yrange[0:0.5]
set output "plot-1-over-x.png"
plot 1/x
