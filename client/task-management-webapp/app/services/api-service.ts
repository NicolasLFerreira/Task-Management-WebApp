import { client } from "../../api-client/client.gen"
import {
  AccountService,
  AttachmentService,
  BoardService,
  ChecklistService,
  CommentService,
  DashboardService,
  HealthService,
  LabelService,
  ListService,
  MessageService,
  NotificationService,
  TaskItemService,
  TaskItemEditingService,
  TaskItemSpecialisedService,
  UserService,
  UserProfileService,
} from "../../api-client/sdk.gen"

import type {
  RegisterDto,
  UserDtoReadable,
  // Board types
  BoardDto,
  // Task types
  TaskItemDto,
  TaskItemStatus,
  TaskItemPriority,
  EditStatusOrPriorityInput,
  FilterTaskItemInputDto,
  // List types
  ListDto,
  // Comment types
  CommentDto,
  // Checklist types
  ChecklistDtoReadable,
  ChecklistDtoWritable,
  ChecklistItemDto,
  // Label types
  LabelDto,
  // Attachment types
  AttachmentDto,
  // Message types
  MessageDto,
  // Notification types
  NotificationDto,
  // Dashboard types
  DashboardStatsDto,
  RecentActivityDto,
  UpcomingTaskDto,
  // User types
  UpdateProfileDto,
} from "../../api-client/types.gen"

/**
 * ApiService provides a unified interface for all API operations
 * This service abstracts the complexity of the individual API calls
 * and provides a clean interface for components to interact with
 */
export class ApiService {
  // AUTH OPERATIONS

  /**
   * Login a user
   * @param email User email
   * @param password User password
   * @param rememberMe Whether to remember the user
   * @returns JWT token as string
   */
  static async login(email: string, password: string, rememberMe = false): Promise<string> {
    const response = await AccountService.login({
      body: {
        email,
        password,
        rememberMe,
      },
    })

    return response.data!
  }

  /**
   * Register a new user
   * @param userData User registration data
   * @returns The created user
   */
  static async register(userData: RegisterDto): Promise<UserDtoReadable> {
    const response = await AccountService.register({
      body: userData,
    })

    return response.data!
  }

  // BOARD OPERATIONS

  /**
   * Get all boards
   * @returns List of boards
   */
  static async getBoards(): Promise<BoardDto[]> {
    const response = await BoardService.getApiBoards()
    return response.data ?? []
  }

  /**
   * Get a board by ID
   * @param boardId Board ID
   * @returns Board details
   */
  static async getBoardById(boardId: number): Promise<BoardDto> {
    const response = await BoardService.getApiBoardsByBoardId({
      path: { boardId },
    })
    return response.data!
  }

  /**
   * Create a new board
   * @param boardData Board data
   * @returns Created board
   */
  static async createBoard(boardData: BoardDto): Promise<BoardDto> {
    const response = await BoardService.postApiBoards({
      body: boardData,
    })
    return response.data!
  }

  /**
   * Update a board
   * @param boardId Board ID
   * @param boardData Updated board data
   */
  static async updateBoard(boardId: number, boardData: BoardDto): Promise<void> {
    await BoardService.putApiBoardsByBoardId({
      path: { boardId },
      body: boardData,
    })
  }

  /**
   * Delete a board
   * @param boardId Board ID
   */
  static async deleteBoard(boardId: number): Promise<void> {
    await BoardService.deleteApiBoardsByBoardId({
      path: { boardId },
    })
  }

  // LIST OPERATIONS

  /**
   * Get lists for a board
   * @param boardId Board ID
   * @returns Lists in the board
   */
  static async getListsByBoardId(boardId: number): Promise<ListDto[]> {
    const response = await ListService.getApiListsBoardByBoardId({
      path: { boardId },
    })
    return response.data ?? []
  }

