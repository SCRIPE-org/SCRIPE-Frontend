"use client";

import {
  getCustomFieldsExtension,
  type RestrictableCustomFieldKey,
  type UseRestrictableCustomFieldKeysArgs,
  type UseRestrictableCustomFieldKeysResult,
} from "@core/crud/customFieldsExtension";

export type {
  RestrictableCustomFieldKey,
  UseRestrictableCustomFieldKeysArgs,
  UseRestrictableCustomFieldKeysResult,
};

const DEFAULT_RESULT: UseRestrictableCustomFieldKeysResult = {
  keys: [],
  isLoading: false,
  isError: false,
  isTruncated: false,
  isAvailable: false,
};

export function useRestrictableCustomFieldKeys(
  permissionResource: string | undefined,
  args?: UseRestrictableCustomFieldKeysArgs
): UseRestrictableCustomFieldKeysResult {
  const api = getCustomFieldsExtension();
  if (api?.useRestrictableCustomFieldKeys) {
    return api.useRestrictableCustomFieldKeys(permissionResource, args);
  }
  return DEFAULT_RESULT;
}
