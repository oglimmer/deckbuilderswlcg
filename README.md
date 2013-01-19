deckbuilderswlcg
================

a deck bulider alternative for star wars lcv on octgn.net

install
=======

1.) get java and groovy and add it to your path<br/>
2.) add swlcg-deckbuilder to your path as well (e.g. /usr/local/bin)<br/>
3.) find your set file which contains all the cards (e.g. SW-LCG-Core-Censored.o8s.7z) and open a command prompt there<br/>
4.) to generate the HTML file exeucte the following command `$swlcg-deckbuilder SW-LCG-Core-Censored.o8s.7z gen Dark' (or Light)<br/>
5.) open the generated file out.html and do your deck building in the browser<br/>
6.) copy the content of the top box (e.g. swlcg-deckbuilder SW-LCG-Core-Censored.o8s.7z deck "Smugglers and Spies" 2 3 6 7 8 8 10 10 12 12) and execute it on the command line<br/>
7.) a deck file called out.o8d is created<br/>

comment
=======

the program doesn't do any validation
