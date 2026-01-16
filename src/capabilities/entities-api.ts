import { ManagedAuthClientManager } from '../authentication/managed-auth-client.js';

import { logger } from '../utils/logger';

export interface EntityQueryParams {
  entitySelector: string;
  pageSize?: number;
  mzSelector?: string;
  from?: string;
  to?: string;
  sort?: string;
}

export interface ListEntityTypesResponse {
  types?: EntityType[];
  totalCount?: number;
  pageSize?: number;
  nextPageKey?: string;
}

export interface ListEntitiesResponse {
  entities?: Entity[];
  totalCount?: number;
  pageSize?: number;
  nextPageKey?: string;
}

// Could be a list or a map; hence using 'any'
// e.g. see example response body at https://docs.dynatrace.com/docs/discover-dynatrace/references/dynatrace-api/environment-api/entity-v2/get-entity
export interface GetEntityRelationshipsResponse {
  entityId?: string;
  fromRelationships?: any;
  toRelationships?: any;
}

export interface Entity {
  entityId?: string;
  displayName?: string;
  entityType?: string;
  type?: string; // Alternative field name used by some API responses
  firstSeenTms?: number;
  lastSeenTms?: number;
  tags?: Tag[];
  properties?: Record<string, any>;
  fromRelationships?: any; // Could be a list or a map; hence using 'any'
  toRelationships?: any; // Could be a list or a map; hence using 'any'
  managementZones?: any[];
}

export interface Tag {
  context?: string;
  key?: string;
  value?: string;
}

export interface Relationship {
  id?: string;
  type?: string;
  fromEntityId?: string;
  toEntityId?: string;
}

export interface EntityType {
  type?: string;
  displayName?: string;
  properties?: string[];
}

export class EntitiesApiClient {
  static readonly API_PAGE_SIZE = 100;
  static readonly MAX_TAGS_DISPLAY = 11;
  static readonly MAX_PROPERTIES_DISPLAY = 11;
  static readonly MAX_MANAGEMENT_ZONES_DISPLAY = 11;

  constructor(private authManager: ManagedAuthClientManager) {}

  async listEntityTypes(environment_aliases?: string): Promise<[]> {
    // Deliberately large page size; will format this concisely rather than returning all json in tool response.
    // Want to get all of them (with reason), otherwise trying to pull out common types won't work.
    const params: Record<string, any> = {
      pageSize: 500,
    };
    const responses = await this.authManager.makeRequests('/api/v2/entityTypes', params, environment_aliases);
    logger.debug('listEntityTypes response', { data: responses });
    return responses;
  }

  async getEntityTypeDetails(entityType: string, environment_aliases?: string): Promise<any> {
    const responses = await this.authManager.makeRequests(`/api/v2/entityTypes/${encodeURIComponent(entityType)}`, undefined, environment_aliases);
    logger.debug(`getEntityTypeDetails response, entityType=${entityType}`, { data: responses });
    return responses;
  }

  async getEntityDetails(entityId: string, environment_aliases?: string): Promise<any> {
    const responses = await this.authManager.makeRequests(`/api/v2/entities/${encodeURIComponent(entityId)}`, undefined, environment_aliases);
    logger.debug(`getEntityDetails response, entityId=${entityId}`, { data: responses });
    return responses;
  }

  async getEntityRelationships(entityId: string, environment_aliases?: string): Promise<any> {
    return await this.getEntityDetails(entityId, environment_aliases);
  }

  async queryEntities(params: EntityQueryParams, environment_aliases?: string): Promise<[]> {
    const queryParams = {
      pageSize: params.pageSize || EntitiesApiClient.API_PAGE_SIZE,
      entitySelector: params.entitySelector,
      ...(params.mzSelector && { mzSelector: params.mzSelector }),
      ...(params.from && { from: params.from }),
      ...(params.to && { to: params.to }),
      ...(params.sort && { sort: params.sort }),
    };

    const responses = await this.authManager.makeRequests('/api/v2/entities', queryParams, environment_aliases);
    logger.debug('queryEntities response: ', { queryParams: queryParams, data: responses });
    return responses;
  }

