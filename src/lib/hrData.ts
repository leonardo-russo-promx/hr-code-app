import { BookableresourcesService } from '../generated/services/BookableresourcesService';
import { Promx_holidayrequestsService } from '../generated/services/Promx_holidayrequestsService';
import { Promx_holidayallowancesService } from '../generated/services/Promx_holidayallowancesService';
import { Promx_localholidaiesService } from '../generated/services/Promx_localholidaiesService';
import { Promx_holidayareasService } from '../generated/services/Promx_holidayareasService';
import { SystemusersService } from '../generated/services/SystemusersService';
import { Office365UsersService } from '../generated/services/Office365UsersService';
import type { GraphUser_V1 } from '../generated/models/Office365UsersModel';
import { holidayTypeLabel, lengthTypeLabel, statusLabel } from './format';

/** Resolves systemuser GUIDs to full names in a single query. */
async function resolveSystemUserNames(ids: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const unique = Array.from(new Set(ids.filter(Boolean)));
  if (unique.length === 0) return map;
  const filter = unique.map((id) => `systemuserid eq ${id}`).join(' or ');
  try {
    const res = await SystemusersService.getAll({
      select: ['systemuserid', 'fullname'],
      filter,
      top: unique.length,
    });
    for (const u of res.data ?? []) {
      if (u.systemuserid && u.fullname) map.set(u.systemuserid as string, u.fullname);
    }
  } catch (err) {
    console.error('Resolve system user names failed', err);
  }
  return map;
}

export interface RequestVM {
  id: string;
  from?: string;
  to?: string;
  type: string;
  length: string;
  statuscode?: number;
  status: string;
  requestedDays?: number;
  approvedDays?: number;
  resourceName?: string;
  approverName?: string;
}

export interface AllowanceVM {
  id: string;
  year: string;
  allowed?: number;
  remaining?: number;
  approved?: number;
}

export interface LocalHolidayVM {
  name: string;
  date?: string;
  area?: string;
}

export interface HolidayAreaVM {
  id: string;
  name: string;
}

const WORKERTYPE_EMPLOYEE = 192350000;

export async function getEmployeeCount(): Promise<number> {
  const res = await BookableresourcesService.getAll({
    select: ['bookableresourceid'],
    filter: `statecode eq 0 and msdyn_workertype eq ${WORKERTYPE_EMPLOYEE}`,
    top: 5000,
  });
  return res.data?.length ?? 0;
}

export async function getMyRequests(bookableResourceId?: string): Promise<RequestVM[]> {
  const options: Parameters<typeof Promx_holidayrequestsService.getAll>[0] = {
    select: [
      'promx_holidayrequestid',
      'promx_from',
      'promx_to',
      'promx_holidaytype',
      'promx_lengthtype',
      'statuscode',
      'promx_requesteddays',
      'promx_approveddays',
      'promx_resourcename',
      '_promx_approverid_value',
    ],
    orderBy: ['promx_from desc'],
    top: 200,
  };
  if (bookableResourceId) {
    options.filter = `_promx_resourceid_value eq ${bookableResourceId}`;
  }
  const res = await Promx_holidayrequestsService.getAll(options);
  const data = res.data ?? [];
  const approverNames = await resolveSystemUserNames(
    data.map((r) => r._promx_approverid_value).filter(Boolean) as string[],
  );
  return data.map((r) => ({
    id: r.promx_holidayrequestid as string,
    from: r.promx_from,
    to: r.promx_to,
    type: holidayTypeLabel(r.promx_holidaytype as number | undefined),
    length: lengthTypeLabel(r.promx_lengthtype as number | undefined),
    statuscode: r.statuscode as number | undefined,
    status: statusLabel(r.statuscode as number | undefined),
    requestedDays: r.promx_requesteddays,
    approvedDays: r.promx_approveddays,
    resourceName: r.promx_resourcename,
    approverName: r._promx_approverid_value
      ? approverNames.get(r._promx_approverid_value)
      : undefined,
  }));
}

export async function getMyAllowances(bookableResourceId?: string): Promise<AllowanceVM[]> {
  if (!bookableResourceId) return [];
  const res = await Promx_holidayallowancesService.getAll({
    select: [
      'promx_holidayallowanceid',
      'promx_allowanceyear',
      'promx_alloweddays',
      'promx_remainingdays',
      'promx_approveddays',
    ],
    filter: `_promx_resourceid_value eq ${bookableResourceId} and statecode eq 0`,
    orderBy: ['promx_allowanceyear desc'],
    top: 20,
  });
  return (res.data ?? []).map((a) => ({
    id: a.promx_holidayallowanceid as string,
    year: a.promx_allowanceyear,
    allowed: a.promx_alloweddays,
    remaining: a.promx_remainingdays,
    approved: a.promx_approveddays,
  }));
}

export interface ManagerVM {
  name: string;
  photoUrl?: string;
  source: 'dataverse' | 'office365';
}

/**
 * Remaining holiday days the current user can still request, from the Dataverse
 * holiday allowance for the current year (same logic the HR agent uses).
 */
