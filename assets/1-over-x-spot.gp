set term png
unset label

set ylabel "Efficiency ( $ / hr )"
set xlabel "Hours / Times Used"
set title "Efficiency vs Hours / Times Used"
set xrange[1:10]
set yrange[0:1]
set label 1 "" at 4.641588833612778,0.2154434690031884 point pointtype 3
set output "plot-1-over-x-spot.png"
plot 1/x
