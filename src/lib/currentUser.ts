import { getContext } from '@microsoft/power-apps/app';
import { SystemusersService } from '../generated/services/SystemusersService';
import { BookableresourcesService } from '../generated/services/BookableresourcesService';

export interface CurrentUser {
  fullName: string;
  email?: string;
  upn?: string;
  objectId?: string;
  systemUserId?: string;
  bookableResourceId?: string;
  bookableResourceName?: string;
  organizationalUnitId?: string;
  organizationalUnitName?: string;
}

let cached: CurrentUser | null = null;
const CONTEXT_TIMEOUT_MS = 12000;

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/**
 * Resolves the signed-in Power Apps user to their Dataverse systemuser and
 * bookableresource (employee) records, so pages can show "my" data.
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  if (cached) return cached;

  const ctx = await withTimeout(
    getContext(),
    CONTEXT_TIMEOUT_MS,
    'Power Apps context timed out. Open this app via the "Local Play" URL from the dev server output.',
  );
  const user: CurrentUser = {
    fullName: ctx.user.fullName ?? 'User',
    email: ctx.user.userPrincipalName,
    upn: ctx.user.userPrincipalName,
    objectId: ctx.user.objectId,
  };

  try {
    if (user.objectId) {
      const su = await SystemusersService.getAll({
        select: ['systemuserid', 'fullname', 'internalemailaddress'],
        filter: `azureactivedirectoryobjectid eq ${user.objectId}`,
        top: 1,
      });
      const rec = su.data?.[0];
      if (rec) {
        user.systemUserId = rec.systemuserid;
        if (rec.fullname) user.fullName = rec.fullname;
        if (rec.internalemailaddress) user.email = rec.internalemailaddress;
      }
    }

    if (user.systemUserId) {
      const br = await BookableresourcesService.getAll({
        select: [
          'bookableresourceid',
          'name',
          '_msdyn_organizationalunit_value',
          'msdyn_organizationalunitname',
        ],
        filter: `_userid_value eq ${user.systemUserId}`,
        top: 1,
      });
      const rec = br.data?.[0];
      if (rec) {
        user.bookableResourceId = rec.bookableresourceid as string;
        user.bookableResourceName = rec.name as string;
        user.organizationalUnitId = rec._msdyn_organizationalunit_value;
        user.organizationalUnitName = rec.msdyn_organizationalunitname;
      }
    }
  } catch (err) {
    console.error('Could not resolve current user to Dataverse records', err);
  }

  cached = user;
  return user;
}
