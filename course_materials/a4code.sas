/* Q1 
*******************************/

/* Construct a data set with 100 training examples and 200 test examples */
data train_and_test(keep = x y);
	call streaminit(1000); /* set the random seed. Change this to call streamint(something) in Q1(d) */
	do i = 1 to 50;
		x = rand("Exponential");
		y = 0;
		output;
	end;
    do i = 1 to 50;
		u = rand("Uniform");
		x = 2 - 2*sqrt(1-u);
		y = 1;
		output;
	end;
		do i = 1 to 100;
		x = rand("Exponential");
		y = .;
		output;
	end;
    do i = 1 to 100;
		u = rand("Uniform");
		x = 2 - 2*sqrt(1-u);
		y = .;
		output;
	end;
run;
/*
proc print;
run;
*/
/* Fit naive regression model */
proc reg data = train_and_test;
model y = x;
output out = Harvard predicted = pred;
run;

/* Create a dummy variable with the true outcomes in the test set 
Can use _n_ instead */
data dummy;
do i = 1 to 100;
  true_y = 0;
  output;
end;
do i = 1 to 100;
  true_y = 1;
  output;
end;
run;

/* Get predictions from regression model */
data Harvard2;
set Harvard(firstobs = 101);
if pred < 0.5 then pred_y = 0;
if pred >= 0.5 then pred_y = 1;
run;

/* Calculate how many it classified incorrectly */
data performance(keep = pred_y true_y err);
merge Harvard2 dummy;
err = abs(true_y - pred_y);
run;

/* Calculate the error rate and print it out */
proc univariate data = performance noprint;
  var err;
  output out=Err sum=Total_errors nobs=N;
run;

data Final;
	set Err;
	Error = Total_errors/N;
run;

proc print;
run;

/* Fit logistic regression model to the same data */
proc logistic data = train_and_test descending;
model y = x;
output out = Logistic predicted = pred;
run;

/* Calculate and print the error rate for the logistic regression model */
data Logistic2;
set Logistic(firstobs = 101);
if pred < 0.5 then pred_y = 0;
if pred >= 0.5 then pred_y = 1;
run;

data performance2(keep = pred_y true_y err);
merge Logistic2 dummy;
err = abs(true_y - pred_y);
run;

proc univariate data = performance2 noprint;
  var err;
  output out=Err sum=Total_errors nobs=N;
run;

data Final;
	set Err;
	Error = Total_errors/N;
run;

proc print;
run;

/* Q2
***********************************/

data Pima;
infile "P:\Stat315\Pima.txt";
input npreg glu bp skin bmi ped age type;
run;

data Pima_test;
infile "P:\Stat315\Pima_test.txt";
input npreg glu bp skin bmi ped age type;
run;

proc discrim data=Pima outstat=Pimastat
method=normal pool=yes crossvalidate
testdata = Pima_test testout = test_result;
priors proportional;
class type;
var npreg glu bp skin bmi ped age;
run;



/************************************ END OF A4 CODE *********************************/
/* Plots - not part of the assignment 

data Pima_x (drop = type);
set Pima_test;
run;


proc princomp data = Pima_x out=PC;
run;

data plotclass;
merge test_result discrim_out PC;
run;

proc template;
  define statgraph classify;
    begingraph;
      layout overlay;
         contourplotparm x= Prin1 y= Prin2 z= type / contourtype=fill  
						 nhint = 30 gridded = false;
        scatterplot x= Prin1 y= Prin2 / group=type includemissinggroup=false
	                 	    markercharacter = type;
      endlayout;
    endgraph;
  end;
run;

proc sgrender data = plotclass template = classify;
run;

proc template;
  define statgraph classify;
    begingraph;
      layout overlay;
         contourplotparm x= Prin1 y= Prin2 z= _INTO_ / contourtype=fill  
						 nhint = 30 gridded = false;
        scatterplot x= Prin1 y= Prin2 / group=type includemissinggroup=false
	                 	    markercharacter = type;
      endlayout;
    endgraph;
  end;
run;


proc sgrender data = plotclass template = classify;
run;

*/