  /**
   * Get a list by ID
   * @param listId List ID
   * @returns List details
   */
  static async getListById(listId: number): Promise<ListDto> {
    const response = await ListService.getApiListsByListId({
      path: { listId },
    })
    return response.data!
  }

  /**
   * Create a new list
   * @param listData List data
   * @returns Created list
   */
  static async createList(listData: ListDto): Promise<ListDto> {
    const response = await ListService.postApiLists({
      body: listData,
    })
    return response.data!
  }

  /**
   * Update a list
   * @param listId List ID
   * @param listData Updated list data
   */
  static async updateList(listId: number, listData: ListDto): Promise<void> {
    await ListService.putApiListsByListId({
      path: { listId },
      body: listData,
    })
  }

  /**
   * Delete a list
   * @param listId List ID
   */
  static async deleteList(listId: number): Promise<void> {
    await ListService.deleteApiListsByListId({
      path: { listId },
    })
  }

  /**
   * Reorder lists in a board
   * @param boardId Board ID
   * @param listIds Ordered list IDs
   */
  static async reorderLists(boardId: number, listIds: number[]): Promise<void> {
    await ListService.postApiListsReorder({
      body: {
        boardId,
        listIds,
      },
    })
  }

  // TASK OPERATIONS

  /**
   * Get all tasks
   * @returns List of tasks
   */
  static async getTasks(): Promise<TaskItemDto[]> {
    const response = await TaskItemService.getApiTasks()
    return response.data ?? []
  }

  /**
   * Get tasks in a list
   * @param listId List ID
   * @returns Tasks in the list
   */
  static async getTasksByListId(listId: number): Promise<TaskItemDto[]> {
    const response = await TaskItemService.getApiTasksListByListId({
      path: { listId },
    })
    return response.data ?? []
  }

  /**
   * Get a task by ID
   * @param taskId Task ID
   * @returns Task details
   */
  static async getTaskById(taskId: number): Promise<TaskItemDto> {
    const response = await TaskItemService.getApiTasksByTaskId({
      path: { taskId },
    })
    return response.data!
  }

  /**
   * Create a new task
   * @param taskData Task data
   * @returns Created task
   */
  static async createTask(taskData: TaskItemDto): Promise<TaskItemDto> {
    const response = await TaskItemService.postApiTasks({
      body: taskData,
    })
    return response.data!
  }

  /**
   * Update a task
   * @param taskId Task ID
   * @param taskData Updated task data
   */
  static async updateTask(taskId: number, taskData: TaskItemDto): Promise<void> {
    await TaskItemService.putApiTasksByTaskId({
      path: { taskId },
      body: taskData,
    })
  }

  /**
   * Delete a task
   * @param taskId Task ID
   */
  static async deleteTask(taskId: number): Promise<void> {
    await TaskItemService.deleteApiTasksByTaskId({
      path: { taskId },
    })
  }

  /**
   * Move a task to a different list
   * @param taskId Task ID
   * @param targetListId Target list ID
   * @param position Position in the target list
   */
  static async moveTask(taskId: number, targetListId: number, position: number): Promise<void> {
    await TaskItemService.postApiTasksMove({
      body: {
        taskId,
        targetListId,
        position,
      },
    })
  }

  /**
   * Reorder tasks in a list
   * @param listId List ID
   * @param taskIds Ordered task IDs
   */
  static async reorderTasks(listId: number, taskIds: number[]): Promise<void> {
    await TaskItemService.postApiTasksReorder({
      body: {
        listId,
        taskIds,
      },
    })
  }

  /**
   * Update task status or priority
   * @param taskItemId Task ID
   * @param status Optional new status
   * @param priority Optional new priority
   */
  static async updateTaskStatusOrPriority(
    taskItemId: number,
    status?: TaskItemStatus,
    priority?: TaskItemPriority,
  ): Promise<void> {
    const data: EditStatusOrPriorityInput = {}
    if (status !== undefined) data.progressStatus = status
    if (priority !== undefined) data.priority = priority

    await TaskItemEditingService.putApiTasksEditingByTaskItemId({
      path: { taskItemId },
      body: data,
    })
  }

