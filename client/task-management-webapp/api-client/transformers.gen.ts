// This file is auto-generated by @hey-api/openapi-ts

import type {
  RegisterResponse,
  GetApiAttachmentByIdResponse,
  GetApiAttachmentTaskByTaskIdResponse,
  PostApiAttachmentUploadByTaskIdResponse,
  GetApiBoardsResponse,
  PostApiBoardsResponse,
  GetApiBoardsByBoardIdResponse,
  GetApiChecklistsTaskByTaskIdResponse,
  GetApiChecklistsByChecklistIdResponse,
  PostApiChecklistsResponse,
  PostApiChecklistsItemsResponse,
  GetApiChecklistsItemsByItemIdResponse,
  GetApiCommentsTaskByTaskIdResponse,
  GetApiCommentsByCommentIdResponse,
  PostApiCommentsResponse,
  GetApiDashboardRecentActivityResponse,
  GetApiDashboardUpcomingTasksResponse,
  GetApiListsBoardByBoardIdResponse,
  GetApiListsByListIdResponse,
  PostApiListsResponse,
  GetApiMessagesResponse,
  PostApiMessagesResponse,
  GetApiMessagesConversationByUserIdResponse,
  GetApiMessagesByMessageIdResponse,
  GetApiNotificationsResponse,
  GetApiNotificationsUnreadResponse,
  GetApiSampleGetUsersResponse,
  GetApiTasksResponse,
  PostApiTasksResponse,
  GetApiTasksByTaskIdResponse,
  GetApiTasksListByListIdResponse,
  GetApiTasksQueryingByTitlePatternResponse,
  PostApiTasksQueryingResponse,
  GetApiUsersProfileResponse,
  GetApiUsersSearchResponse,
  GetApiUserProfileResponse,
  PutApiUserProfileResponse,
} from "./types.gen";

const userDtoSchemaResponseTransformer = (data: any) => {
  if (data.creationDate) {
    data.creationDate = new Date(data.creationDate);
  }
  if (data.lastLogin) {
    data.lastLogin = new Date(data.lastLogin);
  }
  return data;
};

export const registerResponseTransformer = async (
  data: any,
): Promise<RegisterResponse> => {
  data = userDtoSchemaResponseTransformer(data);
  return data;
};

const attachmentDtoSchemaResponseTransformer = (data: any) => {
  if (data.uploadTime) {
    data.uploadTime = new Date(data.uploadTime);
  }
  return data;
};

export const getApiAttachmentByIdResponseTransformer = async (
  data: any,
): Promise<GetApiAttachmentByIdResponse> => {
  data = attachmentDtoSchemaResponseTransformer(data);
  return data;
};

export const getApiAttachmentTaskByTaskIdResponseTransformer = async (
  data: any,
): Promise<GetApiAttachmentTaskByTaskIdResponse> => {
  data = data.map((item: any) => {
    return attachmentDtoSchemaResponseTransformer(item);
  });
  return data;
};

export const postApiAttachmentUploadByTaskIdResponseTransformer = async (
  data: any,
): Promise<PostApiAttachmentUploadByTaskIdResponse> => {
  data = attachmentDtoSchemaResponseTransformer(data);
  return data;
};

const commentDtoSchemaResponseTransformer = (data: any) => {
  if (data.creationDate) {
    data.creationDate = new Date(data.creationDate);
  }
  return data;
};

const checklistItemDtoSchemaResponseTransformer = (data: any) => {
  if (data.creationDate) {
    data.creationDate = new Date(data.creationDate);
  }
  if (data.completionDate) {
    data.completionDate = new Date(data.completionDate);
  }
  return data;
};

const checklistDtoSchemaResponseTransformer = (data: any) => {
  if (data.creationDate) {
    data.creationDate = new Date(data.creationDate);
  }
  if (data.items) {
    data.items = data.items.map((item: any) => {
      return checklistItemDtoSchemaResponseTransformer(item);
    });
  }
  return data;
};

const taskItemDtoSchemaResponseTransformer = (data: any) => {
  if (data.dueDate) {
    data.dueDate = new Date(data.dueDate);
  }
  if (data.creationTime) {
    data.creationTime = new Date(data.creationTime);
  }
  if (data.lastModifiedTime) {
    data.lastModifiedTime = new Date(data.lastModifiedTime);
  }
  if (data.createdAt) {
    data.createdAt = new Date(data.createdAt);
  }
  if (data.updatedAt) {
    data.updatedAt = new Date(data.updatedAt);
  }
  if (data.assignees) {
    data.assignees = data.assignees.map((item: any) => {
      return userDtoSchemaResponseTransformer(item);
    });
  }
  if (data.comments) {
    data.comments = data.comments.map((item: any) => {
      return commentDtoSchemaResponseTransformer(item);
    });
  }
  if (data.attachments) {
    data.attachments = data.attachments.map((item: any) => {
      return attachmentDtoSchemaResponseTransformer(item);
    });
  }
  if (data.checklists) {
    data.checklists = data.checklists.map((item: any) => {
      return checklistDtoSchemaResponseTransformer(item);
    });
  }
  return data;
};

