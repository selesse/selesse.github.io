set term png
unset label

set ylabel "Efficiency ( $ / hr )"
set xlabel "Hours / Times Used"
set title "Efficiency vs Hours / Times Used"
set xrange[1:50]
set yrange[0:200]
set output "plot-500-over-x-2.png"
plot 500/x
