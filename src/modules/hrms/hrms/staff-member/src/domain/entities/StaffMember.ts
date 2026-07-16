/**
* StaffMember Entity
*
* Domain entity representing a StaffMember.
*/

/**
* StaffMember data from API
*/
export interface StaffMemberData {
id: string;
identityUserId: string;
firstName: string;
lastName: string;
email: string;
jobTitle: string;
isActive: boolean;
createdAt: string;
modifiedAt?: string;
}

/**
* StaffMember entity class
*/
export class StaffMember {
constructor(public readonly data: StaffMemberData) {}

get id(): string {
return this.data.id;
}

get identityUserId(): string {
return this.data.identityUserId;
}

get firstName(): string {
return this.data.firstName;
}

get lastName(): string {
return this.data.lastName;
}

get email(): string {
return this.data.email;
}

get jobTitle(): string {
return this.data.jobTitle;
}

get isActive(): boolean {
return this.data.isActive;
}

get createdAt(): string {
return this.data.createdAt;
}

get modifiedAt(): string | undefined {
return this.data.modifiedAt;
}
}