import { Lookup, District } from "src/app/shared/common-entities.model";

export interface Subscriber {
    id: number
    phonenumber: string
    name: string
    language: Lookup
    startdate: Date
    gender: string
    location: string
    comments: string
    district: District
    subscribergroups: SubscriberGroup[]
} 

export interface SubscriberGroup extends Lookup {
    description: string
    subscribers: Subscriber[]
}