const listDtoSchemaResponseTransformer = (data: any) => {
  if (data.taskItems) {
    data.taskItems = data.taskItems.map((item: any) => {
      return taskItemDtoSchemaResponseTransformer(item);
    });
  }
  return data;
};

const boardMemberDtoSchemaResponseTransformer = (data: any) => {
  if (data.joinedDate) {
    data.joinedDate = new Date(data.joinedDate);
  }
  return data;
};

const boardDtoSchemaResponseTransformer = (data: any) => {
  if (data.creationDate) {
    data.creationDate = new Date(data.creationDate);
  }
  if (data.lists) {
    data.lists = data.lists.map((item: any) => {
      return listDtoSchemaResponseTransformer(item);
    });
  }
  if (data.members) {
    data.members = data.members.map((item: any) => {
      return boardMemberDtoSchemaResponseTransformer(item);
    });
  }
  return data;
};

export const getApiBoardsResponseTransformer = async (
  data: any,
): Promise<GetApiBoardsResponse> => {
  data = data.map((item: any) => {
    return boardDtoSchemaResponseTransformer(item);
  });
  return data;
};

export const postApiBoardsResponseTransformer = async (
  data: any,
): Promise<PostApiBoardsResponse> => {
  data = boardDtoSchemaResponseTransformer(data);
  return data;
};

export const getApiBoardsByBoardIdResponseTransformer = async (
  data: any,
): Promise<GetApiBoardsByBoardIdResponse> => {
  data = boardDtoSchemaResponseTransformer(data);
  return data;
};

export const getApiChecklistsTaskByTaskIdResponseTransformer = async (
  data: any,
): Promise<GetApiChecklistsTaskByTaskIdResponse> => {
  data = data.map((item: any) => {
    return checklistDtoSchemaResponseTransformer(item);
  });
  return data;
};

export const getApiChecklistsByChecklistIdResponseTransformer = async (
  data: any,
): Promise<GetApiChecklistsByChecklistIdResponse> => {
  data = checklistDtoSchemaResponseTransformer(data);
  return data;
};

export const postApiChecklistsResponseTransformer = async (
  data: any,
): Promise<PostApiChecklistsResponse> => {
  data = checklistDtoSchemaResponseTransformer(data);
  return data;
};

export const postApiChecklistsItemsResponseTransformer = async (
  data: any,
): Promise<PostApiChecklistsItemsResponse> => {
  data = checklistItemDtoSchemaResponseTransformer(data);
  return data;
};

export const getApiChecklistsItemsByItemIdResponseTransformer = async (
  data: any,
): Promise<GetApiChecklistsItemsByItemIdResponse> => {
  data = checklistItemDtoSchemaResponseTransformer(data);
  return data;
};

export const getApiCommentsTaskByTaskIdResponseTransformer = async (
  data: any,
): Promise<GetApiCommentsTaskByTaskIdResponse> => {
  data = data.map((item: any) => {
    return commentDtoSchemaResponseTransformer(item);
  });
  return data;
};

export const getApiCommentsByCommentIdResponseTransformer = async (
  data: any,
): Promise<GetApiCommentsByCommentIdResponse> => {
  data = commentDtoSchemaResponseTransformer(data);
  return data;
};

export const postApiCommentsResponseTransformer = async (
  data: any,
): Promise<PostApiCommentsResponse> => {
  data = commentDtoSchemaResponseTransformer(data);
  return data;
};

const recentActivityDtoSchemaResponseTransformer = (data: any) => {
  if (data.date) {
    data.date = new Date(data.date);
  }
  return data;
};

export const getApiDashboardRecentActivityResponseTransformer = async (
  data: any,
): Promise<GetApiDashboardRecentActivityResponse> => {
  data = data.map((item: any) => {
    return recentActivityDtoSchemaResponseTransformer(item);
  });
  return data;
};

const upcomingTaskDtoSchemaResponseTransformer = (data: any) => {
  if (data.dueDate) {
    data.dueDate = new Date(data.dueDate);
  }
  return data;
};

export const getApiDashboardUpcomingTasksResponseTransformer = async (
  data: any,
): Promise<GetApiDashboardUpcomingTasksResponse> => {
  data = data.map((item: any) => {
    return upcomingTaskDtoSchemaResponseTransformer(item);
  });
  return data;
};

export const getApiListsBoardByBoardIdResponseTransformer = async (
  data: any,
): Promise<GetApiListsBoardByBoardIdResponse> => {
  data = data.map((item: any) => {
    return listDtoSchemaResponseTransformer(item);
  });
  return data;
};

