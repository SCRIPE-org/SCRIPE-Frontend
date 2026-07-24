/**
* MergeCandidate Entity
*
* Domain entity representing a MergeCandidate.
*/

/**
* MergeCandidate data from API
*/
export interface MergeCandidateData {
id: string;
primaryPartyId: string;
duplicatePartyId: string;
status: string;
reason: string;
/** Confidence score (0-1) that the two parties are the same entity. */
matchScore?: number;
createdAt: string;
modifiedAt?: string;
}

/**
* MergeCandidate entity class
*/
export class MergeCandidate {
constructor(public readonly data: MergeCandidateData) {}

get id(): string {
return this.data.id;
}

get primaryPartyId(): string {
return this.data.primaryPartyId;
}

get duplicatePartyId(): string {
return this.data.duplicatePartyId;
}

get status(): string {
return this.data.status;
}

get reason(): string {
return this.data.reason;
}

get matchScore(): number | undefined {
return this.data.matchScore;
}

get createdAt(): string {
return this.data.createdAt;
}

get modifiedAt(): string | undefined {
return this.data.modifiedAt;
}
}