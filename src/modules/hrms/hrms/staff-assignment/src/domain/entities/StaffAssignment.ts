/**
* StaffAssignment Entity
*
* Domain entity representing a StaffAssignment.
*/

/**
* StaffAssignment data from API
*/
export interface StaffAssignmentData {
id: string;
staffMemberId: string;
organizationUnitId: string;
assignmentType: string;
validFrom: Date;
validTo: Date;
createdAt: string;
modifiedAt?: string;
}

/**
* StaffAssignment entity class
*/
export class StaffAssignment {
constructor(public readonly data: StaffAssignmentData) {}

get id(): string {
return this.data.id;
}

get staffMemberId(): string {
return this.data.staffMemberId;
}

get organizationUnitId(): string {
return this.data.organizationUnitId;
}

get assignmentType(): string {
return this.data.assignmentType;
}

get validFrom(): Date {
return this.data.validFrom;
}

get validTo(): Date {
return this.data.validTo;
}

get createdAt(): string {
return this.data.createdAt;
}

get modifiedAt(): string | undefined {
return this.data.modifiedAt;
}
}