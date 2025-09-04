
import React from 'react';
import type { Message } from '../types';
import { BotIcon } from './icons/BotIcon';
import { UserIcon } from './icons/UserIcon';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  const wrapperClasses = `flex items-start gap-4 ${isUser ? 'flex-row-reverse' : ''}`;
  const bubbleClasses = `max-w-xl rounded-xl p-4 ${isUser ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-200'}`;

  return (
    <div className={wrapperClasses}>
      <div className={`flex items-center justify-center h-10 w-10 rounded-full shrink-0 ${isUser ? 'bg-gray-700' : 'bg-blue-500/20'}`}>
        {isUser ? <UserIcon /> : <BotIcon />}
      </div>
      <div className={bubbleClasses}>
        <p className="whitespace-pre-wrap">{message.text}</p>
      </div>
    </div>
  );
};
