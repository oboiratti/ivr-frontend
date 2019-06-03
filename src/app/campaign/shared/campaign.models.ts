import { ModelQuery, Lookup } from 'src/app/shared/common-entities.model';
import { Tree } from 'src/app/content/shared/tree.model';

export interface CampaignQuery extends ModelQuery {
    title: string
    areaId: number
    startDate: Date
    endDate: Date
}

export interface Campaign {
    id: number
    title: string
    areaId: number
    area: Lookup
    startDate: Date
    endDate: Date
    schedules: CampaignSchedule[]
}

export interface CampaignSchedule {
    id?: number
    campaignId: number
    campaign?: Campaign
    topicId: number
    topic?: Lookup
    treeId: number
    tree?: Tree
    scheduleType: string
    recipientType: string
    startDate: Date
    sendTime: Date
    endDate: Date
    frequency: string
    period: number
    advancedOptions: {}
    subscriberIds: number[]
    groupIds: number[]
    createdAt: Date
    createdBy: Date
    updatedAt: Date
    updatedBy: Date
}

export interface CampaignScheduleQuery extends ModelQuery {
    campaignId: number
    topicId: number
    receipientType: string
    scheduleType: string
}

export interface Node {
    title: string
    key: string
    choices: number
}

export interface Aggregates {
    pending: number
    completed: number
    failed: number
    hangup: number
    totalCalls: number
}

export interface Interactions {
    date: Date
    subscribers: number
}

export interface ResponseDetails {
    value: string
    responses: number
    total: number
    percentage: number
}

export interface NodeStat {
    node: Node
    aggregates: Aggregates
    interactions: Interactions []
    responseDetails: ResponseDetails []
}

export interface TreeNodeResponseQuery {
    treeId: number
    campaignId: number
    key: string
    phoneNumber: string
    code: string
    name: string
    districtId: number
    gender: 'Male' | 'Female'
    groupId: number
    response: string
    callDate: Date
    page: number
    size: number
}

export interface TreeResultsQuery {
    treeId: number
    campaignId: number
    key: string
    districtId: number
    groupId: number
    dateFrom: Date
    dateTo: Date
}
