"use client"

import { useState, useEffect, useRef } from "react"
import PageContainer from "../components/PageContainer"
import { Search, Send, Paperclip, Smile, MoreVertical, Phone, Video, Info, User, Check, CheckCheck } from "lucide-react"

// Define message interface
interface Message {
  id: number
  senderId: number | string
  text: string
  timestamp: string
  status: string
}

// Define conversation interface
interface Conversation {
  id: number
  userId: number
  messages: Message[]
  unread?: number
}

// Define team member interface
interface TeamMember {
  id: number
  name: string
  role: string
  avatar: string
  status: string
  lastSeen: string
}

// Mock data for team members
const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Alex Johnson",
    role: "Project Manager",
    avatar: "/placeholder.svg?height=40&width=40&query=AJ",
    status: "online",
    lastSeen: "now",
  },
  {
    id: 2,
    name: "Sarah Williams",
    role: "UI/UX Designer",
    avatar: "/placeholder.svg?height=40&width=40&query=SW",
    status: "offline",
    lastSeen: "2h ago",
  },
  {
    id: 3,
    name: "Michael Chen",
    role: "Full Stack Developer",
    avatar: "/placeholder.svg?height=40&width=40&query=MC",
    status: "busy",
    lastSeen: "5m ago",
  },
  {
    id: 4,
    name: "Emily Rodriguez",
    role: "QA Engineer",
    avatar: "/placeholder.svg?height=40&width=40&query=ER",
    status: "online",
    lastSeen: "now",
  },
  {
    id: 5,
    name: "David Kim",
    role: "Backend Developer",
    avatar: "/placeholder.svg?height=40&width=40&query=DK",
    status: "away",
    lastSeen: "30m ago",
  },
]

// Mock conversation data
const initialConversations: Conversation[] = [
  {
    id: 1,
    userId: 1,
    messages: [
      {
        id: 1,
        senderId: 1,
        text: "Hi there! I've assigned you to the new dashboard task.",
        timestamp: "10:30 AM",
        status: "read",
      },
      {
        id: 2,
        senderId: "me",
        text: "Thanks for letting me know. When is the deadline?",
        timestamp: "10:32 AM",
        status: "read",
      },
      {
        id: 3,
        senderId: 1,
        text: "We need it by next Friday. Can you make it?",
        timestamp: "10:35 AM",
        status: "read",
      },
      {
        id: 4,
        senderId: "me",
        text: "Yes, I'll start working on it today.",
        timestamp: "10:36 AM",
        status: "read",
      },
      {
        id: 5,
        senderId: 1,
        text: "Great! Let me know if you need any resources or have questions.",
        timestamp: "10:38 AM",
        status: "read",
      },
    ],
  },
  {
    id: 2,
    userId: 3,
    messages: [
      {
        id: 1,
        senderId: 3,
        text: "Hey, I'm having an issue with the API integration. Can you help?",
        timestamp: "Yesterday",
        status: "read",
      },
      {
        id: 2,
        senderId: "me",
        text: "Sure, what's the problem?",
        timestamp: "Yesterday",
        status: "read",
      },
      {
        id: 3,
        senderId: 3,
        text: "I'm getting a 403 error when trying to fetch user data.",
        timestamp: "Yesterday",
        status: "read",
      },
    ],
    unread: 2,
  },
  {
    id: 3,
    userId: 2,
    messages: [
      {
        id: 1,
        senderId: "me",
        text: "Hi Sarah, can you send me the latest design files?",
        timestamp: "Monday",
        status: "read",
      },
      {
        id: 2,
        senderId: 2,
        text: "Of course! I'll share them with you right away.",
        timestamp: "Monday",
        status: "read",
      },
      {
        id: 3,
        senderId: 2,
        text: "I've just uploaded them to the shared folder. Let me know what you think!",
        timestamp: "Monday",
        status: "read",
      },
    ],
  },
  {
    id: 4,
    userId: 4,
    messages: [
      {
        id: 1,
        senderId: 4,
        text: "I've completed the testing for the login feature. Found a few minor bugs.",
        timestamp: "Tuesday",
        status: "read",
      },
      {
        id: 2,
        senderId: "me",
        text: "Thanks for the update. Can you create tickets for those bugs?",
        timestamp: "Tuesday",
        status: "read",
      },
      {
        id: 3,
        senderId: 4,
        text: "Already done! Check the board when you get a chance.",
        timestamp: "Tuesday",
        status: "read",
      },
    ],
  },
  {
    id: 5,
    userId: 5,
    messages: [
      {
        id: 1,
        senderId: 5,
        text: "The database migration is scheduled for tonight at 10 PM.",
        timestamp: "Wednesday",
        status: "read",
      },
      {
        id: 2,
        senderId: "me",
        text: "Got it. Will there be any downtime?",
        timestamp: "Wednesday",
        status: "read",
      },
      {
        id: 3,
        senderId: 5,
        text: "Yes, about 15 minutes. I've sent an email to all users.",
        timestamp: "Wednesday",
        status: "read",
      },
    ],
  },
]

