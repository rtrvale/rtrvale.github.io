/* Q1 */
data Xenon;
infile "P:\Stat315\Xenon.txt";
input P V T;
run;

proc reg data=Xenon;
model T = P V;
run;

proc gam data=Xenon plots(unpack)=components(commonaxes clm);
model T = spline(P) spline(V);
run;

/*
data Xenon2;
	set Xenon;
	...
You finish it from here */

/* Q2 */
data Nordic;
infile "P:\Stat315\Nordic.txt" firstobs=2;
input Nat :$3. Name & $20. SkiJump CrossCountry;
run;

proc print; 
run;

data scores;
set Nordic(keep=CrossCountry SkiJump);
run;

proc princomp data=scores out=PC plots=all;
run;

proc print data=PC;
run;