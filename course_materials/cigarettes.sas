data cigarettes;
  infile "P:\stat315\cigarettes.txt" firstobs=2;
  /* firstobs=2 tells SAS to start reading at the second line */
  input Brand :$16. tar nico weight cmono;
run;

proc print data=cigarettes;
run;

proc corr data=cigarettes plots=matrix;
run;

proc reg data=cigarettes;
  model cmono = nico weight tar/ vif;
run;

proc reg data=cigarettes;
  model cmono = nico weight tar/ selection=cp;
run;