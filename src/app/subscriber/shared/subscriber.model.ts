import { Lookup, District, ModelQuery } from "src/app/shared/common-entities.model";

export interface Subscriber {
    id: number
    phoneNumber: string
    name: string
    language: Lookup
    startDate: Date
    gender: string
    location: string
    comments: string
    district: District
    subscriberGroups: SubscriberGroup[]
} 

export interface SubscriberGroup extends Lookup {
    groupId: number
    description: string
    subscribers: Subscriber[]
}

export interface SubscriberQuery extends ModelQuery {

}