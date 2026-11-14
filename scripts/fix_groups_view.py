path = r"E:\Scripe_pro\SCRIPE-Frontend-academy-s0-s8\src\modules\academy\groups\src\presentation\views\AcademyGroupsView.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix 1: assignAthlete call
content = content.replace(
    """  const handleAssignAthleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollmentIdInput || !assignStartDate) return;
    try {
      await assignAthlete(enrollmentIdInput, assignStartDate);""",
    """  const handleAssignAthleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !enrollmentIdInput || !assignStartDate) return;
    try {
      await assignAthlete(selectedGroup.id, { enrollmentId: enrollmentIdInput, startDate: assignStartDate });"""
)

# Fix 2: transferAthlete call
content = content.replace(
    """  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferTargetItem || !targetGroupIdInput || !transferEffectiveDate) return;
    try {
      await transferAthlete(
        transferTargetItem.membershipId,
        targetGroupIdInput,
        transferReasonInput || undefined,
        transferEffectiveDate
      );""",
    """  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !transferTargetItem || !targetGroupIdInput || !transferEffectiveDate) return;
    try {
      await transferAthlete(
        selectedGroup.id,
        transferTargetItem.membershipId,
        {
          targetGroupId: targetGroupIdInput,
          effectiveDate: transferEffectiveDate,
          transferReason: transferReasonInput || undefined
        }
      );"""
)

# Fix 3: removeAthlete call
content = content.replace(
    """  const handleRemoveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!removeTargetItem) return;
    try {
      await removeAthlete(removeTargetItem.membershipId, removeReasonInput || undefined);""",
    """  const handleRemoveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !removeTargetItem) return;
    try {
      await removeAthlete(selectedGroup.id, removeTargetItem.membershipId, removeReasonInput || undefined);"""
)

# Fix 4: assignCoach call
content = content.replace(
    """  const handleAssignCoachSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffMemberIdInput || !coachAssignedDate) return;
    try {
      await assignCoach(staffMemberIdInput, coachRoleInput, coachAssignedDate);""",
    """  const handleAssignCoachSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !staffMemberIdInput || !coachAssignedDate) return;
    try {
      await assignCoach(selectedGroup.id, {
        staffMemberId: staffMemberIdInput,
        role: coachRoleInput,
        assignedDate: coachAssignedDate
      });"""
)

# Fix 5: GenericSelect onChange val typing
content = content.replace("onChange={val => setCreateOfferingId(val)}", "onChange={(val: string) => setCreateOfferingId(val)}")
content = content.replace("onChange={val => setEnrollmentIdInput(val)}", "onChange={(val: string) => setEnrollmentIdInput(val)}")
content = content.replace("onChange={val => setTargetGroupIdInput(val)}", "onChange={(val: string) => setTargetGroupIdInput(val)}")
content = content.replace("onChange={val => setStaffMemberIdInput(val)}", "onChange={(val: string) => setStaffMemberIdInput(val)}")

# Fix 6: EditTrainingGroupModal isOpen prop
content = content.replace(
    """      {/* MODAL 6: Edit Group Modal */}
      {showEditModal && selectedGroup && (
        <EditTrainingGroupModal
          group={selectedGroup}""",
    """      {/* MODAL 6: Edit Group Modal */}
      {showEditModal && selectedGroup && (
        <EditTrainingGroupModal
          isOpen={showEditModal}
          group={selectedGroup}"""
)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixes applied successfully to AcademyGroupsView.tsx!")