  /**
   * Search tasks by title pattern
   * @param titlePattern Title search pattern
   * @returns Matching tasks
   */
  static async searchTasksByTitle(titlePattern: string): Promise<TaskItemDto[]> {
    const response = await TaskItemSpecialisedService.getApiTasksQueryingByTitlePattern({
      path: { titlePattern },
    })
    return response.data ?? []
  }

  /**
   * Filter tasks by various criteria
   * @param filter Filter criteria
   * @returns Filtered tasks
   */
  static async filterTasks(filter: FilterTaskItemInputDto): Promise<TaskItemDto[]> {
    const response = await TaskItemSpecialisedService.postApiTasksQuerying({
      body: filter,
    })
    return response.data ?? []
  }

  // COMMENT OPERATIONS

  /**
   * Get comments for a task
   * @param taskId Task ID
   * @returns Comments on the task
   */
  static async getCommentsByTaskId(taskId: number): Promise<CommentDto[]> {
    const response = await CommentService.getApiCommentsTaskByTaskId({
      path: { taskId },
    })
    return response.data ?? []
  }

  /**
   * Create a new comment
   * @param commentData Comment data
   * @returns Created comment
   */
  static async createComment(commentData: CommentDto): Promise<CommentDto> {
    const response = await CommentService.postApiComments({
      body: commentData,
    })
    return response.data!
  }

  /**
   * Update a comment
   * @param commentId Comment ID
   * @param commentData Updated comment data
   */
  static async updateComment(commentId: number, commentData: CommentDto): Promise<void> {
    await CommentService.putApiCommentsByCommentId({
      path: { commentId },
      body: commentData,
    })
  }

  /**
   * Delete a comment
   * @param commentId Comment ID
   */
  static async deleteComment(commentId: number): Promise<void> {
    await CommentService.deleteApiCommentsByCommentId({
      path: { commentId },
    })
  }

  // CHECKLIST OPERATIONS

  /**
   * Get checklists for a task
   * @param taskId Task ID
   * @returns Checklists on the task
   */
  static async getChecklistsByTaskId(taskId: number): Promise<ChecklistDtoReadable[]> {
    const response = await ChecklistService.getApiChecklistsTaskByTaskId({
      path: { taskId },
    })
    return response.data ?? []
  }

  /**
   * Create a new checklist
   * @param checklistData Checklist data
   * @returns Created checklist
   */
  static async createChecklist(checklistData: ChecklistDtoWritable): Promise<ChecklistDtoReadable> {
    const response = await ChecklistService.postApiChecklists({
      body: checklistData,
    })
    return response.data!
  }

  /**
   * Update a checklist
   * @param checklistId Checklist ID
   * @param checklistData Updated checklist data
   */
  static async updateChecklist(checklistId: number, checklistData: ChecklistDtoWritable): Promise<void> {
    await ChecklistService.putApiChecklistsByChecklistId({
      path: { checklistId },
      body: checklistData,
    })
  }

  /**
   * Delete a checklist
   * @param checklistId Checklist ID
   */
  static async deleteChecklist(checklistId: number): Promise<void> {
    await ChecklistService.deleteApiChecklistsByChecklistId({
      path: { checklistId },
    })
  }

  /**
   * Create a new checklist item
   * @param itemData Checklist item data
   * @returns Created checklist item
   */
  static async createChecklistItem(itemData: ChecklistItemDto): Promise<ChecklistItemDto> {
    const response = await ChecklistService.postApiChecklistsItems({
      body: itemData,
    })
    return response.data!
  }

  /**
   * Update a checklist item
   * @param itemId Checklist item ID
   * @param itemData Updated checklist item data
   */
  static async updateChecklistItem(itemId: number, itemData: ChecklistItemDto): Promise<void> {
    await ChecklistService.putApiChecklistsItemsByItemId({
      path: { itemId },
      body: itemData,
    })
  }

