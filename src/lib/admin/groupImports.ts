/**
 * WhatsApp groups (admin): upload a group's chat export, review the host adverts and guest requests
 * it found (with recommended stays), fix a number, then Send / Send all. Sends are queued on the
 * backend and go out one by one; poll the group to see them change to sent.
 */

import { GraphQLClient } from '@/lib/graphql-client';

export type GroupItemStatus = 'review' | 'queued' | 'sent' | 'skipped' | 'failed';

export interface GroupImport {
  importId: string;
  groupName?: string | null;
  filename: string;
  status: 'queued' | 'processing' | 'done' | 'failed';
  error?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  messages: number;
  newMessages: number;
  hosts: number;
  guests: number;
  withoutPhone: number;
  refused: number;
  itemCount: number;
}

export interface GroupImportItem {
  itemId: string;
  importId: string;
  groupName: string;
  kind: 'host' | 'guest';
  sender: string;
  postedAt: string;
  text: string;
  phone?: string | null;
  phoneSource?: string | null;
  phoneCandidates?: string[] | null;
  lang: string;
  status: GroupItemStatus;
  sendError?: string | null;
  draft?: { title: string; area: string; propertyType?: string | null; bedrooms?: number | null; maxGuests?: number | null; nightlyRate?: number | null; currency?: string | null } | null;
  request?: { summary: string; area?: string | null; checkIn?: string | null; checkOut?: string | null; guests?: number | null; bedrooms?: number | null; budget?: number | null; currency?: string | null } | null;
  matches?: Array<{ propertyId: string; title: string; area?: string | null; nightlyRate?: number | null; currency?: string | null }> | null;
}

export interface WhatsAppGroup {
  groupKey: string;
  groupName: string;
  lastMessageAt?: string | null;
  lastImportAt?: string | null;
  imports: number;
  toReview: number;
  sending: number;
  sent: number;
  hosts: number;
  guests: number;
  contacts: number;
}

export interface WhatsAppGroupContact {
  phone: string;
  name: string;
  names: string[];
  confirmed: boolean;
  source?: string | null;
  updatedAt?: string | null;
}

export interface WhatsAppGroupDetail {
  group: WhatsAppGroup;
  imports: GroupImport[];
  items: GroupImportItem[];
  contacts: WhatsAppGroupContact[];
}

export interface GroupOutreachSettings {
  autoSend: boolean;
  dailyCap: number;
  sentToday: number;
}

export interface GroupImportItemInput {
  phone?: string;
  title?: string;
  area?: string;
  nightlyRate?: number;
  currency?: string;
  summary?: string;
}

const IMPORT_FIELDS = 'importId groupName filename status error createdAt updatedAt messages newMessages hosts guests withoutPhone refused itemCount';
const ITEM_FIELDS = `itemId importId groupName kind sender postedAt text phone phoneSource phoneCandidates lang status sendError
  draft { title area propertyType bedrooms maxGuests nightlyRate currency }
  request { summary area checkIn checkOut guests bedrooms budget currency }
  matches { propertyId title area nightlyRate currency }`;
const GROUP_FIELDS = 'groupKey groupName lastMessageAt lastImportAt imports toReview sending sent hosts guests contacts';
const SEND_FIELDS = 'queued queuedItemIds notQueuedItemIds';
const SETTINGS_FIELDS = 'autoSend dailyCap sentToday';

const errorText = (err: any, fallback: string) => err?.errors?.[0]?.message || err?.message || fallback;

export class GroupImportsApi {
  static async listGroups(): Promise<{ groups: WhatsAppGroup[]; pendingUploads: GroupImport[] }> {
    const data = await GraphQLClient.executeAuthenticated<{ listWhatsAppGroups: { groups: WhatsAppGroup[]; pendingUploads: GroupImport[] } }>(
      `query ListWhatsAppGroups { listWhatsAppGroups { groups { ${GROUP_FIELDS} } pendingUploads { ${IMPORT_FIELDS} } } }`, {});
    return data.listWhatsAppGroups;
  }

  static async getGroup(groupKey: string): Promise<WhatsAppGroupDetail> {
    const data = await GraphQLClient.executeAuthenticated<{ getWhatsAppGroup: WhatsAppGroupDetail }>(
      `query GetWhatsAppGroup($groupKey: ID!) { getWhatsAppGroup(groupKey: $groupKey) {
        group { ${GROUP_FIELDS} } imports { ${IMPORT_FIELDS} } items { ${ITEM_FIELDS} }
        contacts { phone name names confirmed source updatedAt } } }`, { groupKey });
    return data.getWhatsAppGroup;
  }

