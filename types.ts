
import React from 'react';

export enum OSType {
  IOS = 'IOS',
  ANDROID = 'ANDROID',
  RETRO = 'RETRO',
  CYBER = 'CYBER',
  BRICK = 'BRICK',
  PDA = 'PDA',
  BLACKBERRY = 'BLACKBERRY',
  ROTARY = 'ROTARY'
}

export interface AppIcon {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  notification?: number;
}

export interface SystemTheme {
  background: string;
  statusBarColor: string;
  textColor: string;
}

export interface Voicemail {
  id: string;
  caller: string;
  duration: string;
  timestamp: string;
  transcript: string;
  isReviewed: boolean;
  isPlaying: boolean;
  label: string;
  notes?: string;
}

export interface InteractiveContact {
  id: string;
  firstName: string;
  lastName: string;
  initials: string;
  label?: string;
  phone?: string;
  isFavorite?: boolean;
  avatar?: 'text' | 'img';
  avatarUrl?: string;
  relation?: string;
}

// Shared Calendar Types
export interface CalendarEvidence {
    type: 'email' | 'message' | 'voice';
    source: string;
    content: string;
    timestamp: string;
}

export interface CalendarEvent {
    id: number;
    title: string;
    time: string;
    end: string;
    location: string;
    type: "Work" | "Personal" | "Social";
    color: string;
    weatherIconName?: string; // Stored as string for serializability
    notes?: string;
    silasContext?: string;
    evidence?: CalendarEvidence[];
}

export interface ActiveRide {
    status: 'IDLE' | 'REQUESTING' | 'CONFIRMED' | 'ARRIVED' | 'ON_TRIP';
    driverName?: string;
    carModel?: string;
    plateNumber?: string;
    rating?: string;
    eta?: string;
    destination?: string;
    driverImage?: string;
    source?: 'APP' | 'CALENDAR';
    riderId?: string; // 'me' or contact ID
}

export interface Transaction {
    id: string;
    merchant: string;
    amount: string;
    date: string;
    type: 'debit' | 'credit';
    category: string;
    icon?: any; // Lucide icon component
    color?: string;
}

export interface GlobalCartItem {
    id: string;
    name: string;
    price: number;
    store: string;
    category?: string;
    addedAt: Date;
    image?: string;
    brand?: string;
}

// --- NEW TYPES FOR PERSISTENCE ---

export interface Song {
    id: string;
    title: string;
    artist: string;
    album: string;
    cover: string;
    url: string; // MP3 URL
    duration: number; // in seconds
}

export interface Message {
  id: string;
  text?: string;
  image?: string;
  isMe: boolean;
  isSystem?: boolean;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  contactId: string;
  messages: Message[];
  unread: boolean;
}

export interface Email {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  body: string;
  time: string;
  unread: boolean;
  isVip?: boolean;
  avatarColor: string;
  initials: string;
  to?: string;
  dateFull?: string;
}

export interface SafariTab {
    id: string;
    title: string;
    url: string;
    favicon?: string;
}