  /**
   * Delete a checklist item
   * @param itemId Checklist item ID
   */
  static async deleteChecklistItem(itemId: number): Promise<void> {
    await ChecklistService.deleteApiChecklistsItemsByItemId({
      path: { itemId },
    })
  }

  // LABEL OPERATIONS

  /**
   * Get labels for a board
   * @param boardId Board ID
   * @returns Labels in the board
   */
  static async getLabelsByBoardId(boardId: number): Promise<LabelDto[]> {
    const response = await LabelService.getApiLabelsBoardByBoardId({
      path: { boardId },
    })
    return response.data ?? []
  }

  /**
   * Create a new label
   * @param labelData Label data
   * @returns Created label
   */
  static async createLabel(labelData: LabelDto): Promise<LabelDto> {
    const response = await LabelService.postApiLabels({
      body: labelData,
    })
    return response.data!
  }

  /**
   * Update a label
   * @param labelId Label ID
   * @param labelData Updated label data
   */
  static async updateLabel(labelId: number, labelData: LabelDto): Promise<void> {
    await LabelService.putApiLabelsByLabelId({
      path: { labelId },
      body: labelData,
    })
  }

  /**
   * Delete a label
   * @param labelId Label ID
   */
  static async deleteLabel(labelId: number): Promise<void> {
    await LabelService.deleteApiLabelsByLabelId({
      path: { labelId },
    })
  }

  /**
   * Add a label to a task
   * @param taskId Task ID
   * @param labelId Label ID
   */
  static async addLabelToTask(taskId: number, labelId: number): Promise<void> {
    await LabelService.postApiLabelsTaskByTaskIdAddByLabelId({
      path: { taskId, labelId },
    })
  }

  /**
   * Remove a label from a task
   * @param taskId Task ID
   * @param labelId Label ID
   */
  static async removeLabelFromTask(taskId: number, labelId: number): Promise<void> {
    await LabelService.postApiLabelsTaskByTaskIdRemoveByLabelId({
      path: { taskId, labelId },
    })
  }

  // ATTACHMENT OPERATIONS

  /**
   * Get attachments for a task
   * @param taskId Task ID
   * @returns Attachments on the task
   */
  static async getAttachmentsByTaskId(taskId: number): Promise<AttachmentDto[]> {
    const response = await AttachmentService.getApiAttachmentTaskByTaskId({
      path: { taskId },
    })
    return response.data ?? []
  }

  /**
   * Upload an attachment to a task
   * @param taskId Task ID
   * @param file File to upload
   * @returns Created attachment
   */
  static async uploadAttachment(taskId: number, file: File): Promise<AttachmentDto> {
    const response = await AttachmentService.postApiAttachmentUploadByTaskId({
      path: { taskId },
      body: { file },
    })
    return response.data!
  }

  /**
   * Delete an attachment
   * @param id Attachment ID
   */
  static async deleteAttachment(id: number): Promise<void> {
    await AttachmentService.deleteApiAttachmentById({
      path: { id },
    })
  }

  /**
   * Get the download URL for an attachment
   * @param id Attachment ID
   * @returns Full URL to download the attachment
   */
  static getAttachmentDownloadUrl(id: number): string {
    return `${client.getConfig().baseURL}/api/Attachment/download/${id}`
  }

  // DASHBOARD OPERATIONS

  /**
   * Get dashboard statistics
   * @returns Dashboard statistics
   */
  static async getDashboardStats(): Promise<DashboardStatsDto> {
    const response = await DashboardService.getApiDashboardStats()
    return response.data!
  }

  /**
   * Get recent activity
   * @returns Recent activities
   */
  static async getRecentActivity(): Promise<RecentActivityDto[]> {
    const response = await DashboardService.getApiDashboardRecentActivity()
    return response.data ?? []
  }

