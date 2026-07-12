/**
* StaffAvailability Entity
*
* Domain entity representing a StaffAvailability.
*/

/**
* StaffAvailability data from API
*/
export interface StaffAvailabilityData {
id: string;
staffMemberId: string;
dayOfWeek: number;
startTime: string;
endTime: string;
isAvailable: boolean;
createdAt: string;
modifiedAt?: string;
}

/**
* StaffAvailability entity class
*/
export class StaffAvailability {
constructor(public readonly data: StaffAvailabilityData) {}

get id(): string {
return this.data.id;
}

get staffMemberId(): string {
return this.data.staffMemberId;
}

get dayOfWeek(): number {
return this.data.dayOfWeek;
}

get startTime(): string {
return this.data.startTime;
}

get endTime(): string {
return this.data.endTime;
}

get isAvailable(): boolean {
return this.data.isAvailable;
}

get createdAt(): string {
return this.data.createdAt;
}

get modifiedAt(): string | undefined {
return this.data.modifiedAt;
}
}