/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TaskItemPriority } from './TaskItemPriority';
import type { TaskItemStatus } from './TaskItemStatus';
export type TaskItemDto = {
    id?: string;
    title?: string | null;
    description?: string | null;
    dueDate?: string;
    creationTime?: string;
    priority?: TaskItemPriority;
    progressStatus?: TaskItemStatus;
    ownerUserId?: string;
};

