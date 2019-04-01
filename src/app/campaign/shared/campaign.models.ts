import { ModelQuery, Lookup } from "src/app/shared/common-entities.model";
import { Tree } from "src/app/content/shared/tree.model";

export interface CampaignQuery extends ModelQuery {
    title: string
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
}