export const getApiListsByListIdResponseTransformer = async (
  data: any,
): Promise<GetApiListsByListIdResponse> => {
  data = listDtoSchemaResponseTransformer(data);
  return data;
};

export const postApiListsResponseTransformer = async (
  data: any,
): Promise<PostApiListsResponse> => {
  data = listDtoSchemaResponseTransformer(data);
  return data;
};

const messageDtoSchemaResponseTransformer = (data: any) => {
  if (data.creationDate) {
    data.creationDate = new Date(data.creationDate);
  }
  if (data.readDate) {
    data.readDate = new Date(data.readDate);
  }
  return data;
};

export const getApiMessagesResponseTransformer = async (
  data: any,
): Promise<GetApiMessagesResponse> => {
  data = data.map((item: any) => {
    return messageDtoSchemaResponseTransformer(item);
  });
  return data;
};

export const postApiMessagesResponseTransformer = async (
  data: any,
): Promise<PostApiMessagesResponse> => {
  data = messageDtoSchemaResponseTransformer(data);
  return data;
};

export const getApiMessagesConversationByUserIdResponseTransformer = async (
  data: any,
): Promise<GetApiMessagesConversationByUserIdResponse> => {
  data = data.map((item: any) => {
    return messageDtoSchemaResponseTransformer(item);
  });
  return data;
};

export const getApiMessagesByMessageIdResponseTransformer = async (
  data: any,
): Promise<GetApiMessagesByMessageIdResponse> => {
  data = messageDtoSchemaResponseTransformer(data);
  return data;
};

const notificationDtoSchemaResponseTransformer = (data: any) => {
  if (data.creationDate) {
    data.creationDate = new Date(data.creationDate);
  }
  return data;
};

export const getApiNotificationsResponseTransformer = async (
  data: any,
): Promise<GetApiNotificationsResponse> => {
  data = data.map((item: any) => {
    return notificationDtoSchemaResponseTransformer(item);
  });
  return data;
};

export const getApiNotificationsUnreadResponseTransformer = async (
  data: any,
): Promise<GetApiNotificationsUnreadResponse> => {
  data = data.map((item: any) => {
    return notificationDtoSchemaResponseTransformer(item);
  });
  return data;
};

export const getApiSampleGetUsersResponseTransformer = async (
  data: any,
): Promise<GetApiSampleGetUsersResponse> => {
  data = data.map((item: any) => {
    return userDtoSchemaResponseTransformer(item);
  });
  return data;
};

export const getApiTasksResponseTransformer = async (
  data: any,
): Promise<GetApiTasksResponse> => {
  data = data.map((item: any) => {
    return taskItemDtoSchemaResponseTransformer(item);
  });
  return data;
};

export const postApiTasksResponseTransformer = async (
  data: any,
): Promise<PostApiTasksResponse> => {
  data = taskItemDtoSchemaResponseTransformer(data);
  return data;
};

export const getApiTasksByTaskIdResponseTransformer = async (
  data: any,
): Promise<GetApiTasksByTaskIdResponse> => {
  data = taskItemDtoSchemaResponseTransformer(data);
  return data;
};

export const getApiTasksListByListIdResponseTransformer = async (
  data: any,
): Promise<GetApiTasksListByListIdResponse> => {
  data = data.map((item: any) => {
    return taskItemDtoSchemaResponseTransformer(item);
  });
  return data;
};

export const getApiTasksQueryingByTitlePatternResponseTransformer = async (
  data: any,
): Promise<GetApiTasksQueryingByTitlePatternResponse> => {
  data = data.map((item: any) => {
    return taskItemDtoSchemaResponseTransformer(item);
  });
  return data;
};

export const postApiTasksQueryingResponseTransformer = async (
  data: any,
): Promise<PostApiTasksQueryingResponse> => {
  data = data.map((item: any) => {
    return taskItemDtoSchemaResponseTransformer(item);
  });
  return data;
};

export const getApiUsersProfileResponseTransformer = async (
  data: any,
): Promise<GetApiUsersProfileResponse> => {
  data = userDtoSchemaResponseTransformer(data);
  return data;
};

export const getApiUsersSearchResponseTransformer = async (
  data: any,
): Promise<GetApiUsersSearchResponse> => {
  data = data.map((item: any) => {
    return userDtoSchemaResponseTransformer(item);
  });
  return data;
};

export const getApiUserProfileResponseTransformer = async (
  data: any,
): Promise<GetApiUserProfileResponse> => {
  data = userDtoSchemaResponseTransformer(data);
  return data;
};

export const putApiUserProfileResponseTransformer = async (
  data: any,
): Promise<PutApiUserProfileResponse> => {
  data = userDtoSchemaResponseTransformer(data);
  return data;
};
