/**
 * MessageTemplate API Model (DTO)
 */
export interface MessageTemplateJson {
      id: string;
      key: string;
      channel: string;
      subject: string | null;
      body: string;
      language: string;
      isActive: boolean;
      tenantId: string | null;
      description: string | null;
      placeholderSchema: string | null;
      designVariables: string | null;
      category: string | null;
      tags: string | null;
      usageCount: number;
      lastUsedAt: string | null;
      version: number;
      createdAt: string;
      modifiedAt: string | null;
}

export interface MessageTemplateListResponse {
      items: MessageTemplateJson[];
      totalCount: number;
      page: number;
      pageSize: number;
}
