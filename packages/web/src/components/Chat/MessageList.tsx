import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Collapse,
  Rating,
  TextField,
  Button,
  alpha,
  useTheme,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import {
  Person,
  SmartToy,
  MoreVert,
  Edit,
  Delete,
  Refresh,
  ContentCopy,
  Code,
} from '@mui/icons-material';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { Message } from '../../types';
import ArtifactRenderer from './ArtifactRenderer';
import AnimatedMessage from './AnimatedMessage';
import ProjectFilesIndicator from './ProjectFilesIndicator';

interface MessageListProps {
  messages: Message[];
  loading?: boolean;
  isMobile?: boolean;
  onDeleteMessage?: (messageId: string) => Promise<void>;
  onEditMessage?: (messageId: string, content: string) => Promise<void>;
  onRegenerateMessage?: (messageId: string) => Promise<void>;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  onRegenerate?: (messageId: string) => void;
  streamingMessage?: {
    id: string;
    role: 'assistant';
    content: string;
    model?: string;
    isStreaming: boolean;
  } | null;
  chatType?: 'claude' | 'grok' | 'general';
}

interface MessageItemProps {
  message: Message | any;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  onRegenerate?: (messageId: string) => void;
  isStreaming?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onEdit,
  onDelete,
  onRegenerate,
  isStreaming = false,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(message.feedback?.rating || 0);
  const theme = useTheme();

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (onEdit && editContent.trim()) {
      onEdit(message._id, editContent);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    handleMenuClose();
    if (onDelete && window.confirm('Delete this message?')) {
      onDelete(message._id);
    }
  };