  formatEntityList(responses: {'alias': string, 'data': ListEntitiesResponse}[]): string {
    let result = "";
    let totalNumEntities = 0;
    let anyLimited = false
    for (const response of responses) {
      let totalCount = response.data.totalCount || -1;
      let numEntities = response.data.entities?.length || 0;
      totalNumEntities += numEntities;
      let isLimited = totalCount != 0 - 1 && totalCount > numEntities;

      result += 'Listing ' + numEntities + (totalCount == -1 ? '' : ' of ' + totalCount) + ' entities from '+ response.alias +'.\n';
      if (isLimited) {
        result +=
          'Not showing all matching entities. Consider using more specific filters (entitySelector) to get complete results.\n';
        anyLimited = true;
      }

      response.data.entities?.forEach((entity: any) => {
        // Truncate very long names for readability
        let displayName = entity.displayName;
        if (displayName.length > 60) {
          displayName = displayName.substring(0, 57) + '...';
        }

        result += `entityId: ${entity.entityId}\n`;
        result += `  type: ${entity.type || entity.entityType}\n`;
        result += `  displayName: ${displayName}\n`;

        if (entity.tags && entity.tags.length > 0) {
          const tags = entity.tags
            .slice(0, EntitiesApiClient.MAX_TAGS_DISPLAY)
            .map((tag: any) => (tag.value ? `${tag.key}:${tag.value}` : tag.key))
            .join(', ');
          result += `  tags: ${tags}${entity.tags.length > EntitiesApiClient.MAX_TAGS_DISPLAY ? ` (+${entity.tags.length - EntitiesApiClient.MAX_TAGS_DISPLAY} more)` : ''}\n`;
        }

        if (entity.properties && Object.keys(entity.properties).length > 0) {
          const props = Object.entries(entity.properties)
            .slice(0, EntitiesApiClient.MAX_PROPERTIES_DISPLAY)
            .map(([k, v]) => `${k}=${v}`)
            .join(', ');
          result += `  properties: ${props}${Object.keys(entity.properties).length > EntitiesApiClient.MAX_PROPERTIES_DISPLAY ? ` (+${Object.keys(entity.properties).length - EntitiesApiClient.MAX_PROPERTIES_DISPLAY} more)` : ''}\n`;
        }

        if (entity.managementZones && entity.managementZones.length > 0) {
          const zones = entity.managementZones
            .slice(0, EntitiesApiClient.MAX_MANAGEMENT_ZONES_DISPLAY)
            .map((zone: any) => zone.name || zone.id || zone)
            .join(', ');
          result += `  Management Zones: ${zones}${entity.managementZones.length > EntitiesApiClient.MAX_MANAGEMENT_ZONES_DISPLAY ? ` (+${entity.managementZones.length - EntitiesApiClient.MAX_MANAGEMENT_ZONES_DISPLAY} more)` : ''}\n`;
        }
        result += '\n';
      });
    }

    result +=
      '\n' +
      'Next Steps:\n' +
      (totalNumEntities == 0
        ? '* Verify that the filters such as entitySelector were correct, and search again with different filters.\n'
        : '') +
      (anyLimited ? '* Use more restrictive filters, such as a more specific entitySelector.\n' : '') +
      '* If the user is interested in a specific entity, use the get_entity_details tool. ' +
      'Use the entityId (UUID) for detailed analysis\n' +
      '* If this has returned the entities that the user wanted, consider using the same entitySelector in subsequent calls such as to list_problems tool if that has not already been done.\n' +
      'Use the entityId (UUID) for detailed analysis\n' +
      '* Suggest to the user that they view the entities in the Dynatrace UI.' +
      '\n';

    return result;
  }