// Add animation keyframes
const chatAnimations = `
@keyframes messageIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-messageIn {
  animation: messageIn 0.3s ease-out forwards;
}
`

// Status indicator component
const StatusIndicator = ({ status }: { status: string }) => {
  const statusColors = {
    online: "bg-green-500",
    offline: "bg-gray-500",
    busy: "bg-red-500",
    away: "bg-yellow-500",
  }

  const pulseClass = status === "online" ? "animate-pulse" : ""

  return (
    <span
      className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-gray-800 ${statusColors[status as keyof typeof statusColors]} ${pulseClass}`}
    ></span>
  )
}

// Message status component
const MessageStatus = ({ status }: { status: string }) => {
  if (status === "sent") {
    return <Check className="h-3.5 w-3.5 text-gray-400" />
  } else if (status === "delivered") {
    return <CheckCheck className="h-3.5 w-3.5 text-gray-400" />
  } else if (status === "read") {
    return <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
  }
  return null
}

// Typing indicator component
const TypingIndicator = () => {
  return (
    <div className="flex items-center space-x-1 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg max-w-[100px]">
      <div
        className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
        style={{ animationDelay: "0ms" }}
      ></div>
      <div
        className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
        style={{ animationDelay: "150ms" }}
      ></div>
      <div
        className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
        style={{ animationDelay: "300ms" }}
      ></div>
    </div>
  )
}

// Date separator component
const DateSeparator = ({ date }: { date: string }) => {
  return (
    <div className="flex items-center justify-center my-4">
      <div className="border-t border-gray-200 dark:border-gray-700 flex-grow"></div>
      <div className="mx-4 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
        {date}
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 flex-grow"></div>
    </div>
  )
}

const Chat = () => {
  const [activeConversation, setActiveConversation] = useState<number | null>(1) // Default to first conversation
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [reactions, setReactions] = useState<Record<string, string>>({})

  // Filter team members based on search query
  const filteredMembers = teamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Get current conversation
  const currentConversation = conversations.find((conv) => conv.id === activeConversation)

  // Get user details for current conversation
  const currentUser = teamMembers.find((member) => member.id === currentConversation?.userId)

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [activeConversation, conversations])

  // Handle sending a new message
  const handleSendMessage = () => {
    if (message.trim() && activeConversation) {
      const updatedConversations = conversations.map((conv) => {
        if (conv.id === activeConversation) {
          const newMessage = {
            id: conv.messages.length + 1,
            senderId: "me",
            text: message,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: "sent",
          }

          return {
            ...conv,
            messages: [...conv.messages, newMessage],
          }
        }
        return conv
      })

      setConversations(updatedConversations)
      setMessage("")

      // Simulate received message after a delay
      setTimeout(
        () => {
          if (Math.random() > 0.5) {
            // 50% chance to get a reply
            const updatedConversations = conversations.map((conv) => {
              if (conv.id === activeConversation) {
                const replies = [
                  "Got it, thanks!",
                  "I'll look into that.",
                  "Thanks for the update.",
                  "Let me check and get back to you.",
                  "Sounds good!",
                  "Perfect, I appreciate it.",
                ]

                const randomReply = replies[Math.floor(Math.random() * replies.length)]

                const newMessage = {
                  id: conv.messages.length + 2,
                  senderId: conv.userId,
                  text: randomReply,
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  status: "read",
                }

                return {
                  ...conv,
                  messages: [...conv.messages, newMessage],
                }
              }
              return conv
            })

            setConversations(updatedConversations)
          }
        },
        2000 + Math.random() * 3000,
      ) // Random delay between 2-5 seconds
    }
  }

  const handleAddReaction = (messageId: number, emoji: string) => {
    setReactions({
      ...reactions,
      [`${activeConversation}-${messageId}`]: emoji,
    })
  }

  return (
    <PageContainer>
      <style dangerouslySetInnerHTML={{ __html: chatAnimations }} />
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* Sidebar - Conversations list */}
        <div className="w-full md:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Messages</h2>
            <div className="mt-2 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {filteredMembers.map((member) => {
              const conversation = conversations.find((conv) => conv.userId === member.id)
              const lastMessage = conversation?.messages[conversation.messages.length - 1]

              return (
                <div
                  key={member.id}
                  onClick={() => setActiveConversation(conversation?.id || null)}
                  className={`p-3 flex items-start space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    activeConversation === conversation?.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={member.avatar || "/placeholder.svg"}
                      alt={member.name}
                      className="h-10 w-10 rounded-full"
                    />
                    <StatusIndicator status={member.status} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">{member.name}</h3>
                      {lastMessage && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">{lastMessage.timestamp}</span>
                      )}
                    </div>
                    {lastMessage && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {lastMessage.senderId === "me" ? "You: " : ""}
                        {lastMessage.text}
                      </p>
                    )}

                    {/* Unread indicator */}
                    {conversation?.unread && conversation.unread > 0 && (
                      <div className="mt-1 flex justify-end">
                        <span className="bg-blue-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                          {conversation.unread}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Main chat area */}
        <div className="hidden md:flex flex-col flex-1 bg-gray-50 dark:bg-gray-900">
          {activeConversation && currentUser ? (
            <>
              {/* Chat header */}
              <div className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="relative mr-3">
                    <img
                      src={currentUser.avatar || "/placeholder.svg"}
                      alt={currentUser.name}
                      className="h-10 w-10 rounded-full"
                    />
                    <StatusIndicator status={currentUser.status} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">{currentUser.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {currentUser.status === "online" ? "Online" : `Last seen ${currentUser.lastSeen}`}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700">
                    <Phone className="h-5 w-5" />
                  </button>
                  <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700">
                    <Video className="h-5 w-5" />
                  </button>
                  <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700">
                    <Info className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto p-4 space-y-4"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 25px 25px, rgba(0, 0, 0, 0.05) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(0, 0, 0, 0.025) 2%, transparent 0%)",
                  backgroundSize: "100px 100px",
                }}
              >
                {/* Group messages by date */}
                {(() => {
                  if (!currentConversation) return null
                  const messagesByDate: Record<string, Message[]> = {}

                  // Group messages by date
                  currentConversation.messages.forEach((msg) => {
                    // Extract date from timestamp or use the timestamp directly if it's a relative date
                    const dateKey = msg.timestamp.includes(":")
                      ? new Date().toLocaleDateString() // For today's messages with time format (10:30 AM)
                      : msg.timestamp // For other messages with relative dates (Yesterday, Monday, etc.)

                    if (!messagesByDate[dateKey]) {
                      messagesByDate[dateKey] = []
                    }
                    messagesByDate[dateKey].push(msg)
                  })

                  // Render messages with date separators
                  return Object.entries(messagesByDate).map(([date, messages], dateIndex) => (
                    <div key={date} className="space-y-4">
                      {/* Only show date separator if it's not the first group */}
                      {dateIndex > 0 && <DateSeparator date={date} />}

                      {messages.map((msg) => {
                        const isMe = msg.senderId === "me"
                        const sender = isMe ? null : teamMembers.find((m) => m.id === msg.senderId)

                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isMe ? "justify-end" : "justify-start"} animate-messageIn`}
                            style={{ animationDelay: `${msg.id * 50}ms` }}
                          >
                            {!isMe && (
                              <div className="mr-2 flex-shrink-0">
                                <img
                                  src={sender?.avatar || "/placeholder.svg"}
                                  alt={sender?.name}
                                  className="h-8 w-8 rounded-full"
                                />
                              </div>
                            )}

                            <div
                              className={`max-w-xs lg:max-w-md ${
                                isMe
                                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-l-lg rounded-br-lg"
                                  : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-r-lg rounded-bl-lg"
                              } px-4 py-2 shadow-sm hover:shadow transition-shadow duration-200 group relative`}
                            >
                              <p>{msg.text}</p>
                              <div
                                className={`text-xs mt-1 flex items-center ${
                                  isMe ? "text-blue-200 justify-end" : "text-gray-500 dark:text-gray-400"
                                }`}
                              >
                                <span>{msg.timestamp}</span>
                                {isMe && (
                                  <span className="ml-1">
                                    <MessageStatus status={msg.status} />
                                  </span>
                                )}
                              </div>

                              {/* Emoji reaction */}
                              {reactions[`${activeConversation}-${msg.id}`] && (
                                <div className="absolute -bottom-3 right-2 bg-white dark:bg-gray-800 rounded-full px-1.5 py-0.5 shadow-sm text-sm">
                                  {reactions[`${activeConversation}-${msg.id}`]}
                                </div>
                              )}

                              {/* Reaction buttons */}
                              <div className="absolute -top-8 right-0 hidden group-hover:flex bg-white dark:bg-gray-800 rounded-full shadow-md p-1 space-x-1">
                                {["👍", "❤️", "😂", "😮", "🎉"].map((emoji) => (
                                  <button
                                    key={emoji}
                                    className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleAddReaction(msg.id, emoji)
                                    }}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ))
                })()}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="mr-2 flex-shrink-0">
                      <img
                        src={currentUser?.avatar || "/placeholder.svg"}
                        alt={currentUser?.name}
                        className="h-8 w-8 rounded-full"
                      />
                    </div>
                    <TypingIndicator />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700">
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 border-0 focus:ring-0 text-sm text-gray-900 dark:text-white bg-transparent mx-2"
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value)
                      if (e.target.value && !isTyping && activeConversation) {
                        setIsTyping(true)
                        // Hide typing indicator after 3 seconds
                        setTimeout(() => setIsTyping(false), 3000)
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                  <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700">
                    <Smile className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className={`p-2 rounded-full ${
                      message.trim()
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                    }`}
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full p-6 mb-4">
                <User className="h-12 w-12 text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Select a conversation</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
                Choose a team member from the list to start chatting or continue a previous conversation.
              </p>
            </div>
          )}
        </div>

        {/* Mobile view - show only conversations or active chat */}
        <div className="flex flex-col flex-1 md:hidden bg-gray-50 dark:bg-gray-900">
          {activeConversation && currentUser ? (
            <>
              {/* Chat header with back button */}
              <div className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div className="flex items-center">
                  <button
                    onClick={() => setActiveConversation(null)}
                    className="mr-2 p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <div className="relative mr-3">
                    <img
                      src={currentUser.avatar || "/placeholder.svg"}
                      alt={currentUser.name}
                      className="h-8 w-8 rounded-full"
                    />
                    <StatusIndicator status={currentUser.status} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">{currentUser.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {currentUser.status === "online" ? "Online" : `Last seen ${currentUser.lastSeen}`}
                    </p>
                  </div>
                </div>

                <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Group messages by date */}
                {(() => {
                  if (!currentConversation) return null
                  const messagesByDate: Record<string, Message[]> = {}

                  // Group messages by date
                  currentConversation.messages.forEach((msg) => {
                    // Extract date from timestamp or use the timestamp directly if it's a relative date
                    const dateKey = msg.timestamp.includes(":")
                      ? new Date().toLocaleDateString() // For today's messages with time format (10:30 AM)
                      : msg.timestamp // For other messages with relative dates (Yesterday, Monday, etc.)

                    if (!messagesByDate[dateKey]) {
                      messagesByDate[dateKey] = []
                    }
                    messagesByDate[dateKey].push(msg)
                  })

                  // Render messages with date separators
                  return Object.entries(messagesByDate).map(([date, messages], dateIndex) => (
                    <div key={date} className="space-y-4">
                      {/* Only show date separator if it's not the first group */}
                      {dateIndex > 0 && <DateSeparator date={date} />}

                      {messages.map((msg) => {
                        const isMe = msg.senderId === "me"
                        const sender = isMe ? null : teamMembers.find((m) => m.id === msg.senderId)

                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isMe ? "justify-end" : "justify-start"} animate-messageIn`}
                            style={{ animationDelay: `${msg.id * 50}ms` }}
                          >
                            {!isMe && (
                              <div className="mr-2 flex-shrink-0">
                                <img
                                  src={sender?.avatar || "/placeholder.svg"}
                                  alt={sender?.name}
                                  className="h-8 w-8 rounded-full"
                                />
                              </div>
                            )}

                            <div
                              className={`max-w-xs lg:max-w-md ${
                                isMe
                                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-l-lg rounded-br-lg"
                                  : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-r-lg rounded-bl-lg"
                              } px-4 py-2 shadow-sm hover:shadow transition-shadow duration-200 group relative`}
                            >
                              <p>{msg.text}</p>
                              <div
                                className={`text-xs mt-1 flex items-center ${
                                  isMe ? "text-blue-200 justify-end" : "text-gray-500 dark:text-gray-400"
                                }`}
                              >
                                <span>{msg.timestamp}</span>
                                {isMe && (
                                  <span className="ml-1">
                                    <MessageStatus status={msg.status} />
                                  </span>
                                )}
                              </div>

                              {/* Emoji reaction */}
                              {reactions[`${activeConversation}-${msg.id}`] && (
                                <div className="absolute -bottom-3 right-2 bg-white dark:bg-gray-800 rounded-full px-1.5 py-0.5 shadow-sm text-sm">
                                  {reactions[`${activeConversation}-${msg.id}`]}
                                </div>
                              )}

                              {/* Reaction buttons */}
                              <div className="absolute -top-8 right-0 hidden group-hover:flex bg-white dark:bg-gray-800 rounded-full shadow-md p-1 space-x-1">
                                {["👍", "❤️", "😂", "😮", "🎉"].map((emoji) => (
                                  <button
                                    key={emoji}
                                    className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleAddReaction(msg.id, emoji)
                                    }}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ))
                })()}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="mr-2 flex-shrink-0">
                      <img
                        src={currentUser?.avatar || "/placeholder.svg"}
                        alt={currentUser?.name}
                        className="h-8 w-8 rounded-full"
                      />
                    </div>
                    <TypingIndicator />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <button className="p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700">
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 border-0 focus:ring-0 text-sm text-gray-900 dark:text-white bg-transparent mx-2"
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value)
                      if (e.target.value && !isTyping && activeConversation) {
                        setIsTyping(true)
                        // Hide typing indicator after 3 seconds
                        setTimeout(() => setIsTyping(false), 3000)
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className={`p-2 rounded-full ${
                      message.trim()
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                    }`}
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            // Show conversation list on mobile when no chat is active
            <div className="flex-1 overflow-y-auto">
              {filteredMembers.map((member) => {
                const conversation = conversations.find((conv) => conv.userId === member.id)
                const lastMessage = conversation?.messages[conversation.messages.length - 1]

                return (
                  <div
                    key={member.id}
                    onClick={() => setActiveConversation(conversation?.id || null)}
                    className="p-3 flex items-start space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700"
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={member.avatar || "/placeholder.svg"}
                        alt={member.name}
                        className="h-10 w-10 rounded-full"
                      />
                      <StatusIndicator status={member.status} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">{member.name}</h3>
                        {lastMessage && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">{lastMessage.timestamp}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.role}</p>
                      {lastMessage && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                          {lastMessage.senderId === "me" ? "You: " : ""}
                          {lastMessage.text}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}

export default Chat