  /** Upload the export straight to storage, then start the import */
  static async upload(file: File, groupName?: string): Promise<GroupImport> {
    const { createGroupImportUpload: upload } = await GraphQLClient.executeAuthenticated<{ createGroupImportUpload: { uploadUrl: string; s3Key: string } }>(
      `mutation CreateGroupImportUpload($filename: String!) { createGroupImportUpload(filename: $filename) { uploadUrl s3Key } }`, { filename: file.name });
    const put = await fetch(upload.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': /\.zip$/i.test(file.name) ? 'application/zip' : 'text/plain' },
      body: file,
    });
    if (!put.ok) throw new Error(`Upload failed (${put.status})`);
    const data = await GraphQLClient.executeAuthenticated<{ startGroupImport: GroupImport }>(
      `mutation StartGroupImport($s3Key: String!, $filename: String!, $groupName: String) { startGroupImport(s3Key: $s3Key, filename: $filename, groupName: $groupName) { ${IMPORT_FIELDS} } }`,
      { s3Key: upload.s3Key, filename: file.name, groupName: groupName || null });
    return data.startGroupImport;
  }

  static async updateItem(itemId: string, input: GroupImportItemInput): Promise<GroupImportItem> {
    const data = await GraphQLClient.executeAuthenticated<{ updateGroupImportItem: GroupImportItem }>(
      `mutation UpdateGroupImportItem($itemId: ID!, $input: GroupImportItemInput!) { updateGroupImportItem(itemId: $itemId, input: $input) { ${ITEM_FIELDS} } }`, { itemId, input });
    return data.updateGroupImportItem;
  }

  static async skip(itemIds: string[]): Promise<GroupImportItem[]> {
    const data = await GraphQLClient.executeAuthenticated<{ skipGroupImportItems: GroupImportItem[] }>(
      `mutation SkipGroupImportItems($itemIds: [ID!]!) { skipGroupImportItems(itemIds: $itemIds) { ${ITEM_FIELDS} } }`, { itemIds });
    return data.skipGroupImportItems;
  }

  static async send(itemIds: string[]) {
    const data = await GraphQLClient.executeAuthenticated<{ sendGroupImportItems: { queued: number; queuedItemIds: string[]; notQueuedItemIds: string[] } }>(
      `mutation SendGroupImportItems($itemIds: [ID!]!) { sendGroupImportItems(itemIds: $itemIds) { ${SEND_FIELDS} } }`, { itemIds });
    return data.sendGroupImportItems;
  }

  static async sendAll(importId: string) {
    const data = await GraphQLClient.executeAuthenticated<{ sendAllGroupImportItems: { queued: number; queuedItemIds: string[]; notQueuedItemIds: string[] } }>(
      `mutation SendAllGroupImportItems($importId: ID!) { sendAllGroupImportItems(importId: $importId) { ${SEND_FIELDS} } }`, { importId });
    return data.sendAllGroupImportItems;
  }

  static async settings(): Promise<GroupOutreachSettings> {
    const data = await GraphQLClient.executeAuthenticated<{ getGroupOutreachSettings: GroupOutreachSettings }>(
      `query GetGroupOutreachSettings { getGroupOutreachSettings { ${SETTINGS_FIELDS} } }`, {});
    return data.getGroupOutreachSettings;
  }

  static async setAutoSend(enabled: boolean): Promise<GroupOutreachSettings> {
    const data = await GraphQLClient.executeAuthenticated<{ setGroupOutreachAutoSend: GroupOutreachSettings }>(
      `mutation SetGroupOutreachAutoSend($enabled: Boolean!) { setGroupOutreachAutoSend(enabled: $enabled) { ${SETTINGS_FIELDS} } }`, { enabled });
    return data.setGroupOutreachAutoSend;
  }

  static async importContacts(text: string, filename: string, groupName?: string) {
    const data = await GraphQLClient.executeAuthenticated<{ importGroupContacts: { saved: number; skipped: number; groups: string[]; conflicts: string[] } }>(
      `mutation ImportGroupContacts($text: String!, $filename: String, $groupName: String) { importGroupContacts(text: $text, filename: $filename, groupName: $groupName) { saved skipped groups conflicts } }`,
      { text, filename, groupName: groupName || null });
    return data.importGroupContacts;
  }

  static errorText = errorText;
}

export const STAYS_URL = process.env.NEXT_PUBLIC_STAYS_URL || 'https://www.ndotonistays.com';

export function formatMoney(amount?: number | null, currency?: string | null): string {
  return amount ? `${currency || 'TZS'} ${Math.round(amount).toLocaleString('en-US')}` : '';
}

/** "3 min ago", "2 h ago", then a short date */
export function timeAgo(iso?: string | null): string {
  if (!iso) return '';
  const ms = Date.now() - Date.parse(iso);
  if (!Number.isFinite(ms)) return '';
  const min = Math.round(ms / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  if (min < 24 * 60) return `${Math.round(min / 60)} h ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

/** Export times are the group's local time without an offset: show them as written */
export function postedLabel(postedAt: string): string {
  const [date, time] = postedAt.split('T');
  const d = new Date(`${date}T00:00:00`);
  return `${d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}, ${time.slice(0, 5)}`;
}