  /**
   * Get upcoming tasks
   * @returns Upcoming tasks
   */
  static async getUpcomingTasks(): Promise<UpcomingTaskDto[]> {
    const response = await DashboardService.getApiDashboardUpcomingTasks()
    return response.data ?? []
  }

  // NOTIFICATION OPERATIONS

  /**
   * Get all notifications
   * @returns All notifications
   */
  static async getNotifications(): Promise<NotificationDto[]> {
    const response = await NotificationService.getApiNotifications()
    return response.data ?? []
  }

  /**
   * Get unread notifications
   * @returns Unread notifications
   */
  static async getUnreadNotifications(): Promise<NotificationDto[]> {
    const response = await NotificationService.getApiNotificationsUnread()
    return response.data ?? []
  }

  /**
   * Mark a notification as read
   * @param notificationId Notification ID
   */
  static async markNotificationAsRead(notificationId: number): Promise<void> {
    await NotificationService.postApiNotificationsByNotificationIdRead({
      path: { notificationId },
    })
  }

  /**
   * Mark all notifications as read
   */
  static async markAllNotificationsAsRead(): Promise<void> {
    await NotificationService.postApiNotificationsReadAll()
  }

  // MESSAGE OPERATIONS

  /**
   * Get all messages
   * @returns All messages
   */
  static async getMessages(): Promise<MessageDto[]> {
    const response = await MessageService.getApiMessages()
    return response.data ?? []
  }

  /**
   * Get conversation with a user
   * @param userId User ID
   * @returns Messages in the conversation
   */
  static async getConversation(userId: number): Promise<MessageDto[]> {
    const response = await MessageService.getApiMessagesConversationByUserId({
      path: { userId },
    })
    return response.data ?? []
  }

  /**
   * Send a message
   * @param messageData Message data
   * @returns Created message
   */
  static async sendMessage(messageData: MessageDto): Promise<MessageDto> {
    const response = await MessageService.postApiMessages({
      body: messageData,
    })
    return response.data!
  }

  /**
   * Mark a message as read
   * @param messageId Message ID
   */
  static async markMessageAsRead(messageId: number): Promise<void> {
    await MessageService.postApiMessagesByMessageIdRead({
      path: { messageId },
    })
  }

  // USER OPERATIONS

  /**
   * Get current user profile
   * @returns User profile
   */
  static async getUserProfile(): Promise<UserDtoReadable> {
    const response = await UserService.getApiUsersProfile()
    return response.data!
  }

  /**
   * Update user profile
   * @param profileData Updated profile data
   */
  static async updateUserProfile(profileData: UpdateProfileDto): Promise<void> {
    await UserService.putApiUsersProfile({
      body: profileData,
    })
  }

  /**
   * Change user password
   * @param currentPassword Current password
   * @param newPassword New password
   */
  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await UserService.putApiUsersPassword({
      body: {
        currentPassword,
        newPassword,
      },
    })
  }

  /**
   * Search users
   * @param query Search query
   * @returns Matching users
   */
  static async searchUsers(query: string): Promise<UserDtoReadable[]> {
    const response = await UserService.getApiUsersSearch({
      query: { query },
    })
    return response.data ?? []
  }

  /**
   * Upload profile photo
   * @param file Photo file
   */
  static async uploadProfilePhoto(file: File): Promise<void> {
    await UserProfileService.postApiUserProfileProfilePhoto({
      body: { file },
    })
  }

  /**
   * Delete profile photo
   */
  static async deleteProfilePhoto(): Promise<void> {
    await UserProfileService.deleteApiUserProfileProfilePhoto()
  }

  // HEALTH CHECK

  /**
   * Check API health
   * @returns True if API is healthy
   */
  static async checkHealth(): Promise<boolean> {
    try {
      await HealthService.getApiHealth()
      return true
    } catch {
      return false
    }
  }
}
