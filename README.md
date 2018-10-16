# **Fit52 Results Prossessing**
**Adding an Event**\
`npm start finisherFile stopwatchFile` or `npm start fullEventDataFile`

**Adding Participants to the db**\
`npm run add-participants runnerInfoFile`

**Getting data from the db**\
Event data: `npm run get-event eventNo`\
Participant data: `npm run get-runner-data`\
Record data: `npm run get-records`

## Secrets Folder

**Any personal/secret/event data should be stored in the secrets folder**

**Login Data** should be in stored in `secrets/login.json`, format:
```json
{
    "url": "cloundant url",
    "dbName": "db name"
}
```

### **Outputs**:
Output commands output the data to `secrets/output-data`\
**Events**: The outputs are in a folder labled `event[no]`\
**Records**: The outputs are in the folder labeled `global-records`.\
**Runners**: Ouputs into `runnerData.txt`


## Csv Formats
**Finisher File**: `[ticketno,full name,distance]`\
The last line should be the `[course number]`

**Stopwatch File**:\
Should be an output file from the stopwatches

**Full Event Data File**: `[full name,distance,time]`\
The last line should be the `[date,course number]`\
Time format should be `hh:mm:ss` and date format should be `DD/MM/YYYY`

**Runner Info File**: `[firstname,surname,dob,gender,email,exercise,IBMer]`\
Date format should be `YYYY-MM-DD`\
Ecercise should be from `0-3` and IBMer should be `0` or `1`
