data tortoise;
  infile "P:\stat315\galapagos.txt" firstobs=2;
  /* firstobs=2 tells SAS to start reading at the second line */
  input Island :$12. Species Endemics Area Elevation Nearest Scruz Adjacent;
run;

/* Linear regression model of species on the other variables */
proc reg data=tortoise;
  model Species = Endemics Area Elevation Nearest Scruz Adjacent / influence;
run;

/* Select 2/3 of the data for fitting the model. Reserve 10 cases for validation */
proc surveyselect data=tortoise out=Validate seed=100 /* <-- Seed for the random number generator */
samprate=0.66 outall reps=1;
run;

data Validate;
  set Validate;
  if selected then new_Species=Species;
run;

/* Calculate the regression on the data and make predictions for the held-out data */
proc reg data=Validate noprint;
  model new_Species = Endemics Area Elevation Nearest Scruz Adjacent;
  by replicate;
  output out=out1(where=(new_Species=.)) predicted=Species_hat;
run;

data out2;
set out1;
  d=Species-Species_hat;
  dsq = d**2;
  label dsq="Squared residual";
run;

/* Print the squared residuals for the 10 held-out observations */
proc print data=out2(keep = Island dsq) label;
run;

proc univariate data=out2 noprint;
  var dsq;
  output out=SSE sum=Total nobs=N;
run;

/* Calculate the mean squared residual */
data Final;
  set SSE;
  MSE = Total/N;
  label MSE="Mean squared residual";
run;

/* Print the mean squared residual */
proc print data=Final(keep=MSE) label;
run;
