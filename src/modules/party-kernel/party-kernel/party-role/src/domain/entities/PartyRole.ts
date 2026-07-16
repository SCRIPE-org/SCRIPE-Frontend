/**
* PartyRole Entity
*
* Domain entity representing a PartyRole.
*/

/**
* PartyRole data from API
*/
export interface PartyRoleData {
id: string;
partyId: string;
roleType: string;
createdAt: string;
modifiedAt?: string;
}

/**
* PartyRole entity class
*/
export class PartyRole {
constructor(public readonly data: PartyRoleData) {}

get id(): string {
return this.data.id;
}

get partyId(): string {
return this.data.partyId;
}

get roleType(): string {
return this.data.roleType;
}

get createdAt(): string {
return this.data.createdAt;
}

get modifiedAt(): string | undefined {
return this.data.modifiedAt;
}
}