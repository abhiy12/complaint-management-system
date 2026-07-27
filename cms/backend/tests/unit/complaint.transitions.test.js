const complaintService = require('../../services/complaint.service');

describe('Complaint status transitions', () => {
  test('open can transition to assigned or cancelled only', () => {
    expect(complaintService.TRANSITIONS.open).toEqual(['assigned', 'cancelled']);
  });

  test('closed and cancelled are terminal states', () => {
    expect(complaintService.TRANSITIONS.closed).toEqual([]);
    expect(complaintService.TRANSITIONS.cancelled).toEqual([]);
  });

  test('completed can be reopened to in_progress or moved to closed', () => {
    expect(complaintService.TRANSITIONS.completed).toEqual(['closed', 'in_progress']);
  });
});
