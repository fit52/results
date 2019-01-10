import { Duration } from 'moment'

interface dbEntry {
    _id: string
    _rev?: string
}

interface recordedEvent {
    event: {
        number: number
        date: Date
        course: number
    }
    
    uuid: string
    name: string
    
    pos: number
    distance: 2 | 5

    time: Duration // seconds
    ageGrade: number // percentage

    firstEvent: boolean
    pb: boolean
    noEvents: number
    notes: string[]
}

// event history could be create by reading all of the events and compliling them into a table
export interface event extends dbEntry {
    // _id should be 'event/{event #}'
    
    number: number
    date: Date
    course: number
    
    volunteers: runner[]

    counts: {
        // Had to use 'two' as opposed to '2' as objects cannot have props that
        // begin with a number
        twok: number
        fivek: number
        total: number

        firstTimers: number
        pbs: number

        volunteers: number
    }

    results: recordedEvent[]
}

export interface runner extends dbEntry {
    // _id should be 'runner/{uuid}'

    uuid: string
    
    firstname: string
    lastname: string
    fullname: string
    dob: string
    gender: 'm' | 'f'
    email: string
    exercise: 0 | 1 | 2 | 3
    IBM: 0 | 1
    optin?: 'y' | 'n'
    
    stats: {
        records2k?: {
            fastest: recordedEvent
            slowest: recordedEvent
        }

        records5k?: {
            fastest: recordedEvent
            slowest: recordedEvent
        }

        recordsAgeGrade: {
            best: recordedEvent
            worst: recordedEvent
        }

        noPbs: number
        no2k: number
        no5k: number

        noTotalEvents: number
        achievements?: string[]
        volunteering: string[]
    }

    eventList: recordedEvent[]
}

// The best for each category
export interface records extends dbEntry {
    // _id should be 'global_records'
    // should be 5 / 10 records for each category

    fastest2k: {
        female: recordedEvent[]
        male: recordedEvent[]
    }

    fastest5k: {
        female: recordedEvent[]
        male: recordedEvent[]
    }

    ageGrade: recordedEvent[]
}
