set term png
unset label

set ylabel "Efficiency ( $ / hr )"
set xlabel "Hours / Times Used"
set title "Efficiency vs Hours / Times Used"
set xrange[1:100]
set yrange[0:100]
set output "plot-500-over-x.png"
plot 500/x