  const handleRegenerate = () => {
    handleMenuClose();
    if (onRegenerate) {
      onRegenerate(message._id);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    handleMenuClose();
  };

  const isUser = message.role === 'user';

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        mb: 3,
        flexDirection: isUser ? 'row-reverse' : 'row',
        animation: 'fadeInUp 0.3s ease-out',
        opacity: isStreaming ? 0.9 : 1,
        '@keyframes fadeInUp': {
          from: {
            opacity: 0,
            transform: 'translateY(10px)',
          },
          to: {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      }}
    >
      <Avatar
        sx={{
          bgcolor: isUser 
            ? theme.palette.primary.main 
            : theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, #00d9ff 0%, #6366f1 50%, #ee00ff 100%)' 
              : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          background: !isUser && (theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #00d9ff 0%, #6366f1 50%, #ee00ff 100%)' 
            : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'),
          width: 36,
          height: 36,
          boxShadow: !isUser && theme.palette.mode === 'dark' 
            ? '0 4px 16px rgba(99, 102, 241, 0.3)' 
            : '0 2px 8px rgba(0, 0, 0, 0.1)',
          animation: isStreaming ? 'pulse 2s ease-in-out infinite' : 'none',
          '@keyframes pulse': {
            '0%, 100%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.05)' },
          },
        }}
      >
        {isUser ? <Person /> : <SmartToy />}
      </Avatar>

      <Box sx={{ flex: 1, maxWidth: '80%' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 0.5,
            flexDirection: isUser ? 'row-reverse' : 'row',
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280',
              fontWeight: 500,
            }}
          >
            {isUser ? 'You' : message.model || 'Assistant'}
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.mode === 'dark' ? '#6b7280' : '#9ca3af' }}>
            {format(new Date(message.createdAt || Date.now()), 'HH:mm')}
          </Typography>
          {message.isEdited && (
            <Typography variant="caption" sx={{ color: theme.palette.mode === 'dark' ? '#6b7280' : '#9ca3af' }}>
              (edited)
            </Typography>
          )}
          {isStreaming && (
            <Chip
              label="generating..."
              size="small"
              color="primary"
              sx={{ 
                height: 18,
                fontSize: '10px',
                animation: 'blink 1.5s ease-in-out infinite',
                '@keyframes blink': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                },
              }}
            />
          )}
          {!isStreaming && (
            <IconButton 
              size="small" 
              onClick={handleMenuClick}
              sx={{
                opacity: 0.5,
                '&:hover': {
                  opacity: 1,
                },
              }}
            >
              <MoreVert fontSize="small" />
            </IconButton>
          )}
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: isUser 
              ? theme.palette.mode === 'dark'
                ? alpha('#6366f1', 0.15)
                : '#e8ebff'
              : theme.palette.mode === 'dark'
                ? alpha('#1a1a2e', 0.6)
                : '#ffffff',
            border: 1,
            borderColor: isUser
              ? theme.palette.mode === 'dark'
                ? alpha('#6366f1', 0.3)
                : alpha('#6366f1', 0.2)
              : theme.palette.mode === 'dark'
                ? alpha('#6366f1', 0.15)
                : alpha(theme.palette.divider, 0.5),
            borderRadius: '20px',
            borderTopLeftRadius: !isUser ? '4px' : '20px',
            borderTopRightRadius: isUser ? '4px' : '20px',
            position: 'relative',
            overflow: 'hidden',
            '&::before': !isUser && {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(90deg, #00d9ff 0%, #6366f1 50%, #ee00ff 100%)'
                : 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
              borderRadius: '20px 20px 0 0',
            },
          }}
        >
          {isEditing ? (
            <Box>
              <TextField
                fullWidth
                multiline
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" onClick={handleSaveEdit}>
                  Save
                </Button>
                <Button size="small" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : (
            <>
              <ReactMarkdown className="markdown-body">
                {message.content || (isStreaming ? '...' : '')}
              </ReactMarkdown>

              {/* Streaming cursor */}
              {isStreaming && message.content && (
                <Box
                  component="span"
                  sx={{
                    display: 'inline-block',
                    width: '2px',
                    height: '1.2em',
                    bgcolor: 'primary.main',
                    animation: 'cursor-blink 1s ease-in-out infinite',
                    verticalAlign: 'text-bottom',
                    ml: 0.5,
                    '@keyframes cursor-blink': {
                      '0%, 50%': { opacity: 1 },
                      '51%, 100%': { opacity: 0 },
                    },
                  }}
                />
              )}

              {/* Streaming progress bar */}
              {isStreaming && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                  }}
                >
                  <LinearProgress 
                    color="primary"
                    sx={{
                      height: 2,
                      '& .MuiLinearProgress-bar': {
                        animationDuration: '1.5s',
                      },
                    }}
                  />
                </Box>
              )}

              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {message.attachments.map((attachment, index) => (
                    <Chip
                      key={index}
                      label={attachment.name}
                      size="small"
                      icon={<Code />}
                      sx={{
                        background: theme.palette.mode === 'dark'
                          ? alpha('#2a2a3e', 0.6)
                          : alpha(theme.palette.primary.main, 0.1),
                      }}
                    />
                  ))}
                </Box>
              )}

              {/* Project Files */}
              {message.projectId && (
                <ProjectFilesIndicator
                  projectId={message.projectId}
                  files={[]}
                />
              )}

              {/* Artifacts */}
              {message.artifacts && message.artifacts.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <ArtifactRenderer artifacts={message.artifacts} />
                </Box>
              )}

              {/* Usage info */}
              {message.usage && !isStreaming && (
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: theme.palette.mode === 'dark' ? '#6b7280' : '#9ca3af',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: theme.palette.primary.main,
                        display: 'inline-block',
                      }}
                    />
                    Tokens: {message.usage.totalTokens}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: theme.palette.mode === 'dark' ? '#6b7280' : '#9ca3af',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: theme.palette.success.main,
                        display: 'inline-block',
                      }}
                    />
                    Cost: ${message.usage.cost?.toFixed(4) || '0.0000'}
                  </Typography>
                </Box>
              )}

              {/* Feedback for assistant messages */}
              {!isUser && !isStreaming && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    size="small"
                    onClick={() => setShowFeedback(!showFeedback)}
                    sx={{
                      fontSize: '0.75rem',
                      color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280',
                      '&:hover': {
                        background: alpha(theme.palette.primary.main, 0.05),
                      },
                    }}
                  >
                    Rate this response
                  </Button>
                  <Collapse in={showFeedback}>
                    <Box sx={{ mt: 1 }}>
                      <Rating
                        value={rating}
                        onChange={(_, value) => setRating(value || 0)}
                        sx={{
                          '& .MuiRating-iconFilled': {
                            color: theme.palette.primary.main,
                          },
                        }}
                      />
                    </Box>
                  </Collapse>
                </Box>
              )}
            </>
          )}
        </Paper>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              background: theme.palette.mode === 'dark'
                ? alpha('#1e1e2e', 0.95)
                : alpha('#ffffff', 0.98),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            },
          }}
        >
          <MenuItem onClick={handleCopy}>
            <ContentCopy fontSize="small" sx={{ mr: 1 }} />
            Copy
          </MenuItem>
          {isUser && onEdit && (
            <MenuItem onClick={handleEdit}>
              <Edit fontSize="small" sx={{ mr: 1 }} />
              Edit
            </MenuItem>
          )}
          {!isUser && onRegenerate && (
            <MenuItem onClick={handleRegenerate}>
              <Refresh fontSize="small" sx={{ mr: 1 }} />
              Regenerate
            </MenuItem>
          )}
          {onDelete && (
            <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
              <Delete fontSize="small" sx={{ mr: 1 }} />
              Delete
            </MenuItem>
          )}
        </Menu>
      </Box>
    </Box>
  );
};

const MessageList: React.FC<MessageListProps> = ({
  messages,
  loading = false,
  isMobile,
  onDeleteMessage,
  onEditMessage,
  onRegenerateMessage,
  onEdit,
  onDelete,
  onRegenerate,
  streamingMessage,
  chatType = 'general',
}) => {
  const theme = useTheme();

  const handleEdit = onEditMessage || onEdit;
  const handleDelete = onDeleteMessage || onDelete;
  const handleRegenerate = onRegenerateMessage || onRegenerate;

  const allMessages = streamingMessage 
    ? [...messages, streamingMessage]
    : messages;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        flex: 1,
        overflow: 'auto',
        pb: 2,
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: alpha(theme.palette.text.secondary, 0.3),
          borderRadius: '3px',
          '&:hover': {
            background: alpha(theme.palette.text.secondary, 0.5),
          },
        },
      }}
    >
      {allMessages.map((message, index) => (
        <AnimatedMessage
          key={(message as any)._id || (message as any).id || `message-${index}`}
          message={message}
          index={index}
          chatType={chatType}
          isNew={(message as any).isNew}
        />
      ))}

      {loading && !streamingMessage && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 4,
          }}
        >
          <CircularProgress size={24} />
        </Box>
      )}
    </Box>
  );
};

export default MessageList;