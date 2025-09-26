// Telegram Bot Integration
const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = import.meta.env.VITE_TELEGRAM_ADMIN_CHAT_ID;
const GROUP_CHAT_ID = '-4886940173'; // Wednesday Football Group chat ID
const BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME; // e.g., @YourBotName

if (!TELEGRAM_BOT_TOKEN || !ADMIN_CHAT_ID) {
  console.warn('Telegram bot credentials not configured. Telegram notifications will be disabled.');
}

export interface TelegramMessage {
  text: string;
  parse_mode?: 'HTML' | 'Markdown';
}

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

// Send message to admin (for signup requests)
export async function sendTelegramMessageToAdmin(message: TelegramMessage): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !ADMIN_CHAT_ID) {
    console.warn('Telegram bot not configured, skipping notification');
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text: message.text,
        parse_mode: message.parse_mode || 'HTML',
      }),
    });

    if (!response.ok) {
      console.error('Telegram API error:', response.status, response.statusText);
      return false;
    }

    const result = await response.json();
    console.log('Telegram message sent to admin successfully:', result);
    return true;
  } catch (error) {
    console.error('Error sending Telegram message to admin:', error);
    return false;
  }
}

// Send message to group (for game registration updates)
export async function sendTelegramMessageToGroup(message: TelegramMessage): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('Telegram bot not configured, skipping notification');
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: GROUP_CHAT_ID,
        text: message.text,
        parse_mode: message.parse_mode || 'HTML',
      }),
    });

    if (!response.ok) {
      console.error('Telegram API error:', response.status, response.statusText);
      return false;
    }

    const result = await response.json();
    console.log('Telegram message sent to group successfully:', result);
    return true;
  } catch (error) {
    console.error('Error sending Telegram message to group:', error);
    return false;
  }
}

// Legacy function for backward compatibility - defaults to admin
export async function sendTelegramMessage(message: TelegramMessage): Promise<boolean> {
  return sendTelegramMessageToAdmin(message);
}

// Get bot information
export async function getBotInfo(): Promise<TelegramUser | null> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('Telegram bot token not configured');
    return null;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
    
    if (!response.ok) {
      console.error('Telegram API error:', response.status, response.statusText);
      return null;
    }

    const result = await response.json();
    return result.ok ? result.result : null;
  } catch (error) {
    console.error('Error getting bot info:', error);
    return null;
  }
}

// Send message to a specific chat ID (user must have started the bot first)
export async function sendTelegramMessageToUser(chatId: number, message: TelegramMessage): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('Telegram bot not configured, skipping notification');
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message.text,
        parse_mode: message.parse_mode || 'HTML',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API error:', response.status, errorData);
      return false;
    }

    const result = await response.json();
    console.log('Telegram message sent to user successfully:', result);
    return true;
  } catch (error) {
    console.error('Error sending Telegram message to user:', error);
    return false;
  }
}

// Generate a deep link for users to start the bot
export function generateBotStartLink(payload?: string): string {
  if (!BOT_USERNAME) {
    console.warn('Bot username not configured');
    return 'https://t.me/';
  }

  const botUsername = BOT_USERNAME.startsWith('@') ? BOT_USERNAME.slice(1) : BOT_USERNAME;
  const startParam = payload ? `?start=${payload}` : '';
  return `https://t.me/${botUsername}${startParam}`;
}