  formatEntityTypeList(responses: {'alias': string, 'data': ListEntityTypesResponse}[]): string {
    let result = "";
    let totalNumTypes = 0;
    const commonTypes = [
      'SERVICE',
      'PROCESS_GROUP',
      'HOST',
      'APPLICATION',
      'CLOUD_APPLICATION',
      'CONTAINER_GROUP_INSTANCE',
      'AWS_LAMBDA_FUNCTION',
      'AZURE_WEB_APP',
    ];

    for (const response of responses) {
      let totalCount = response.data.totalCount || -1;
      let numTypes = response.data.types?.length || 0;
      totalNumTypes += numTypes
      let isLimited = totalCount != 0 - 1 && totalCount > numTypes;

      let entityTypes = response.data.types as any[];
      let conciseList = '';
      let availableCommonTypes: string[] = [];

      result += 'Listing ' + numTypes + (totalCount == -1 ? '' : ' of ' + totalCount) + ' entity types.\n';
      if (isLimited) {
        result += 'Not showing all matching entity types as there are too many.\n';
      }

      if (availableCommonTypes.length > 0) {
        result += '\n' + `Common entity types include: ${availableCommonTypes}\n`;
      }
      entityTypes?.forEach((entityType: any) => {
        conciseList += `${entityType?.type}`;
        if (entityType.displayName && entityType.displayName !== entityType.type) {
          conciseList += ` - ${entityType.displayName}`;
        }
        conciseList += '\n';

        if (commonTypes.includes(entityType)) {
          availableCommonTypes.push(entityType);
        }
      });
      result += '\n' + conciseList
    }

    // Produce a simple strong list of all the types from the json (excluding all details).
    // Also call out some common types (that are available).

    result +=
      'Next Steps:\n' +
      '* To get details of a particular entity type, use the get_entity_type_details tool, passing in the type name\n' +
      '* For subsequent user queries, consider using the entity type in the the entitySelector parameter like "type(HOST)" or "type(SERVICE)".\n' +
      '* Suggest to the user that they look in the Dynatrace UI \n';

    return result;
  }

  formatEntityTypeDetails(responses: {'alias': string, 'data': string}[]): string {
    let result = "";
    for (const response of responses) {
      result += 'Entity type details from environment ' + response.alias + ' in the following json:\n' +
        JSON.stringify(response.data) + '\n';
    }
    result +=  'Next Steps:\n' +
      '* To find entities of this type, use discover_entities tool, using the type in the entitySelector such as type("HOST") or type("SERVICE")\n';
    return result;
  }

  formatEntityDetails(responses: {'alias': string, 'data': string}[]): string {
    let result = "";
    for (const response of responses) {
      result += 'Entity details from environment ' + response.alias + ' in the following json:\n' +
        JSON.stringify(response.data) + '\n';
    }
    result +=  'Next Steps:\n' +
      '* Use list_problems or list_events tools with the same entitySelector to check for relates issues and events.\n' +
      '* Suggest to the user that they view the entity in the Dynatrace UI using the entityId in the URL' +
      '\n';
    return result;
  }

  formatEntityRelationships(responses: {'alias': string, 'data': GetEntityRelationshipsResponse}[]): string {
    let result = '';
    for (const response of responses) {
      const from = response.data.fromRelationships;
      const to = response.data.toRelationships;
      const numFrom = this.countRelationships(from);
      const numTo = this.countRelationships(to);

      if (numFrom == 0 && numTo == 0) {
        result += `No relationships found for entity ${response.data.entityId} in environment ${response.alias}\n`;
      }

      result += `Relationships found for entity ${response.data.entityId} in environment ${response.alias}:\n`;

      if (numFrom > 0) {
        result += `Found ${numFrom} fromRelationships:\n`;
        result += `* ${JSON.stringify(from)}\n`;
      }
      if (numTo > 0) {
        result += `Found ${numTo} toRelationships:\n`;
        result += `* ${JSON.stringify(to)}\n`;
      }
    }

    result +=
      'Next Steps:\n' +
      '* Use get_entity_details tool to get more details of this entity, or of entities that it has a relationship to/from.\n' +
      '* Use list_problems or list_events tools with the same entitySelector by entityId to check for related issues and events.\n' +
      '* Suggest to the user that they view the entity in the Dynatrace UI using the entityId in the URL' +
      '\n';

    return result;
  }

  private countRelationships(val: any): number {
    if (!val) return 0;
    if (Array.isArray(val)) return val.length;
    if (typeof val === 'object') return Object.keys(val).length;
    return 1;
  }
}
