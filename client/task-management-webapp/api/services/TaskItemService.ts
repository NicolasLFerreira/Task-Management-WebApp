/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TaskItemDto } from '../models/TaskItemDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TaskItemService {
    /**
     * @param id
     * @returns TaskItemDto OK
     * @throws ApiError
     */
    public static getTaskItem(
        id?: string,
    ): CancelablePromise<TaskItemDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/TaskItem',
            query: {
                'id': id,
            },
        });
    }
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postTaskItem(
        requestBody?: TaskItemDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/TaskItem',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