export async function getMyRemainingDays(bookableResourceId?: string): Promise<number | undefined> {
  if (!bookableResourceId) return undefined;
  const year = String(new Date().getFullYear());
  try {
    const res = await Promx_holidayallowancesService.getAll({
      select: ['promx_remainingdays'],
      filter: `_promx_resourceid_value eq ${bookableResourceId} and promx_allowanceyear eq '${year}'`,
      top: 1,
    });
    return res.data?.[0]?.promx_remainingdays;
  } catch (err) {
    console.error('Remaining days lookup failed', err);
    return undefined;
  }
}

/**
 * Resolves the current user's approving manager.
 * Name — primary source: the Dataverse default holiday allowance for the current
 * year (same logic the HR agent uses); fallback: the Office 365 (Entra ID) line manager.
 * Photo — always from Office 365 Users (the manager's Entra ID profile photo).
 */
export async function getMyManager(bookableResourceId?: string, upn?: string): Promise<ManagerVM | undefined> {
  const year = String(new Date().getFullYear());

  let dvName: string | undefined;
  if (bookableResourceId) {
    try {
      const res = await Promx_holidayallowancesService.getAll({
        select: ['_promx_resourcesmanagerid_value'],
        filter: `_promx_resourceid_value eq ${bookableResourceId} and promx_defaultallowance eq true and promx_allowanceyear eq '${year}'`,
        top: 1,
      });
      const managerId = res.data?.[0]?._promx_resourcesmanagerid_value;
      if (managerId) {
        const names = await resolveSystemUserNames([managerId]);
        dvName = names.get(managerId);
      }
    } catch (err) {
      console.error('Dataverse manager lookup failed', err);
    }
  }

  let o365Name: string | undefined;
  let photoUrl: string | undefined;
  if (upn) {
    try {
      const res = await Office365UsersService.Manager_V2(upn, 'id,displayName');
      const mgr = res.data as GraphUser_V1 | undefined;
      o365Name = mgr?.displayName;
      if (mgr?.id) {
        photoUrl = await getUserPhotoUrl(mgr.id);
      }
    } catch (err) {
      console.error('Office 365 manager lookup failed', err);
    }
  }

  const name = dvName ?? o365Name;
  if (!name) return undefined;
  return { name, photoUrl, source: dvName ? 'dataverse' : 'office365' };
}

/** Fetches an Office 365 user's profile photo as a renderable data URL, or undefined if none. */
async function getUserPhotoUrl(userId: string): Promise<string | undefined> {
  try {
    const res = await Office365UsersService.UserPhoto_V2(userId);
    const raw = res.data;
    if (!raw) return undefined;
    return raw.startsWith('data:') ? raw : `data:image/jpeg;base64,${raw}`;
  } catch {
    // No photo set, or access denied — silently fall back to initials.
    return undefined;
  }
}

/** Returns the list of holiday areas (locations) for the area filter. */
export async function getHolidayAreas(): Promise<HolidayAreaVM[]> {
  const res = await Promx_holidayareasService.getAll({
    select: ['promx_holidayareaid', 'promx_area'],
    filter: 'statecode eq 0',
    orderBy: ['promx_area asc'],
    top: 200,
  });
  return (res.data ?? [])
    .filter((a) => a.promx_area)
    .map((a) => ({ id: a.promx_holidayareaid as string, name: a.promx_area as string }));
}

/** Returns the current user's holiday area id (may be undefined if not assigned). */
export async function getMyHolidayAreaId(bookableResourceId?: string): Promise<string | undefined> {
  if (!bookableResourceId) return undefined;
  const res = await BookableresourcesService.getAll({
    select: ['bookableresourceid', '_promx_holidayareaid_value'],
    filter: `bookableresourceid eq ${bookableResourceId}`,
    top: 1,
  });
  return res.data?.[0]?._promx_holidayareaid_value ?? undefined;
}

export async function getUpcomingLocalHolidays(
  areaId?: string,
  limit = 12,
): Promise<LocalHolidayVM[]> {
  const options: Parameters<typeof Promx_localholidaiesService.getAll>[0] = {
    select: ['promx_name', 'promx_date', '_promx_holidayareaid_value'],
    orderBy: ['promx_date asc'],
    top: 400,
  };
  if (areaId) {
    options.filter = `_promx_holidayareaid_value eq ${areaId}`;
  }
  const res = await Promx_localholidaiesService.getAll(options);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = (res.data ?? []).filter((h) => {
    if (!h.promx_date) return false;
    const d = new Date(h.promx_date);
    return !isNaN(d.getTime()) && d >= today;
  });

  // Holidays can be duplicated (per area, or duplicate records) — dedupe by name+date.
  const rows = upcoming.filter((h, i, arr) => {
    const key = `${h.promx_name}|${h.promx_date}`;
    return arr.findIndex((x) => `${x.promx_name}|${x.promx_date}` === key) === i;
  });

  return rows.slice(0, limit).map((h) => ({ name: h.promx_name, date: h.promx_date }));
}
