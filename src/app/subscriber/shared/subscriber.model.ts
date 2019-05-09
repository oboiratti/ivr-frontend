import { Lookup, District, ModelQuery, Region } from 'src/app/shared/common-entities.model';

export interface Subscriber {
    id: number
    phoneNumber: string
    name: string
    language: Lookup
    startDate: Date
    dateOfBirth: Date
    gender: string
    location: string
    comments: string
    region: Region
    district: District
    educationalLevel: any
    subscriberType: any
    primaryComodity: any
    otherCommodities: any[]
    subscriberCommodities: any[],
    subscriberGroups: SubscriberGroup[]
    program: Lookup
}

export interface SubscriberGroup extends Lookup {
    groupId: number
    description: string
    subscribers: Subscriber[]
}

export interface SubscriberQuery extends ModelQuery {
    name: string
    phone: string
    location: string
    subscriberTypeId: number
}

export interface SubscriberGroupQuery extends ModelQuery {
    name: string
}

export interface SubscriberUploadModel {
    CODE: string
    NAME: string
    PHONE_NUMBER: string
}
