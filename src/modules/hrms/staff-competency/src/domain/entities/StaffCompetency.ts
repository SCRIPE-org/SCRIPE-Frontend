/**
* StaffCompetency Entity
*
* Domain entity representing a StaffCompetency.
*/

/**
* StaffCompetency data from API
*/
export interface StaffCompetencyData {
id: string;
staffMemberId: string;
competencyName: string;
level: string;
createdAt: string;
modifiedAt?: string;
}

/**
* StaffCompetency entity class
*/
export class StaffCompetency {
constructor(public readonly data: StaffCompetencyData) {}

get id(): string {
return this.data.id;
}

get staffMemberId(): string {
return this.data.staffMemberId;
}

get competencyName(): string {
return this.data.competencyName;
}

get level(): string {
return this.data.level;
}

get createdAt(): string {
return this.data.createdAt;
}

get modifiedAt(): string | undefined {
return this.data.modifiedAt;
}
}