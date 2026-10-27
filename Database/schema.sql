-- Schema for the Hebrew AI Chat project.
-- Run this file once to create the database and its two tables.

CREATE DATABASE IF NOT EXISTS ai_chat
  CHARACTER SET utf8mb4          -- utf8mb4 stores Hebrew, emojis and any other text correctly
  COLLATE utf8mb4_unicode_ci;

USE ai_chat;

-- One row per conversation.
CREATE TABLE IF NOT EXISTS conversations (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  title          VARCHAR(255) NOT NULL DEFAULT 'שיחה חדשה',
  response_style ENUM('short', 'detailed', 'simple') NOT NULL DEFAULT 'detailed',
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- One row per message. Deleting a conversation deletes its messages automatically.
CREATE TABLE IF NOT EXISTS messages (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT NOT NULL,
  role            ENUM('user', 'assistant') NOT NULL,
  content         TEXT NOT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);
