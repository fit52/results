REM Currently exiting after line 5
@echo off

node ..\src\deleteAllDocs.js
npm run --silent add-participants .\secrets\dbload-participants.csv 1

cd ..

FOR /r %%A IN (secrets\event-data\*) DO node . %%A

cd utils

npm run --silent add-participants .\secrets\dbload-participants-11-12.csv
npm start --silent .\secrets\load11-12\fit52-11-20180822-finishers.csv .\secrets\load11-12\fit52-11-20180822-timer2.txt
npm start --silent .\secrets\load11-12\fit52-12-20180905-finshers.csv .\secrets\load11-12\fit52-12-20180905-timer2.txt

npm run --silent add-participants .\secrets\fit52-13-firsttimers.csv

npm start --silent .\secrets\fit52-13-finishers.csv .\secrets\fit52-13-20180919-timer2.csv

npm run --silent get-event 11
npm run --silent get-evnet 12

echo done