export function formatNewUserSignupMessage(username: string, phoneNumber: string, playerName?: string): TelegramMessage {
  const timestamp = new Date().toLocaleString('en-GB', {
    timeZone: 'Asia/Jerusalem',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const text = `🆕 <b>New User Registration Request</b>

👤 <b>Username:</b> ${username}
📱 <b>Phone:</b> ${phoneNumber}
${playerName ? `⚽ <b>Player Name:</b> ${playerName}` : ''}
⏰ <b>Time:</b> ${timestamp}

🔗 <a href="https://wednesdayleague.netlify.app">Open Dashboard</a> to approve/deny this request.`;

  return {
    text,
    parse_mode: 'HTML'
  };
}

export function formatWelcomeMessage(username: string, playerName?: string): TelegramMessage {
  const text = `🎉 <b>Welcome to Wednesday Football League!</b>

👋 Hi ${playerName || username}!

Your registration has been approved and you can now:
✅ Sign in to the dashboard
⚽ Register for weekly games
📱 Get game updates and notifications

🔗 <a href="https://wednesdayleague.netlify.app">Open Dashboard</a>

See you on the field! 🏆`;

  return {
    text,
    parse_mode: 'HTML'
  };
}

export function formatGameReminderMessage(playerName: string): TelegramMessage {
  const gameDay = 'Wednesday';
  const gameTime = '20:30';
  
  const text = `⚽ <b>Game Reminder</b>

Hi ${playerName}! 👋

🗓️ <b>Tomorrow is ${gameDay}!</b>
⏰ <b>Time:</b> ${gameTime}
📍 Don't forget to check the location details

🔗 <a href="https://wednesdayleague.netlify.app">Open Dashboard</a> for more details

See you on the field! 🏆`;

  return {
    text,
    parse_mode: 'HTML'
  };
}

export function formatGameRegistrationMessage(mainRoster: (Player | null)[], substitutes: Player[]): TelegramMessage {
  const timestamp = new Date().toLocaleString('en-GB', {
    timeZone: 'Asia/Jerusalem',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  let text = `🏆 <b>Main Roster:</b>\n`;

  // Add main roster players (18 slots)
  for (let i = 0; i < 18; i++) {
    const player = mainRoster[i];
    const slotNumber = (i + 1).toString().padStart(2, '0');
    
    if (player) {
      const confirmIcon = player.isConfirmed ? ' ✅' : '';
      text += `${slotNumber}. ${player.name}${confirmIcon}\n`;
    } else {
      text += `${slotNumber}. \n`;
    }
  }

  if (substitutes.length > 0) {
    text += `\n🔄 <b>Substitutes:</b>\n`;
    substitutes.forEach((player, index) => {
      const slotNumber = (index + 1).toString().padStart(2, '0');
      const confirmIcon = player.isConfirmed ? ' ✅' : '';
      text += `${slotNumber}. ${player.name}${confirmIcon}\n`;
    });
  }

  text += `\n⏰ <b>Updated:</b> ${timestamp}

🔗 <a href="https://wednesdayleague.netlify.app">Open Dashboard</a>`;

  return {
    text,
    parse_mode: 'HTML'
  };
}

export function formatPublishedTeamsMessage(publishedTeams: { team1: Player[]; team2: Player[]; team3: Player[]; publishedAt: number; publishedBy: string }): TelegramMessage {
  const timestamp = new Date(publishedTeams.publishedAt).toLocaleString('en-GB', {
    timeZone: 'Asia/Jerusalem',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  let text = `🏆 <b>TEAMS PUBLISHED!</b>\n\n`;

  // Team 1
  text += `🔵 <b>Team 1:</b>\n`;
  publishedTeams.team1.forEach((player, index) => {
    text += `${index + 1}. ${player.name}\n`;
  });

  // Team 2
  text += `\n🔴 <b>Team 2:</b>\n`;
  publishedTeams.team2.forEach((player, index) => {
    text += `${index + 1}. ${player.name}\n`;
  });

  // Team 3 (if exists)
  if (publishedTeams.team3.length > 0) {
    text += `\n🟡 <b>Team 3:</b>\n`;
    publishedTeams.team3.forEach((player, index) => {
      text += `${index + 1}. ${player.name}\n`;
    });
  }

  text += `\n\n⚽ Good luck and have fun! 🏆`;
  text += `\n\n🔗 <a href="https://wednesdayleague.netlify.app">Open Dashboard</a>`;

  return {
    text,
    parse_mode: 'HTML'
  };
}