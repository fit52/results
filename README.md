# **Fit52 Results Processing**
**Adding Participants to the db**\
`npm run add-participants runnerInfoFile`

**Adding an Event**\
`npm start [--noPb] -- finisherFile stopwatchFile` or `npm start [--noPb] -- fullEventDataFile`\
The optional `--noPb` flag is to indicate that the times for this event should not count towards PBs or global records.

**Getting data from the db**\
* Event data: `npm run get-event eventNo`\
* Participant data: `npm run get-runner-data`\
* Record data: `npm run get-records`\
* Emails of participants for an event: `npm run get-participant-emails eventNo`
* Send personalised emails to participants in an event: `npm run send-emails eventNo`

**Modifying the db**\
`npm run rebuild eventNo`\
This will rebuild the db **up to and including** the event number provided.\
If the number given is greater that the last event in the db, the whole db will be rebuilt.

## Secrets Folder

**Any personal/secret/event data should be stored in the secrets folder**

**Login Data** should be in stored in `secrets/login.json`, format:
```json
{
    "url": "cloudant url",
    "dbName": "db name"
}
```

### **Outputs**:
**Outputs are designed to be used temporarily to update the current website**\
Output commands output the data to `secrets/output-data`\
**Events**: The outputs are in a folder labeled `event[no]`\
**Records**: The outputs are in the folder labeled `global-records`.\
**Runners**: Outputs into `runnerData.csv`\
**Emails**: Outputs to `event[no]/emails.csv`


## CSV Formats
**Finisher File**: `ticketno,full-name,distance`\
The last line should be the `course-number`

**Stopwatch File**:\
Should be an output file from the stopwatches

**Full Event Data File**: `full-name,distance,time`\
The last line should be the `date,course-number`\
Time format should be `hh:mm:ss` and date format should be `DD/MM/YYYY`

**Runner Info File**: `firstname,surname,dob,gender,email,exercise,IBMer`\
Date format should be `YYYY-MM-DD`\
Exercise should be from `0-3` and IBMer should be `0` or `1`
